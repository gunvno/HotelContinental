package com.hotelcontinental.booking_service.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomBookingDateChangeRequest {
    LocalDateTime checkin;
    LocalDateTime checkout;
}
