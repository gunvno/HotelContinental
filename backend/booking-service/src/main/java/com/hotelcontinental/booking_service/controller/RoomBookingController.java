package com.hotelcontinental.booking_service.controller;

import com.hotelcontinental.booking_service.dto.ApiResponse;
import com.hotelcontinental.booking_service.dto.request.ResidenceRegistrationRequest;
import com.hotelcontinental.booking_service.dto.request.RoomBookingCreationRequest;
import com.hotelcontinental.booking_service.dto.request.RoomBookingDateChangeRequest;
import com.hotelcontinental.booking_service.dto.request.RoomBookingTotalsUpdateRequest;
import com.hotelcontinental.booking_service.dto.response.EditHistoryResponse;
import com.hotelcontinental.booking_service.dto.response.ResidenceRegistrationResponse;
import com.hotelcontinental.booking_service.dto.response.RoomBookingResponse;
import com.hotelcontinental.booking_service.service.interfaces.RoomBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/room-bookings")
@RequiredArgsConstructor
public class RoomBookingController {
    private final RoomBookingService roomBookingService;

    @PostMapping
    public ApiResponse<RoomBookingResponse> createRoomBooking(@RequestBody RoomBookingCreationRequest request) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.createRoomBooking(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<RoomBookingResponse>> getRoomBookings() {
        return ApiResponse.<List<RoomBookingResponse>>builder()
                .result(roomBookingService.getRoomBookings())
                .build();
    }

    @GetMapping("/me")
    public ApiResponse<List<RoomBookingResponse>> getMyRoomBookings() {
        return ApiResponse.<List<RoomBookingResponse>>builder()
                .result(roomBookingService.getMyRoomBookings())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<RoomBookingResponse> getRoomBooking(@PathVariable String id) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.getRoomBooking(id))
                .build();
    }

    @GetMapping("/{id}/edit-history")
    public ApiResponse<List<EditHistoryResponse>> getEditHistory(@PathVariable String id) {
        return ApiResponse.<List<EditHistoryResponse>>builder()
                .result(roomBookingService.getEditHistory(id))
                .build();
    }

    @GetMapping("/{id}/residence-registrations")
    public ApiResponse<List<ResidenceRegistrationResponse>> getResidenceRegistrations(@PathVariable String id) {
        return ApiResponse.<List<ResidenceRegistrationResponse>>builder()
                .result(roomBookingService.getResidenceRegistrations(id))
                .build();
    }

    @PostMapping("/{id}/mark-deposited")
    public ApiResponse<RoomBookingResponse> markDeposited(@PathVariable String id) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.markDeposited(id))
                .build();
    }

    @PostMapping("/{id}/check-in")
    public ApiResponse<RoomBookingResponse> checkIn(@PathVariable String id) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.checkIn(id))
                .build();
    }

    @PostMapping("/{id}/residence-registrations")
    public ApiResponse<RoomBookingResponse> registerResidence(
            @PathVariable String id,
            @RequestBody ResidenceRegistrationRequest request
    ) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.registerResidence(id, request))
                .build();
    }

    @PostMapping("/{id}/check-out")
    public ApiResponse<RoomBookingResponse> checkOut(@PathVariable String id) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.checkOut(id))
                .build();
    }

    @PostMapping("/{id}/totals")
    public ApiResponse<RoomBookingResponse> updateTotals(
            @PathVariable String id,
            @RequestBody RoomBookingTotalsUpdateRequest request
    ) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.updateTotals(id, request))
                .build();
    }

    @PostMapping("/{id}/change-dates")
    public ApiResponse<RoomBookingResponse> changeDates(
            @PathVariable String id,
            @RequestBody RoomBookingDateChangeRequest request
    ) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.changeDates(id, request))
                .build();
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<RoomBookingResponse> cancelBooking(@PathVariable String id) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.cancelBooking(id))
                .build();
    }

    @PostMapping("/{id}/approve-cancel")
    public ApiResponse<RoomBookingResponse> approveCancellation(@PathVariable String id) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.approveCancellation(id))
                .build();
    }
}
