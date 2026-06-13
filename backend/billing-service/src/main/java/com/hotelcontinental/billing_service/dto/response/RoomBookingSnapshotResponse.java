package com.hotelcontinental.billing_service.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomBookingSnapshotResponse {
    String id;
    String bookingDetailId;
    String customerId;
    String roomId;
    String status;
    String detailStatus;
    float totalRoomPrice;
    float totalServicePrice;
    float totalExtraPrice;
    float totalPrice;
}
