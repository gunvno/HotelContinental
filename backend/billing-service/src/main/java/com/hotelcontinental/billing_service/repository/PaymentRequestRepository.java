package com.hotelcontinental.billing_service.repository;

import com.hotelcontinental.billing_service.entity.PaymentRequest;
import com.hotelcontinental.billing_service.enums.PaymentRequestPurpose;
import com.hotelcontinental.billing_service.enums.PaymentRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, String> {
    Optional<PaymentRequest> findFirstByRoomBookingIdAndStatusAndDeletedFalseOrderByCreatedTimeDesc(
            String roomBookingId,
            PaymentRequestStatus status
    );

    Optional<PaymentRequest> findFirstByRoomBookingIdAndPurposeAndStatusAndDeletedFalseOrderByCreatedTimeDesc(
            String roomBookingId,
            PaymentRequestPurpose purpose,
            PaymentRequestStatus status
    );

    Optional<PaymentRequest> findFirstByRoomBookingIdAndPurposeAndDeletedFalseOrderByCreatedTimeDesc(
            String roomBookingId,
            PaymentRequestPurpose purpose
    );

    Optional<PaymentRequest> findFirstByServiceOrderIdAndStatusAndDeletedFalseOrderByCreatedTimeDesc(
            String serviceOrderId,
            PaymentRequestStatus status
    );

    Optional<PaymentRequest> findFirstByRoomBookingIdAndDeletedFalseOrderByCreatedTimeDesc(String roomBookingId);

    List<PaymentRequest> findByDeletedFalseOrderByCreatedTimeDesc();

    List<PaymentRequest> findByCreatedByAndDeletedFalseOrderByCreatedTimeDesc(String createdBy);

    List<PaymentRequest> findByStatusAndExpiredTimeBeforeAndDeletedFalse(
            PaymentRequestStatus status,
            LocalDateTime expiredTime
    );

    Optional<PaymentRequest> findFirstByProviderOrderCodeAndDeletedFalse(Long providerOrderCode);
}
