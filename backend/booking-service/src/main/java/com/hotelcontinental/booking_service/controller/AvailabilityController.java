package com.hotelcontinental.booking_service.controller;

import com.hotelcontinental.booking_service.dto.ApiResponse;
import com.hotelcontinental.booking_service.enums.RoomBookingDetailStatus;
import com.hotelcontinental.booking_service.repository.RoomBookingDetailsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/availability")
@RequiredArgsConstructor
public class AvailabilityController {
    private final RoomBookingDetailsRepository roomBookingDetailsRepository;

    @GetMapping("/busy-room-ids")
    public ApiResponse<List<String>> getBusyRoomIds(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        List<String> roomIds = roomBookingDetailsRepository.findBusyRoomIds(
                start,
                end,
                List.of(RoomBookingDetailStatus.BOOKED, RoomBookingDetailStatus.CHECKED_IN)
        );

        return ApiResponse.<List<String>>builder()
                .result(roomIds)
                .build();
    }
}
