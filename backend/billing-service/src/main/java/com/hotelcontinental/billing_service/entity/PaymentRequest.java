package com.hotelcontinental.billing_service.entity;

import com.hotelcontinental.billing_service.enums.PaymentMethod;
import com.hotelcontinental.billing_service.enums.PaymentRequestStatus;
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
@Table(name = "payment_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "room_booking_id", nullable = false)
    String roomBookingId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    PaymentMethod paymentMethod;

    @Column(name = "amount", nullable = false)
    float amount;

    @Column(name = "bank_account_no", length = 50)
    String bankAccountNo;

    @Column(name = "bank_account_name", length = 150)
    String bankAccountName;

    @Column(name = "bank_name", length = 100)
    String bankName;

    @Column(name = "transfer_content", nullable = false, length = 200)
    String transferContent;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    PaymentRequestStatus status;

    @Column(name = "provider_transaction_id", length = 150)
    String providerTransactionId;

    @Column(name = "paid_time")
    LocalDateTime paidTime;

    @Column(name = "expired_time")
    LocalDateTime expiredTime;

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
}
