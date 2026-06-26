package com.hotelcontinental.identity_service.controller;

import com.hotelcontinental.identity_service.dto.ApiResponse;
import com.hotelcontinental.identity_service.dto.response.StaffActivity.StaffActivitySessionResponse;
import com.hotelcontinental.identity_service.service.interfaces.StaffActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/staff-activity")
@RequiredArgsConstructor
public class StaffActivityController {
    private final StaffActivityService staffActivityService;

    @GetMapping
    @PreAuthorize("hasAuthority('STAFF_ACTIVITY_VIEW')")
    public ApiResponse<List<StaffActivitySessionResponse>> getAll() {
        return ApiResponse.<List<StaffActivitySessionResponse>>builder()
                .result(staffActivityService.getAll())
                .build();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('STAFF_ATTENDANCE_UPDATE') or hasAuthority('STAFF_ACTIVITY_VIEW')")
    public ApiResponse<List<StaffActivitySessionResponse>> getMine() {
        return ApiResponse.<List<StaffActivitySessionResponse>>builder()
                .result(staffActivityService.getMine())
                .build();
    }

    @PostMapping("/me/check-in")
    @PreAuthorize("hasAuthority('STAFF_ATTENDANCE_UPDATE')")
    public ApiResponse<StaffActivitySessionResponse> checkIn() {
        return ApiResponse.<StaffActivitySessionResponse>builder()
                .result(staffActivityService.checkIn())
                .build();
    }

    @PostMapping("/me/check-out")
    @PreAuthorize("hasAuthority('STAFF_ATTENDANCE_UPDATE')")
    public ApiResponse<StaffActivitySessionResponse> checkOut() {
        return ApiResponse.<StaffActivitySessionResponse>builder()
                .result(staffActivityService.checkOut())
                .build();
    }
}
