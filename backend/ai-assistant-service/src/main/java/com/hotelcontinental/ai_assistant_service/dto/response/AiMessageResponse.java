package com.hotelcontinental.ai_assistant_service.dto.response;

import com.hotelcontinental.ai_assistant_service.enums.AiSenderType;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiMessageResponse {
    String id;
    String conversationId;
    AiSenderType senderType;
    String content;
    String metadataJson;
    LocalDateTime createdTime;
}
