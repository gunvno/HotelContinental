package com.hotelcontinental.billing_service.controller;

import com.hotelcontinental.billing_service.dto.ApiResponse;
import com.hotelcontinental.billing_service.dto.request.PaymentCreationRequest;
import com.hotelcontinental.billing_service.dto.response.PaymentHistoryResponse;
import com.hotelcontinental.billing_service.service.interfaces.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    public ApiResponse<PaymentHistoryResponse> createPayment(@RequestBody PaymentCreationRequest request) {
        return ApiResponse.<PaymentHistoryResponse>builder()
                .result(paymentService.createPayment(request))
                .build();
    }

    @GetMapping("/booking/{roomBookingId}")
    public ApiResponse<PaymentHistoryResponse> getLatestPaymentByBooking(@PathVariable String roomBookingId) {
        return ApiResponse.<PaymentHistoryResponse>builder()
                .result(paymentService.getLatestPaymentByBooking(roomBookingId))
                .build();
    }

    @GetMapping("/my")
    public ApiResponse<List<PaymentHistoryResponse>> getMyPayments() {
        return ApiResponse.<List<PaymentHistoryResponse>>builder()
                .result(paymentService.getMyPayments())
                .build();
    }
}
