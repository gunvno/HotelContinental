package com.hotelcontinental.chat_service.controller;

import com.hotelcontinental.chat_service.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping("/health")
    public ApiResponse<String> health() {
        return ApiResponse.<String>builder()
                .result("chat-service is running")
                .build();
    }
}
