package com.hotelcontinental.report_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingEvent {
    String eventType;
    String bookingId;
    String bookingDetailId;
    String customerId;
    String customerEmail;
    String roomId;
    String bookingType;
    String status;
    String detailStatus;
    LocalDateTime checkin;
    LocalDateTime checkout;
    LocalDateTime checkinReality;
    LocalDateTime checkoutReality;
    Float totalRoomPrice;
    Float totalServicePrice;
    Float totalExtraPrice;
    Float totalPrice;
    String voucherCode;
    Float discountAmount;
    String refundStatus;
    Float refundAmount;
    String actor;
    LocalDateTime occurredAt;
}
