package com.hotelcontinental.feedback_service.repository;

import com.hotelcontinental.feedback_service.entity.Feedbacks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedbacks, String> {
    Optional<Feedbacks> findByRoomBookingDetailIdAndCreatedByAndDeletedFalse(
            String roomBookingDetailId,
            String createdBy
    );

    List<Feedbacks> findByRoomIdAndDeletedFalseOrderByCreatedTimeDesc(String roomId);
}
