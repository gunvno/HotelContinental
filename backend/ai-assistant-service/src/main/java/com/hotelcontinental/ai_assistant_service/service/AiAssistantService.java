package com.hotelcontinental.ai_assistant_service.service;

import com.hotelcontinental.ai_assistant_service.dto.request.AiChatRequest;
import com.hotelcontinental.ai_assistant_service.dto.response.AiChatResponse;
import com.hotelcontinental.ai_assistant_service.dto.response.AiConversationResponse;
import com.hotelcontinental.ai_assistant_service.dto.response.AiMessageResponse;

import java.util.List;

public interface AiAssistantService {
    AiConversationResponse getOrCreateMyConversation();

    List<AiMessageResponse> getMyMessages(String conversationId);

    AiChatResponse chat(AiChatRequest request);
}
