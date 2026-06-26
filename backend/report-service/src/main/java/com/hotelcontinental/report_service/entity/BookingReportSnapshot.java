package com.hotelcontinental.report_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "booking_report_snapshots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingReportSnapshot {
    @Id
    @Column(name = "room_booking_id", length = 100)
    String roomBookingId;

    @Column(name = "room_booking_detail_id", length = 100)
    String roomBookingDetailId;

    @Column(name = "customer_id", length = 100)
    String customerId;

    @Column(name = "customer_email", length = 255)
    String customerEmail;

    @Column(name = "room_id", length = 100)
    String roomId;

    @Column(name = "booking_type", length = 30)
    String bookingType;

    @Column(name = "status", length = 50)
    String status;

    @Column(name = "detail_status", length = 50)
    String detailStatus;

    @Column(name = "checkin")
    LocalDateTime checkin;

    @Column(name = "checkout")
    LocalDateTime checkout;

    @Column(name = "checkin_reality")
    LocalDateTime checkinReality;

    @Column(name = "checkout_reality")
    LocalDateTime checkoutReality;

    @Column(name = "total_room_price")
    double totalRoomPrice;

    @Column(name = "total_service_price")
    double totalServicePrice;

    @Column(name = "total_extra_price")
    double totalExtraPrice;

    @Column(name = "total_price")
    double totalPrice;

    @Column(name = "voucher_code", length = 100)
    String voucherCode;

    @Column(name = "discount_amount")
    double discountAmount;

    @Column(name = "refund_status", length = 50)
    String refundStatus;

    @Column(name = "refund_amount")
    double refundAmount;

    @Column(name = "last_event_type", length = 100)
    String lastEventType;

    @Column(name = "last_actor", length = 100)
    String lastActor;

    @Column(name = "last_event_time")
    LocalDateTime lastEventTime;

    @Column(name = "updated_time")
    LocalDateTime updatedTime;
}
