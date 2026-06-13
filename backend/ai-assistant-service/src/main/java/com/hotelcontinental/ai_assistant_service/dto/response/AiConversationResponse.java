package com.hotelcontinental.ai_assistant_service.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiConversationResponse {
    String id;
    String customerId;
    String customerName;
    String lastMessage;
    LocalDateTime lastMessageTime;
    LocalDateTime createdTime;
}
