package com.hotelcontinental.booking_service.dto.response;

import com.hotelcontinental.booking_service.enums.BookingType;
import com.hotelcontinental.booking_service.enums.RoomBookingDetailStatus;
import com.hotelcontinental.booking_service.enums.RoomBookingStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomBookingResponse {
    String id;
    String bookingDetailId;
    String customerId;
    String roomId;
    BookingType bookingType;
    RoomBookingStatus status;
    RoomBookingDetailStatus detailStatus;
    LocalDateTime checkin;
    LocalDateTime checkout;
    LocalDateTime checkinReality;
    LocalDateTime checkoutReality;
    float roomPrice;
    float totalRoomPrice;
    float totalServicePrice;
    float totalExtraPrice;
    float totalPrice;
    float deposit;
}
