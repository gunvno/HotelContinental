package com.hotelcontinental.chat_service.dto.response;

import com.hotelcontinental.chat_service.enums.ConversationStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatConversationResponse {
    String id;
    String customerId;
    String customerName;
    String assignedStaffId;
    ConversationStatus status;
    String lastMessage;
    LocalDateTime lastMessageTime;
    LocalDateTime createdTime;
}
