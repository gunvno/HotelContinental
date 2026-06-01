package com.hotelcontinental.promotion_service.controller;

import com.hotelcontinental.promotion_service.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
public class HealthController {
    @GetMapping
    ApiResponse<String> health() {
        return ApiResponse.<String>builder()
                .result("promotion-service is running")
                .build();
    }
}
