package com.hotelcontinental.ai_assistant_service.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiChatResponse {
    AiConversationResponse conversation;
    AiMessageResponse userMessage;
    AiMessageResponse assistantMessage;
    List<AiRoomSuggestionResponse> suggestions;
}
