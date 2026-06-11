package com.hotelcontinental.booking_service.service.interfaces;

import com.hotelcontinental.booking_service.dto.request.RoomBookingCreationRequest;
import com.hotelcontinental.booking_service.dto.request.RoomBookingTotalsUpdateRequest;
import com.hotelcontinental.booking_service.dto.response.RoomBookingResponse;

public interface RoomBookingService {
    RoomBookingResponse createRoomBooking(RoomBookingCreationRequest request);
    RoomBookingResponse getRoomBooking(String id);
    RoomBookingResponse markDeposited(String id);
    RoomBookingResponse updateTotals(String id, RoomBookingTotalsUpdateRequest request);
}
