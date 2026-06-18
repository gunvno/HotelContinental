package com.hotelcontinental.catalog_service.service.serviceImpl;

import com.hotelcontinental.catalog_service.dto.request.roomraterule.RoomRateQuoteRequest;
import com.hotelcontinental.catalog_service.dto.request.roomraterule.RoomRateRuleRequest;
import com.hotelcontinental.catalog_service.dto.response.roomraterule.RoomRateQuoteItemResponse;
import com.hotelcontinental.catalog_service.dto.response.roomraterule.RoomRateQuoteResponse;
import com.hotelcontinental.catalog_service.dto.response.roomraterule.RoomRateRuleResponse;
import com.hotelcontinental.catalog_service.entity.RoomRateRule;
import com.hotelcontinental.catalog_service.entity.RoomTypes;
import com.hotelcontinental.catalog_service.enums.RoomRateRuleType;
import com.hotelcontinental.catalog_service.exception.AppException;
import com.hotelcontinental.catalog_service.exception.ErrorCode;
import com.hotelcontinental.catalog_service.repository.RoomRateRuleRepository;
import com.hotelcontinental.catalog_service.repository.RoomTypeRepository;
import com.hotelcontinental.catalog_service.service.interfaces.RoomRateRuleService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomRateRuleServiceImpl implements RoomRateRuleService {
    private static final BigDecimal DEFAULT_MULTIPLIER = BigDecimal.ONE;

    private final RoomRateRuleRepository roomRateRuleRepository;
    private final RoomTypeRepository roomTypeRepository;

    @PreAuthorize("hasAuthority('ROOM_RATE_RULE_CREATE')")
    @Transactional
    @Override
    public RoomRateRuleResponse createRule(RoomRateRuleRequest request) {
        validateRequest(request);
        String actor = currentUser();

        RoomRateRule rule = RoomRateRule.builder()
                .roomTypeId(blankToNull(request.getRoomTypeId()))
                .name(request.getName().trim())
                .ruleType(request.getRuleType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .daysOfWeek(normalizeDays(request.getDaysOfWeek()))
                .multiplier(request.getMultiplier())
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .note(request.getNote())
                .active(request.getActive() == null || request.getActive())
                .createdBy(actor)
                .createdTime(LocalDateTime.now())
                .build();

        return mapToResponse(roomRateRuleRepository.save(rule));
    }

    @PreAuthorize("hasAuthority('ROOM_RATE_RULE_VIEW')")
    @Override
    public Page<RoomRateRuleResponse> getRules(Pageable pageable) {
        return roomRateRuleRepository.findActiveRecords(pageable).map(this::mapToResponse);
    }

    @PreAuthorize("hasAuthority('ROOM_RATE_RULE_VIEW')")
    @Override
    public RoomRateRuleResponse getRule(String id) {
        return mapToResponse(findRule(id));
    }

    @PreAuthorize("hasAuthority('ROOM_RATE_RULE_UPDATE')")
    @Transactional
    @Override
    public RoomRateRuleResponse updateRule(String id, RoomRateRuleRequest request) {
        validateRequest(request);
        RoomRateRule rule = findRule(id);
        String actor = currentUser();

        RoomRateRule updated = rule.toBuilder()
                .roomTypeId(blankToNull(request.getRoomTypeId()))
                .name(request.getName().trim())
                .ruleType(request.getRuleType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .daysOfWeek(normalizeDays(request.getDaysOfWeek()))
                .multiplier(request.getMultiplier())
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .note(request.getNote())
                .active(request.getActive() == null || request.getActive())
                .modifiedBy(actor)
                .modifiedTime(LocalDateTime.now())
                .build();

        return mapToResponse(roomRateRuleRepository.save(updated));
    }

    @PreAuthorize("hasAuthority('ROOM_RATE_RULE_DELETE')")
    @Transactional
    @Override
    public void deleteRule(String id) {
        RoomRateRule rule = findRule(id);
        String actor = currentUser();
        roomRateRuleRepository.save(rule.toBuilder()
                .deleted(true)
                .deletedBy(actor)
                .deletedTime(LocalDateTime.now())
                .build());
    }

    @Override
    public RoomRateQuoteResponse quote(RoomRateQuoteRequest request) {
        validateQuoteRequest(request);
        String stayType = Optional.ofNullable(request.getStayType()).orElse("NIGHT").toUpperCase(Locale.ROOT);
        BigDecimal total = BigDecimal.ZERO;
        List<RoomRateQuoteItemResponse> items = new ArrayList<>();

        if ("HOUR".equals(stayType)) {
            int hours = Math.max(1, (int) Math.ceil(Duration.between(request.getCheckin(), request.getCheckout()).toMinutes() / 60.0));
            RoomRateQuoteItemResponse item = buildQuoteItem(request.getRoomTypeId(), request.getCheckin().toLocalDate(), request.getBasePrice(), hours);
            items.add(item);
            total = item.getFinalPrice();
        } else {
            LocalDate current = request.getCheckin().toLocalDate();
            LocalDate end = request.getCheckout().toLocalDate();
            if (!current.isBefore(end)) {
                end = current.plusDays(1);
            }

            while (current.isBefore(end)) {
                RoomRateQuoteItemResponse item = buildQuoteItem(request.getRoomTypeId(), current, request.getBasePrice(), 1);
                items.add(item);
                total = total.add(item.getFinalPrice());
                current = current.plusDays(1);
            }
        }

        return RoomRateQuoteResponse.builder()
                .roomTypeId(request.getRoomTypeId())
                .basePrice(request.getBasePrice())
                .totalPrice(total)
                .items(items)
                .build();
    }

    private RoomRateQuoteItemResponse buildQuoteItem(String roomTypeId, LocalDate date, BigDecimal basePrice, int quantity) {
        Optional<RoomRateRule> matchedRule = roomRateRuleRepository.findApplicableRules(blankToNull(roomTypeId), date)
                .stream()
                .filter(rule -> matchesDay(rule.getDaysOfWeek(), date.getDayOfWeek()))
                .findFirst();

        BigDecimal multiplier = matchedRule.map(RoomRateRule::getMultiplier).orElse(DEFAULT_MULTIPLIER);
        BigDecimal finalUnitPrice = basePrice.multiply(multiplier).setScale(0, RoundingMode.HALF_UP);
        BigDecimal finalPrice = finalUnitPrice.multiply(BigDecimal.valueOf(quantity));

        return RoomRateQuoteItemResponse.builder()
                .date(date)
                .basePrice(basePrice)
                .multiplier(multiplier)
                .ruleName(matchedRule.map(RoomRateRule::getName).orElse("Giá tiêu chuẩn"))
                .ruleType(matchedRule.map(rule -> rule.getRuleType().name()).orElse("STANDARD"))
                .finalUnitPrice(finalUnitPrice)
                .quantity(quantity)
                .finalPrice(finalPrice)
                .build();
    }

    private void validateRequest(RoomRateRuleRequest request) {
        if (request == null
                || request.getName() == null
                || request.getName().isBlank()
                || request.getRuleType() == null
                || request.getStartDate() == null
                || request.getEndDate() == null
                || request.getEndDate().isBefore(request.getStartDate())
                || request.getMultiplier() == null
                || request.getMultiplier().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.INVALID_ROOM_RATE_RULE);
        }
        if (request.getRoomTypeId() != null && !request.getRoomTypeId().isBlank()) {
            roomTypeRepository.findById(request.getRoomTypeId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        }
        normalizeDays(request.getDaysOfWeek());
    }

    private void validateQuoteRequest(RoomRateQuoteRequest request) {
        if (request == null
                || request.getBasePrice() == null
                || request.getBasePrice().compareTo(BigDecimal.ZERO) < 0
                || request.getCheckin() == null
                || request.getCheckout() == null
                || !request.getCheckin().isBefore(request.getCheckout())) {
            throw new AppException(ErrorCode.INVALID_ROOM_RATE_RULE);
        }
    }

    private RoomRateRule findRule(String id) {
        return roomRateRuleRepository.findById(id)
                .filter(rule -> !Boolean.TRUE.equals(rule.getDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_RATE_RULE_NOT_FOUND));
    }

    private RoomRateRuleResponse mapToResponse(RoomRateRule rule) {
        String roomTypeName = null;
        if (rule.getRoomTypeId() != null && !rule.getRoomTypeId().isBlank()) {
            roomTypeName = roomTypeRepository.findById(rule.getRoomTypeId())
                    .map(RoomTypes::getName)
                    .orElse(null);
        }

        return RoomRateRuleResponse.builder()
                .id(rule.getId())
                .roomTypeId(rule.getRoomTypeId())
                .roomTypeName(roomTypeName)
                .name(rule.getName())
                .ruleType(rule.getRuleType())
                .startDate(rule.getStartDate())
                .endDate(rule.getEndDate())
                .daysOfWeek(rule.getDaysOfWeek())
                .multiplier(rule.getMultiplier())
                .priority(rule.getPriority())
                .note(rule.getNote())
                .active(rule.getActive())
                .createdBy(rule.getCreatedBy())
                .createdTime(rule.getCreatedTime())
                .modifiedBy(rule.getModifiedBy())
                .modifiedTime(rule.getModifiedTime())
                .deleted(rule.getDeleted())
                .build();
    }

    private String currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return authentication.getName();
    }

    private boolean matchesDay(String daysOfWeek, DayOfWeek dayOfWeek) {
        if (daysOfWeek == null || daysOfWeek.isBlank()) {
            return true;
        }
        return Arrays.stream(daysOfWeek.split(","))
                .map(String::trim)
                .anyMatch(day -> day.equalsIgnoreCase(dayOfWeek.name()));
    }

    private String normalizeDays(String daysOfWeek) {
        if (daysOfWeek == null || daysOfWeek.isBlank()) {
            return null;
        }
        try {
            return Arrays.stream(daysOfWeek.split(","))
                    .map(String::trim)
                    .filter(day -> !day.isBlank())
                    .map(day -> DayOfWeek.valueOf(day.toUpperCase(Locale.ROOT)).name())
                    .distinct()
                    .reduce((left, right) -> left + "," + right)
                    .orElse(null);
        } catch (IllegalArgumentException exception) {
            throw new AppException(ErrorCode.INVALID_ROOM_RATE_RULE);
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
