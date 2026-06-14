package com.hotelcontinental.booking_service.controller;

import com.hotelcontinental.booking_service.dto.ApiResponse;
import com.hotelcontinental.booking_service.dto.response.RoomBookingResponse;
import com.hotelcontinental.booking_service.exception.AppException;
import com.hotelcontinental.booking_service.exception.ErrorCode;
import com.hotelcontinental.booking_service.service.interfaces.RoomBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/room-bookings")
@RequiredArgsConstructor
public class InternalRoomBookingController {
    private final RoomBookingService roomBookingService;

    @Value("${app.internal-secret:dev-internal-secret}")
    private String internalSecret;

    @PostMapping("/{id}/mark-deposited")
    public ApiResponse<RoomBookingResponse> markDeposited(
            @PathVariable String id,
            @RequestHeader(value = "X-Internal-Secret", required = false) String requestSecret
    ) {
        if (!StringUtils.hasText(requestSecret) || !requestSecret.equals(internalSecret)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return ApiResponse.<RoomBookingResponse>builder()
                .result(roomBookingService.markDeposited(id))
                .build();
    }
}
