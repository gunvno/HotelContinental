package com.hotelcontinental.billing_service.controller;

import com.hotelcontinental.billing_service.dto.ApiResponse;
import com.hotelcontinental.billing_service.dto.request.PaymentRequestCreationRequest;
import com.hotelcontinental.billing_service.dto.response.PaymentRequestResponse;
import com.hotelcontinental.billing_service.service.interfaces.PaymentRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payment-requests")
@RequiredArgsConstructor
public class PaymentRequestController {
    private final PaymentRequestService paymentRequestService;

    @PostMapping
    public ApiResponse<PaymentRequestResponse> create(@RequestBody PaymentRequestCreationRequest request) {
        return ApiResponse.<PaymentRequestResponse>builder()
                .result(paymentRequestService.create(request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<PaymentRequestResponse> get(@PathVariable String id) {
        return ApiResponse.<PaymentRequestResponse>builder()
                .result(paymentRequestService.get(id))
                .build();
    }

    @GetMapping("/booking/{roomBookingId}")
    public ApiResponse<PaymentRequestResponse> getLatestByBooking(@PathVariable String roomBookingId) {
        return ApiResponse.<PaymentRequestResponse>builder()
                .result(paymentRequestService.getLatestByBooking(roomBookingId))
                .build();
    }

    @PostMapping("/{id}/mock-paid")
    public ApiResponse<PaymentRequestResponse> mockPaid(@PathVariable String id) {
        return ApiResponse.<PaymentRequestResponse>builder()
                .result(paymentRequestService.mockPaid(id))
                .build();
    }
}
