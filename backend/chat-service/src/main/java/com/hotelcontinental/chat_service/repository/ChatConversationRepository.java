package com.hotelcontinental.chat_service.repository;

import com.hotelcontinental.chat_service.entity.ChatConversation;
import com.hotelcontinental.chat_service.enums.ConversationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, String> {
    Optional<ChatConversation> findFirstByCustomerIdAndStatusAndDeletedFalseOrderByCreatedTimeDesc(
            String customerId,
            ConversationStatus status
    );

    @Query("""
            select conversation
            from ChatConversation conversation
            where conversation.deleted = false or conversation.deleted is null
            order by conversation.lastMessageTime desc, conversation.createdTime desc
            """)
    List<ChatConversation> findAllActiveOrderByRecent();
}
