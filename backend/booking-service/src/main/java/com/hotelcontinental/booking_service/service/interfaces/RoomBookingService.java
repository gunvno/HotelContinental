package com.hotelcontinental.booking_service.service.interfaces;

import com.hotelcontinental.booking_service.dto.request.RoomBookingCreationRequest;
import com.hotelcontinental.booking_service.dto.request.RoomBookingTotalsUpdateRequest;
import com.hotelcontinental.booking_service.dto.response.RoomBookingResponse;

import java.util.List;

public interface RoomBookingService {
    RoomBookingResponse createRoomBooking(RoomBookingCreationRequest request);
    List<RoomBookingResponse> getRoomBookings();
    RoomBookingResponse getRoomBooking(String id);
    RoomBookingResponse markDeposited(String id);
    RoomBookingResponse checkIn(String id);
    RoomBookingResponse checkOut(String id);
    RoomBookingResponse updateTotals(String id, RoomBookingTotalsUpdateRequest request);
}
