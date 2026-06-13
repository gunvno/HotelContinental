package com.hotelcontinental.ai_assistant_service.repository;

import com.hotelcontinental.ai_assistant_service.entity.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, String> {
    Optional<AiConversation> findFirstByCustomerIdAndDeletedFalseOrderByModifiedTimeDescCreatedTimeDesc(String customerId);
}
