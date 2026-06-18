package com.hotelcontinental.catalog_service.controller;

import com.hotelcontinental.catalog_service.dto.ApiResponse;
import com.hotelcontinental.catalog_service.dto.request.roomraterule.RoomRateQuoteRequest;
import com.hotelcontinental.catalog_service.dto.request.roomraterule.RoomRateRuleRequest;
import com.hotelcontinental.catalog_service.dto.response.roomraterule.RoomRateQuoteResponse;
import com.hotelcontinental.catalog_service.dto.response.roomraterule.RoomRateRuleResponse;
import com.hotelcontinental.catalog_service.service.interfaces.RoomRateRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/room-rate-rules")
@RequiredArgsConstructor
public class RoomRateRuleController {
    private final RoomRateRuleService roomRateRuleService;

    @PostMapping
    ApiResponse<RoomRateRuleResponse> createRule(@RequestBody RoomRateRuleRequest request) {
        return ApiResponse.<RoomRateRuleResponse>builder()
                .result(roomRateRuleService.createRule(request))
                .build();
    }

    @GetMapping
    ApiResponse<Page<RoomRateRuleResponse>> getRules(Pageable pageable) {
        return ApiResponse.<Page<RoomRateRuleResponse>>builder()
                .result(roomRateRuleService.getRules(pageable))
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<RoomRateRuleResponse> getRule(@PathVariable String id) {
        return ApiResponse.<RoomRateRuleResponse>builder()
                .result(roomRateRuleService.getRule(id))
                .build();
    }

    @PutMapping("/{id}")
    ApiResponse<RoomRateRuleResponse> updateRule(@PathVariable String id, @RequestBody RoomRateRuleRequest request) {
        return ApiResponse.<RoomRateRuleResponse>builder()
                .result(roomRateRuleService.updateRule(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    ApiResponse<Void> deleteRule(@PathVariable String id) {
        roomRateRuleService.deleteRule(id);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/quote")
    ApiResponse<RoomRateQuoteResponse> quote(@RequestBody RoomRateQuoteRequest request) {
        return ApiResponse.<RoomRateQuoteResponse>builder()
                .result(roomRateRuleService.quote(request))
                .build();
    }
}
