package com.hotelcontinental.ai_assistant_service.repository;

import com.hotelcontinental.ai_assistant_service.entity.AiMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiMessageRepository extends JpaRepository<AiMessage, String> {
    List<AiMessage> findByConversationIdAndDeletedFalseOrderByCreatedTimeAsc(String conversationId);
}
