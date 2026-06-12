package com.hotelcontinental.chat_service.entity;

import com.hotelcontinental.chat_service.enums.ConversationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "chat_conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatConversation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "customer_id", nullable = false)
    String customerId;

    @Column(name = "customer_name")
    String customerName;

    @Column(name = "assigned_staff_id")
    String assignedStaffId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    ConversationStatus status;

    @Column(name = "last_message")
    String lastMessage;

    @Column(name = "last_message_time")
    LocalDateTime lastMessageTime;

    @Column(name = "created_time")
    LocalDateTime createdTime;

    @Column(name = "created_by", length = 100)
    String createdBy;

    @Column(name = "modified_time")
    LocalDateTime modifiedTime;

    @Column(name = "modified_by", length = 100)
    String modifiedBy;

    @Column(name = "deleted")
    Boolean deleted = false;

    @Column(name = "deleted_time")
    LocalDateTime deletedTime;

    @Column(name = "deleted_by", length = 100)
    String deletedBy;

    @OneToMany(mappedBy = "conversation")
    List<ChatMessage> messages;
}
