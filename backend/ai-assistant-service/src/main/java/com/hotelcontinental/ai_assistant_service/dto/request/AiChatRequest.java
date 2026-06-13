package com.hotelcontinental.ai_assistant_service.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiChatRequest {
    String conversationId;
    String content;
}
