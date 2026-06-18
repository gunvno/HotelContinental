package com.hotelcontinental.billing_service.controller;

import com.hotelcontinental.billing_service.dto.ApiResponse;
import com.hotelcontinental.billing_service.dto.request.ServiceOrderDetailCreationRequest;
import com.hotelcontinental.billing_service.dto.response.ServiceOrderDetailResponse;
import com.hotelcontinental.billing_service.service.interfaces.ServiceOrderDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/service-order-details")
@RequiredArgsConstructor
public class ServiceOrderDetailController {
    private final ServiceOrderDetailService serviceOrderDetailService;

    @GetMapping
    public ApiResponse<List<ServiceOrderDetailResponse>> getAll(
            @RequestParam(required = false) String roomBookingId
    ) {
        return ApiResponse.<List<ServiceOrderDetailResponse>>builder()
                .result(serviceOrderDetailService.getAll(roomBookingId))
                .build();
    }

    @GetMapping("/me")
    public ApiResponse<List<ServiceOrderDetailResponse>> getMine(
            @RequestParam String roomBookingId
    ) {
        return ApiResponse.<List<ServiceOrderDetailResponse>>builder()
                .result(serviceOrderDetailService.getForCurrentCustomer(roomBookingId))
                .build();
    }

    @PostMapping
    public ApiResponse<ServiceOrderDetailResponse> create(@RequestBody ServiceOrderDetailCreationRequest request) {
        return ApiResponse.<ServiceOrderDetailResponse>builder()
                .result(serviceOrderDetailService.create(request))
                .build();
    }

    @PostMapping("/me")
    public ApiResponse<ServiceOrderDetailResponse> createForMe(@RequestBody ServiceOrderDetailCreationRequest request) {
        return ApiResponse.<ServiceOrderDetailResponse>builder()
                .result(serviceOrderDetailService.createForCurrentCustomer(request))
                .build();
    }

    @PostMapping("/bookings/{roomBookingId}/included")
    public ApiResponse<List<ServiceOrderDetailResponse>> ensureIncludedServices(@PathVariable String roomBookingId) {
        return ApiResponse.<List<ServiceOrderDetailResponse>>builder()
                .result(serviceOrderDetailService.ensureIncludedServices(roomBookingId))
                .build();
    }

    @PostMapping("/{id}/serve")
    public ApiResponse<ServiceOrderDetailResponse> markServed(@PathVariable String id) {
        return ApiResponse.<ServiceOrderDetailResponse>builder()
                .result(serviceOrderDetailService.markServed(id))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        serviceOrderDetailService.delete(id);
        return ApiResponse.<Void>builder().build();
    }
}
