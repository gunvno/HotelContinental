package com.hotelcontinental.billing_service.dto.request;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
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
