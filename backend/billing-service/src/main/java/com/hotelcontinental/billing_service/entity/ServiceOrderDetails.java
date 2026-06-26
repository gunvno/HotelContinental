package com.hotelcontinental.billing_service.entity;

import com.hotelcontinental.billing_service.enums.ServiceOrderDetailStatus;
import com.hotelcontinental.billing_service.enums.ServiceOrderApprovalStatus;
import com.hotelcontinental.billing_service.enums.ServiceOrderPaymentStatus;
import com.hotelcontinental.billing_service.enums.ServiceOrderSource;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_order_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceOrderDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "service_id", nullable = false)
    String serviceId;

    @Column(name = "service_name_snapshot")
    String serviceNameSnapshot;

    @Column(name = "room_booking_id")
    String roomBookingId;

    @Column(name = "room_booking_detail_id", nullable = false)
    String roomBookingDetailId;

    @Column(name = "room_id")
    String roomId;

    @Column(name = "room_name_snapshot")
    String roomNameSnapshot;

    @Column(name = "quantity", nullable = false)
    int quantity;

    @Column(name = "amount", nullable = false)
    int amount;

    @Column(name = "price", nullable = false)
    float price;

    @Column(name = "description")
    String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    ServiceOrderDetailStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", length = 30)
    ServiceOrderApprovalStatus approvalStatus = ServiceOrderApprovalStatus.NOT_REQUIRED;

    @Enumerated(EnumType.STRING)
    @Column(name = "source")
    ServiceOrderSource source;

    @Column(name = "chargeable")
    Boolean chargeable = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 30)
    ServiceOrderPaymentStatus paymentStatus = ServiceOrderPaymentStatus.POST_TO_ROOM;

    @Column(name = "payment_request_id")
    String paymentRequestId;

    @Column(name = "payment_time")
    LocalDateTime paymentTime;

    @Column(name = "paid_by", length = 100)
    String paidBy;

    @Column(name = "assigned_to", length = 100)
    String assignedTo;

    @Column(name = "assigned_by", length = 100)
    String assignedBy;

    @Column(name = "assigned_time")
    LocalDateTime assignedTime;

    @Column(name = "served_time")
    LocalDateTime servedTime;

    @Column(name = "served_by", length = 100)
    String servedBy;

    @Column(name = "created_time")
    LocalDateTime createdTime;

    @Column(name = "created_by", length = 100)
    String createdBy;

    @Column(name = "modified_time")
    LocalDateTime modifiedTime;

    @Column(name = "modified_by", length = 100)
    String modifiedBy;

    @Column(name = "deleted")
    Boolean deleted = false;

    @Column(name = "deleted_time")
    LocalDateTime deletedTime;

    @Column(name = "deleted_by", length = 100)
    String deletedBy;
}
