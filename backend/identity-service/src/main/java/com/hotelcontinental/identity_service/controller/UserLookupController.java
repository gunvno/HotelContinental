package com.hotelcontinental.identity_service.controller;

import com.hotelcontinental.identity_service.dto.ApiResponse;
import com.hotelcontinental.identity_service.dto.response.User.UserSummaryResponse;
import com.hotelcontinental.identity_service.service.interfaces.UserLookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserLookupController {
    private final UserLookupService userLookupService;

    @GetMapping("/{userId}/summary")
    public ApiResponse<UserSummaryResponse> getUserSummary(@PathVariable String userId) {
        return ApiResponse.<UserSummaryResponse>builder()
                .result(userLookupService.getUserSummary(userId))
                .build();
    }
}
