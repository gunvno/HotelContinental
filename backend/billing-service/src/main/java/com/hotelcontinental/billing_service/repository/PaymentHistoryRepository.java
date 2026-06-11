package com.hotelcontinental.billing_service.repository;

import com.hotelcontinental.billing_service.entity.PaymentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory, String> {
    Optional<PaymentHistory> findFirstByRoomBookingIdAndDeletedFalseOrderByCreatedTimeDesc(String roomBookingId);
    List<PaymentHistory> findByCreatedByAndDeletedFalseOrderByCreatedTimeDesc(String createdBy);
}
