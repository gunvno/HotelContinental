package com.hotelcontinental.chat_service.service.interfaces;

import com.hotelcontinental.chat_service.dto.request.SendMessageRequest;
import com.hotelcontinental.chat_service.dto.response.ChatConversationResponse;
import com.hotelcontinental.chat_service.dto.response.ChatMessageResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatService {
    ChatConversationResponse getOrCreateMyConversation();

    List<ChatConversationResponse> getConversations();

    ChatConversationResponse getConversation(String id);

    List<ChatMessageResponse> getMessages(String conversationId, LocalDateTime after);

    ChatMessageResponse sendCustomerMessage(SendMessageRequest request);

    ChatMessageResponse reply(String conversationId, SendMessageRequest request);

    ChatConversationResponse closeConversation(String conversationId);

    void markAsRead(String conversationId);
}
