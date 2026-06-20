package com.hotelcontinental.booking_service.service.interfaces;

import com.hotelcontinental.booking_service.dto.request.RoomBookingCreationRequest;
import com.hotelcontinental.booking_service.dto.request.RoomBookingDateChangeRequest;
import com.hotelcontinental.booking_service.dto.request.RoomBookingTotalsUpdateRequest;
import com.hotelcontinental.booking_service.dto.request.ResidenceRegistrationRequest;
import com.hotelcontinental.booking_service.dto.response.EditHistoryResponse;
import com.hotelcontinental.booking_service.dto.response.ResidenceRegistrationResponse;
import com.hotelcontinental.booking_service.dto.response.RoomBookingResponse;

import java.util.List;

public interface RoomBookingService {
    RoomBookingResponse createRoomBooking(RoomBookingCreationRequest request);
    List<RoomBookingResponse> getRoomBookings();
    List<RoomBookingResponse> getMyRoomBookings();
    RoomBookingResponse getRoomBooking(String id);
    List<EditHistoryResponse> getEditHistory(String id);
    List<ResidenceRegistrationResponse> getResidenceRegistrations(String id);
    RoomBookingResponse markDeposited(String id);
    RoomBookingResponse registerResidence(String id, ResidenceRegistrationRequest request);
    RoomBookingResponse checkIn(String id);
    RoomBookingResponse checkOut(String id);
    RoomBookingResponse updateTotals(String id, RoomBookingTotalsUpdateRequest request);
    RoomBookingResponse changeDates(String id, RoomBookingDateChangeRequest request);
    RoomBookingResponse cancelBooking(String id);
    RoomBookingResponse approveCancellation(String id);
}
