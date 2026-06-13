package com.hotelcontinental.billing_service.repository;

import com.hotelcontinental.billing_service.entity.PaymentRequest;
import com.hotelcontinental.billing_service.enums.PaymentRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, String> {
    Optional<PaymentRequest> findFirstByRoomBookingIdAndStatusAndDeletedFalseOrderByCreatedTimeDesc(
            String roomBookingId,
            PaymentRequestStatus status
    );

    Optional<PaymentRequest> findFirstByRoomBookingIdAndDeletedFalseOrderByCreatedTimeDesc(String roomBookingId);
}
