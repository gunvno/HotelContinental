package com.hotelcontinental.chat_service.dto.response;

import com.hotelcontinental.chat_service.enums.SenderType;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageResponse {
    String id;
    String conversationId;
    String senderId;
    String senderName;
    SenderType senderType;
    String content;
    LocalDateTime readTime;
    LocalDateTime createdTime;
}
