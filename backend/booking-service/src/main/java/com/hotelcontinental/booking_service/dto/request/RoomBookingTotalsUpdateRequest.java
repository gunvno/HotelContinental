package com.hotelcontinental.booking_service.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomBookingTotalsUpdateRequest {
    float totalRoomPrice;
    float totalServicePrice;
    float totalExtraPrice;
    float totalPrice;
    String voucherCode;
    Float discountAmount;
    String refundStatus;
    Float refundAmount;
}
