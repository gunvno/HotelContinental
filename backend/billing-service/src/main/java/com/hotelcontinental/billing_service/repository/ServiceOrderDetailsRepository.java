package com.hotelcontinental.billing_service.repository;

import com.hotelcontinental.billing_service.entity.ServiceOrderDetails;
import com.hotelcontinental.billing_service.enums.ServiceOrderPaymentStatus;
import com.hotelcontinental.billing_service.enums.ServiceOrderSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceOrderDetailsRepository extends JpaRepository<ServiceOrderDetails, String> {
    List<ServiceOrderDetails> findByDeletedFalseOrderByCreatedTimeDesc();

    List<ServiceOrderDetails> findByRoomBookingIdAndDeletedFalseOrderByCreatedTimeDesc(String roomBookingId);

    List<ServiceOrderDetails> findByRoomBookingIdAndPaymentStatusAndDeletedFalseOrderByCreatedTimeDesc(
            String roomBookingId,
            ServiceOrderPaymentStatus paymentStatus
    );

    List<ServiceOrderDetails> findByRoomBookingDetailIdAndDeletedFalseOrderByCreatedTimeDesc(String roomBookingDetailId);

    boolean existsByRoomBookingIdAndServiceIdAndSourceAndDeletedFalse(
            String roomBookingId,
            String serviceId,
            ServiceOrderSource source
    );

    @Query("""
            select coalesce(sum(detail.price * detail.quantity), 0)
            from ServiceOrderDetails detail
            where detail.roomBookingId = :roomBookingId
              and detail.deleted = false
              and (detail.chargeable = true or detail.chargeable is null)
              and (detail.paymentStatus = com.hotelcontinental.billing_service.enums.ServiceOrderPaymentStatus.POST_TO_ROOM
                   or detail.paymentStatus = com.hotelcontinental.billing_service.enums.ServiceOrderPaymentStatus.PAID)
              and (detail.approvalStatus is null
                   or detail.approvalStatus = com.hotelcontinental.billing_service.enums.ServiceOrderApprovalStatus.NOT_REQUIRED
                   or detail.approvalStatus = com.hotelcontinental.billing_service.enums.ServiceOrderApprovalStatus.APPROVED)
            """)
    float sumActiveServiceTotal(@Param("roomBookingId") String roomBookingId);
}
