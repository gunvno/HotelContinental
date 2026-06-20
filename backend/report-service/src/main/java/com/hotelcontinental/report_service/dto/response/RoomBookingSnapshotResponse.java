package com.hotelcontinental.report_service.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomBookingSnapshotResponse {
    String id;
    String bookingDetailId;
    String customerId;
    String roomId;
    String bookingType;
    String status;
    String detailStatus;
    LocalDateTime checkin;
    LocalDateTime checkout;
    LocalDateTime checkinReality;
    LocalDateTime checkoutReality;
    double roomPrice;
    double totalRoomPrice;
    double totalServicePrice;
    double totalExtraPrice;
    double totalPrice;
    double deposit;
    String voucherCode;
    double discountAmount;
    String refundStatus;
    double refundAmount;
}
