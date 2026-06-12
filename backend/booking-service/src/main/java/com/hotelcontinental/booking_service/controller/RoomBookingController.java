package com.hotelcontinental.booking_service.controller;

import com.hotelcontinental.booking_service.dto.ApiResponse;
import com.hotelcontinental.booking_service.dto.request.RoomBookingCreationRequest;
import com.hotelcontinental.booking_service.dto.request.RoomBookingTotalsUpdateRequest;
import com.hotelcontinental.booking_service.dto.response.RoomBookingResponse;
import com.hotelcontinental.booking_service.service.interfaces.RoomBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasAuthority('BOOKING_CREATE')")
    public ApiResponse<RoomBookingResponse> createRoomBooking(@RequestBody RoomBookingCreationRequest request) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.createRoomBooking(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('BOOKING_VIEW')")
    public ApiResponse<List<RoomBookingResponse>> getRoomBookings() {
        return ApiResponse.<List<RoomBookingResponse>>builder()
                .result(roomBookingService.getRoomBookings())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<RoomBookingResponse> getRoomBooking(@PathVariable String id) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.getRoomBooking(id))
                .build();
    }

    @PostMapping("/{id}/mark-deposited")
    public ApiResponse<RoomBookingResponse> markDeposited(@PathVariable String id) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.markDeposited(id))
                .build();
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAuthority('BOOKING_CHECKIN')")
    public ApiResponse<RoomBookingResponse> checkIn(@PathVariable String id) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.checkIn(id))
                .build();
    }

    @PostMapping("/{id}/check-out")
    @PreAuthorize("hasAuthority('BOOKING_CHECKOUT')")
    public ApiResponse<RoomBookingResponse> checkOut(@PathVariable String id) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.checkOut(id))
                .build();
    }

    @PostMapping("/{id}/totals")
    @PreAuthorize("hasAuthority('BOOKING_UPDATE_TOTALS')")
    public ApiResponse<RoomBookingResponse> updateTotals(
            @PathVariable String id,
            @RequestBody RoomBookingTotalsUpdateRequest request
    ) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.updateTotals(id, request))
                .build();
    }
}
