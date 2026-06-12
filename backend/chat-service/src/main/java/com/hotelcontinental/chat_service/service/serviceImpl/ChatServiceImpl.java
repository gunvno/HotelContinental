package com.hotelcontinental.chat_service.service.serviceImpl;

import com.hotelcontinental.chat_service.dto.request.SendMessageRequest;
import com.hotelcontinental.chat_service.dto.response.ChatConversationResponse;
import com.hotelcontinental.chat_service.dto.response.ChatMessageResponse;
import com.hotelcontinental.chat_service.entity.ChatConversation;
import com.hotelcontinental.chat_service.entity.ChatMessage;
import com.hotelcontinental.chat_service.enums.ConversationStatus;
import com.hotelcontinental.chat_service.enums.SenderType;
import com.hotelcontinental.chat_service.exception.AppException;
import com.hotelcontinental.chat_service.exception.ErrorCode;
import com.hotelcontinental.chat_service.repository.ChatConversationRepository;
import com.hotelcontinental.chat_service.repository.ChatMessageRepository;
import com.hotelcontinental.chat_service.service.interfaces.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final IdentityUserLookupClient identityUserLookupClient;

    @Transactional
    @Override
    public ChatConversationResponse getOrCreateMyConversation() {
        String customerId = getCurrentUserId();

        ChatConversation conversation = conversationRepository
                .findFirstByCustomerIdAndStatusAndDeletedFalseOrderByCreatedTimeDesc(customerId, ConversationStatus.OPEN)
                .orElseGet(() -> createConversation(customerId));
        syncCustomerDisplayName(conversation);

        return mapConversation(conversation);
    }

    @Override
    public List<ChatConversationResponse> getConversations() {
        return conversationRepository.findAllActiveOrderByRecent().stream()
                .map(this::mapConversation)
                .toList();
    }

    @Override
    public ChatConversationResponse getConversation(String id) {
        ChatConversation conversation = getRequiredConversation(id);
        assertCanAccess(conversation);
        return mapConversation(conversation);
    }

    @Override
    public List<ChatMessageResponse> getMessages(String conversationId, LocalDateTime after) {
        ChatConversation conversation = getRequiredConversation(conversationId);
        assertCanAccess(conversation);

        List<ChatMessage> messages = after != null
                ? messageRepository.findByConversationIdAndDeletedFalseAndCreatedTimeAfterOrderByCreatedTimeAsc(conversationId, after)
                : messageRepository.findByConversationIdAndDeletedFalseOrderByCreatedTimeAsc(conversationId);

        return messages.stream().map(this::mapMessage).toList();
    }

    @Transactional
    @Override
    public ChatMessageResponse sendCustomerMessage(SendMessageRequest request) {
        validateMessage(request);
        ChatConversation conversation = conversationRepository
                .findFirstByCustomerIdAndStatusAndDeletedFalseOrderByCreatedTimeDesc(getCurrentUserId(), ConversationStatus.OPEN)
                .orElseGet(() -> createConversation(getCurrentUserId()));
        syncCustomerDisplayName(conversation);

        return mapMessage(createMessage(conversation, request.getContent(), SenderType.CUSTOMER));
    }

    @Transactional
    @Override
    public ChatMessageResponse reply(String conversationId, SendMessageRequest request) {
        validateMessage(request);
        ChatConversation conversation = getRequiredConversation(conversationId);
        if (conversation.getStatus() == ConversationStatus.CLOSED) {
            throw new AppException(ErrorCode.CONVERSATION_CLOSED);
        }

        String actor = getCurrentUserId();
        if (conversation.getAssignedStaffId() == null) {
            conversation.setAssignedStaffId(actor);
        }
        conversation.setModifiedBy(actor);
        conversation.setModifiedTime(LocalDateTime.now());
        conversation = conversationRepository.save(conversation);

        return mapMessage(createMessage(conversation, request.getContent(), getStaffSenderType()));
    }

    @Transactional
    @Override
    public ChatConversationResponse closeConversation(String conversationId) {
        ChatConversation conversation = getRequiredConversation(conversationId);
        conversation.setStatus(ConversationStatus.CLOSED);
        conversation.setModifiedTime(LocalDateTime.now());
        conversation.setModifiedBy(getCurrentUserId());
        return mapConversation(conversationRepository.save(conversation));
    }

    @Transactional
    @Override
    public void markAsRead(String conversationId) {
        ChatConversation conversation = getRequiredConversation(conversationId);
        assertCanAccess(conversation);

        String currentUserId = getCurrentUserId();
        LocalDateTime now = LocalDateTime.now();
        List<ChatMessage> unreadMessages = messageRepository
                .findByConversationIdAndDeletedFalseOrderByCreatedTimeAsc(conversationId)
                .stream()
                .filter(message -> message.getReadTime() == null)
                .filter(message -> !currentUserId.equals(message.getSenderId()))
                .toList();

        unreadMessages.forEach(message -> message.setReadTime(now));
        messageRepository.saveAll(unreadMessages);
    }

    private ChatConversation createConversation(String customerId) {
        LocalDateTime now = LocalDateTime.now();

        ChatConversation conversation = new ChatConversation();
        conversation.setCustomerId(customerId);
        conversation.setCustomerName(getCurrentDisplayName());
        conversation.setStatus(ConversationStatus.OPEN);
        conversation.setCreatedTime(now);
        conversation.setCreatedBy(customerId);
        conversation.setDeleted(false);
        return conversationRepository.save(conversation);
    }

    private ChatMessage createMessage(ChatConversation conversation, String content, SenderType senderType) {
        LocalDateTime now = LocalDateTime.now();
        String actor = getCurrentUserId();

        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setSenderId(actor);
        message.setSenderName(getCurrentDisplayName());
        message.setSenderType(senderType);
        message.setContent(content.trim());
        message.setCreatedTime(now);
        message.setCreatedBy(actor);
        message.setDeleted(false);
        message = messageRepository.save(message);

        conversation.setLastMessage(message.getContent());
        conversation.setLastMessageTime(now);
        conversation.setModifiedTime(now);
        conversation.setModifiedBy(actor);
        conversationRepository.save(conversation);

        return message;
    }

    private void syncCustomerDisplayName(ChatConversation conversation) {
        String displayName = getCurrentDisplayName();
        if (!hasText(displayName) || displayName.equals(conversation.getCustomerName())) {
            return;
        }

        if (!hasText(conversation.getCustomerName()) || conversation.getCustomerId().equals(conversation.getCustomerName())) {
            conversation.setCustomerName(displayName);
            conversation.setModifiedTime(LocalDateTime.now());
            conversation.setModifiedBy(conversation.getCustomerId());
            conversationRepository.save(conversation);
        }
    }

    private ChatConversation getRequiredConversation(String id) {
        return conversationRepository.findById(id)
                .filter(conversation -> !Boolean.TRUE.equals(conversation.getDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
    }

    private void validateMessage(SendMessageRequest request) {
        if (request == null || request.getContent() == null || request.getContent().isBlank()) {
            throw new AppException(ErrorCode.INVALID_CHAT_REQUEST);
        }
        if (request.getContent().trim().length() > 2000) {
            throw new AppException(ErrorCode.INVALID_CHAT_REQUEST);
        }
    }

    private void assertCanAccess(ChatConversation conversation) {
        if (hasAuthority("CHAT_STAFF_VIEW")) {
            return;
        }
        if (!conversation.getCustomerId().equals(getCurrentUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private SenderType getStaffSenderType() {
        return hasAuthority("ROLE_ADMIN") ? SenderType.ADMIN : SenderType.STAFF;
    }

    private boolean hasAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority::equals);
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
            if (hasText(username)) {
                return username;
            }

            String preferredUsername = token.getClaimAsString("preferred_username");
            if (hasText(preferredUsername)) {
                return preferredUsername;
            }

            String email = token.getClaimAsString("email");
            if (hasText(email)) {
                return email;
            }
        }

        return getCurrentUserId();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private ChatConversationResponse mapConversation(ChatConversation conversation) {
        return ChatConversationResponse.builder()
                .id(conversation.getId())
                .customerId(conversation.getCustomerId())
                .customerName(resolveCustomerDisplayName(conversation))
                .assignedStaffId(conversation.getAssignedStaffId())
                .status(conversation.getStatus())
                .lastMessage(conversation.getLastMessage())
                .lastMessageTime(conversation.getLastMessageTime())
                .createdTime(conversation.getCreatedTime())
                .build();
    }

    private String resolveCustomerDisplayName(ChatConversation conversation) {
        String currentName = conversation.getCustomerName();
        if (hasText(currentName) && !currentName.equals(conversation.getCustomerId())) {
            return currentName;
        }

        return identityUserLookupClient.findDisplayName(conversation.getCustomerId())
                .orElse(currentName);
    }

    private ChatMessageResponse mapMessage(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSenderId())
                .senderName(message.getSenderName())
                .senderType(message.getSenderType())
                .content(message.getContent())
                .readTime(message.getReadTime())
                .createdTime(message.getCreatedTime())
                .build();
    }
}
