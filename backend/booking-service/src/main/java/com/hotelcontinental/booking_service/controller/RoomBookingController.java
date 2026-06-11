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

    @PostMapping("/{id}/totals")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<RoomBookingResponse> updateTotals(
            @PathVariable String id,
            @RequestBody RoomBookingTotalsUpdateRequest request
    ) {
        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.updateTotals(id, request))
                .build();
    }
}
