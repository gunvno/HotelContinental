package com.hotelcontinental.chat_service.entity;

import com.hotelcontinental.chat_service.enums.SenderType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    ChatConversation conversation;

    @Column(name = "sender_id", nullable = false)
    String senderId;

    @Column(name = "sender_name")
    String senderName;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type", nullable = false)
    SenderType senderType;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    String content;

    @Column(name = "read_time")
    LocalDateTime readTime;

    @Column(name = "created_time")
    LocalDateTime createdTime;

    @Column(name = "created_by", length = 100)
    String createdBy;

    @Column(name = "deleted")
    Boolean deleted = false;
}
