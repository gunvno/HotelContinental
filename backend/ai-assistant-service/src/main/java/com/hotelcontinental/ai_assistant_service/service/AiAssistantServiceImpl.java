package com.hotelcontinental.ai_assistant_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotelcontinental.ai_assistant_service.dto.request.AiChatRequest;
import com.hotelcontinental.ai_assistant_service.dto.response.AiChatResponse;
import com.hotelcontinental.ai_assistant_service.dto.response.AiConversationResponse;
import com.hotelcontinental.ai_assistant_service.dto.response.AiMessageResponse;
import com.hotelcontinental.ai_assistant_service.dto.response.AiRoomSuggestionResponse;
import com.hotelcontinental.ai_assistant_service.entity.AiConversation;
import com.hotelcontinental.ai_assistant_service.entity.AiMessage;
import com.hotelcontinental.ai_assistant_service.enums.AiSenderType;
import com.hotelcontinental.ai_assistant_service.exception.AppException;
import com.hotelcontinental.ai_assistant_service.exception.ErrorCode;
import com.hotelcontinental.ai_assistant_service.repository.AiConversationRepository;
import com.hotelcontinental.ai_assistant_service.repository.AiMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AiAssistantServiceImpl implements AiAssistantService {
    private static final int MAX_MESSAGE_LENGTH = 2000;
    private static final Pattern GUEST_PATTERN = Pattern.compile("(\\d+)\\s*(nguoi|khach)");
    private static final Pattern MONEY_PATTERN = Pattern.compile("(\\d+(?:[\\.,]\\d+)?)\\s*(trieu|tr|k|nghin|vnd|dong)?");
    private static final Pattern ISO_DATE_PATTERN = Pattern.compile("\\b(20\\d{2}-\\d{1,2}-\\d{1,2})\\b");
    private static final Pattern VN_DATE_PATTERN = Pattern.compile("\\b(\\d{1,2})/(\\d{1,2})(?:/(20\\d{2}))?\\b");

    private final AiConversationRepository conversationRepository;
    private final AiMessageRepository messageRepository;
    private final ExternalHotelDataClient hotelDataClient;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('AI_CHAT_VIEW')")
    public AiConversationResponse getOrCreateMyConversation() {
        return mapConversation(getOrCreateConversation());
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('AI_CHAT_VIEW')")
    public List<AiMessageResponse> getMyMessages(String conversationId) {
        AiConversation conversation = getRequiredConversation(conversationId);
        assertOwner(conversation);
        return messageRepository.findByConversationIdAndDeletedFalseOrderByCreatedTimeAsc(conversationId)
                .stream()
                .map(this::mapMessage)
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('AI_CHAT_SEND')")
    public AiChatResponse chat(AiChatRequest request) {
        if (request == null || !StringUtils.hasText(request.getContent())
                || request.getContent().trim().length() > MAX_MESSAGE_LENGTH) {
            throw new AppException(ErrorCode.INVALID_AI_REQUEST);
        }

        AiConversation conversation = StringUtils.hasText(request.getConversationId())
                ? getRequiredConversation(request.getConversationId())
                : getOrCreateConversation();
        assertOwner(conversation);

        AiMessage userMessage = createMessage(conversation, AiSenderType.CUSTOMER, request.getContent().trim(), null);
        SearchCriteria criteria = parseCriteria(request.getContent());
        List<AiRoomSuggestionResponse> suggestions = findSuggestions(criteria);
        String answer = buildAnswer(criteria, suggestions);
        String metadataJson = toJson(Map.of(
                "criteria", criteria.toMetadata(),
                "suggestions", suggestions
        ));
        AiMessage assistantMessage = createMessage(conversation, AiSenderType.AI, answer, metadataJson);

        conversation.setLastMessage(answer);
        conversation.setLastMessageTime(assistantMessage.getCreatedTime());
        conversation.setModifiedTime(assistantMessage.getCreatedTime());
        conversation.setModifiedBy("ai-assistant");
        conversation = conversationRepository.save(conversation);

        return AiChatResponse.builder()
                .conversation(mapConversation(conversation))
                .userMessage(mapMessage(userMessage))
                .assistantMessage(mapMessage(assistantMessage))
                .suggestions(suggestions)
                .build();
    }

    private List<AiRoomSuggestionResponse> findSuggestions(SearchCriteria criteria) {
        List<ExternalHotelDataClient.RoomSnapshot> rooms = hotelDataClient.getRooms();
        List<String> busyRoomIds = criteria.start != null && criteria.end != null
                ? hotelDataClient.getBusyRoomIds(criteria.start, criteria.end)
                : List.of();

        return rooms.stream()
                .filter(room -> !busyRoomIds.contains(room.getId()))
                .filter(room -> criteria.maxBudget == null || priceForStayType(room, criteria.stayType) <= criteria.maxBudget)
                .filter(room -> criteria.keyword == null || searchableText(room).contains(criteria.keyword))
                .sorted(Comparator.comparing(room -> priceForStayType(room, criteria.stayType)))
                .limit(5)
                .map(room -> mapSuggestion(room, criteria))
                .toList();
    }

    private AiRoomSuggestionResponse mapSuggestion(ExternalHotelDataClient.RoomSnapshot room, SearchCriteria criteria) {
        Float price = criteria.stayType.equals("hour") ? room.getPricePerHour() : room.getPricePerDay();
        String reason = "Phù hợp với nhu cầu bạn vừa mô tả";
        if (criteria.maxBudget != null && price != null && price <= criteria.maxBudget) {
            reason = "Giá nằm trong ngân sách bạn đưa ra";
        }
        if (criteria.start != null && criteria.end != null) {
            reason += ", và chưa bị đặt trong khoảng thời gian này";
        }

        return AiRoomSuggestionResponse.builder()
                .roomId(room.getId())
                .roomName(room.getName())
                .image(room.getImage())
                .pricePerDay(room.getPricePerDay())
                .pricePerHour(room.getPricePerHour())
                .description(room.getDescription())
                .reason(reason)
                .build();
    }

    private String buildAnswer(SearchCriteria criteria, List<AiRoomSuggestionResponse> suggestions) {
        if (suggestions.isEmpty()) {
            return "Mình chưa tìm thấy phòng thật sự phù hợp với yêu cầu này. Bạn có thể nới ngân sách, đổi ngày lưu trú hoặc bỏ bớt điều kiện tiện nghi để mình tìm lại.";
        }

        StringBuilder builder = new StringBuilder();
        builder.append("Mình tìm thấy ").append(suggestions.size()).append(" phòng phù hợp");
        if (criteria.maxBudget != null) {
            builder.append(" trong ngân sách khoảng ").append(formatMoney(criteria.maxBudget));
        }
        if (criteria.start != null && criteria.end != null) {
            builder.append(" và còn trống theo thời gian bạn chọn");
        }
        builder.append(". Gợi ý tốt nhất là ").append(suggestions.get(0).getRoomName()).append(".");
        builder.append(" Bạn có thể bấm vào phòng bên dưới để xem chi tiết và đặt phòng.");
        return builder.toString();
    }

    private SearchCriteria parseCriteria(String rawMessage) {
        String normalized = normalize(rawMessage);
        SearchCriteria criteria = new SearchCriteria();
        criteria.stayType = normalized.contains("gio") || normalized.contains("theo gio") ? "hour" : "night";
        criteria.guests = parseGuests(normalized).orElse(null);
        criteria.maxBudget = parseBudget(normalized).orElse(null);
        criteria.keyword = parseKeyword(normalized).orElse(null);

        List<LocalDate> dates = parseDates(normalized);
        if (dates.size() >= 2) {
            criteria.start = LocalDateTime.of(
                    dates.get(0),
                    criteria.stayType.equals("hour") ? LocalTime.of(9, 0) : LocalTime.of(14, 0)
            );
            criteria.end = LocalDateTime.of(dates.get(1), LocalTime.of(12, 0));
        }
        return criteria;
    }

    private Optional<Integer> parseGuests(String normalized) {
        Matcher matcher = GUEST_PATTERN.matcher(normalized);
        return matcher.find() ? Optional.of(Integer.parseInt(matcher.group(1))) : Optional.empty();
    }

    private Optional<Float> parseBudget(String normalized) {
        Matcher matcher = MONEY_PATTERN.matcher(normalized);
        Float best = null;
        while (matcher.find()) {
            if (matcher.group(2) == null) {
                continue;
            }

            float value = Float.parseFloat(matcher.group(1).replace(",", "."));
            String unit = matcher.group(2);
            float amount = switch (unit) {
                case "trieu", "tr" -> value * 1_000_000F;
                case "k", "nghin" -> value * 1_000F;
                default -> value;
            };
            best = best == null ? amount : Math.max(best, amount);
        }
        return Optional.ofNullable(best);
    }

    private Optional<String> parseKeyword(String normalized) {
        Map<String, String> keywords = new LinkedHashMap<>();
        keywords.put("bon tam", "tam");
        keywords.put("bath", "bath");
        keywords.put("wifi", "wifi");
        keywords.put("view", "view");
        keywords.put("thanh pho", "city");
        keywords.put("gia dinh", "family");
        keywords.put("suite", "suite");

        return keywords.entrySet().stream()
                .filter(entry -> normalized.contains(entry.getKey()))
                .map(Map.Entry::getValue)
                .findFirst();
    }

    private List<LocalDate> parseDates(String normalized) {
        List<LocalDate> isoDates = ISO_DATE_PATTERN.matcher(normalized).results()
                .map(result -> parseDate(result.group(1)))
                .flatMap(Optional::stream)
                .toList();
        if (!isoDates.isEmpty()) {
            return isoDates;
        }

        int currentYear = LocalDate.now().getYear();
        return VN_DATE_PATTERN.matcher(normalized).results()
                .map(result -> {
                    int day = Integer.parseInt(result.group(1));
                    int month = Integer.parseInt(result.group(2));
                    int year = result.group(3) != null ? Integer.parseInt(result.group(3)) : currentYear;
                    try {
                        return Optional.of(LocalDate.of(year, month, day));
                    } catch (RuntimeException exception) {
                        return Optional.<LocalDate>empty();
                    }
                })
                .flatMap(Optional::stream)
                .toList();
    }

    private Optional<LocalDate> parseDate(String value) {
        try {
            return Optional.of(LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE));
        } catch (DateTimeParseException exception) {
            return Optional.empty();
        }
    }

    private float priceForStayType(ExternalHotelDataClient.RoomSnapshot room, String stayType) {
        Float price = stayType.equals("hour") ? room.getPricePerHour() : room.getPricePerDay();
        return price != null ? price : Float.MAX_VALUE;
    }

    private String searchableText(ExternalHotelDataClient.RoomSnapshot room) {
        return normalize(String.join(" ", safe(room.getName()), safe(room.getDescription()), safe(room.getRoomSize())));
    }

    private String normalize(String value) {
        String withoutAccent = Normalizer.normalize(safe(value), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return withoutAccent.toLowerCase(Locale.ROOT);
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String formatMoney(float amount) {
        return String.format(Locale.forLanguageTag("vi-VN"), "%,.0f VNĐ", amount);
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            return "{}";
        }
    }

    private AiConversation getOrCreateConversation() {
        String customerId = getCurrentUserId();
        return conversationRepository.findFirstByCustomerIdAndDeletedFalseOrderByModifiedTimeDescCreatedTimeDesc(customerId)
                .orElseGet(() -> {
                    LocalDateTime now = LocalDateTime.now();
                    AiConversation conversation = new AiConversation();
                    conversation.setCustomerId(customerId);
                    conversation.setCustomerName(getCurrentDisplayName());
                    conversation.setCreatedBy(customerId);
                    conversation.setCreatedTime(now);
                    conversation.setModifiedTime(now);
                    conversation.setDeleted(false);
                    return conversationRepository.save(conversation);
                });
    }

    private AiConversation getRequiredConversation(String id) {
        return conversationRepository.findById(id)
                .filter(conversation -> !Boolean.TRUE.equals(conversation.getDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.AI_CONVERSATION_NOT_FOUND));
    }

    private void assertOwner(AiConversation conversation) {
        if (!conversation.getCustomerId().equals(getCurrentUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private AiMessage createMessage(AiConversation conversation, AiSenderType senderType, String content, String metadataJson) {
        LocalDateTime now = LocalDateTime.now();
        AiMessage message = new AiMessage();
        message.setConversation(conversation);
        message.setSenderType(senderType);
        message.setContent(content);
        message.setMetadataJson(metadataJson);
        message.setCreatedTime(now);
        message.setCreatedBy(senderType == AiSenderType.CUSTOMER ? getCurrentUserId() : "ai-assistant");
        message.setDeleted(false);
        return messageRepository.save(message);
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return authentication.getName();
    }

    private String getCurrentDisplayName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            Jwt token = jwtAuthenticationToken.getToken();
            String username = token.getClaimAsString("username");
            if (StringUtils.hasText(username)) {
                return username;
            }
            String email = token.getClaimAsString("email");
            if (StringUtils.hasText(email)) {
                return email;
            }
        }
        return getCurrentUserId();
    }

    private AiConversationResponse mapConversation(AiConversation conversation) {
        return AiConversationResponse.builder()
                .id(conversation.getId())
                .customerId(conversation.getCustomerId())
                .customerName(conversation.getCustomerName())
                .lastMessage(conversation.getLastMessage())
                .lastMessageTime(conversation.getLastMessageTime())
                .createdTime(conversation.getCreatedTime())
                .build();
    }

    private AiMessageResponse mapMessage(AiMessage message) {
        return AiMessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderType(message.getSenderType())
                .content(message.getContent())
                .metadataJson(message.getMetadataJson())
                .createdTime(message.getCreatedTime())
                .build();
    }

    private static class SearchCriteria {
        String stayType = "night";
        Integer guests;
        Float maxBudget;
        String keyword;
        LocalDateTime start;
        LocalDateTime end;

        Map<String, Object> toMetadata() {
            Map<String, Object> metadata = new LinkedHashMap<>();
            metadata.put("stayType", stayType);
            metadata.put("guests", guests);
            metadata.put("maxBudget", maxBudget);
            metadata.put("keyword", keyword);
            metadata.put("start", start);
            metadata.put("end", end);
            return metadata;
        }
    }
}
