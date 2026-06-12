package com.hotelcontinental.chat_service.repository;

import com.hotelcontinental.chat_service.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    List<ChatMessage> findByConversationIdAndDeletedFalseOrderByCreatedTimeAsc(String conversationId);

    List<ChatMessage> findByConversationIdAndDeletedFalseAndCreatedTimeAfterOrderByCreatedTimeAsc(
            String conversationId,
            LocalDateTime after
    );
}
