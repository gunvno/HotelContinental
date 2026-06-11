package com.hotelcontinental.booking_service.dto.request;

import com.hotelcontinental.booking_service.enums.BookingType;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomBookingCreationRequest {
    String roomId;
    LocalDateTime checkin;
    LocalDateTime checkout;
    BookingType bookingType = BookingType.ONLINE;
    float roomPrice;
    float totalRoomPrice;
    float totalServicePrice;
    float totalExtraPrice;
    float totalPrice;
    float deposit;
}
