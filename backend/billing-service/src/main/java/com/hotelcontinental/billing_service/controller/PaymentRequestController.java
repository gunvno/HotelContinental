package com.hotelcontinental.billing_service.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotelcontinental.billing_service.dto.ApiResponse;
import com.hotelcontinental.billing_service.dto.request.PaymentRequestCreationRequest;
import com.hotelcontinental.billing_service.dto.request.PayosWebhookRequest;
import com.hotelcontinental.billing_service.dto.response.PaymentRequestResponse;
import com.hotelcontinental.billing_service.service.interfaces.PaymentRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/payment-requests")
@RequiredArgsConstructor
public class PaymentRequestController {
    private final PaymentRequestService paymentRequestService;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ApiResponse<PaymentRequestResponse> create(@RequestBody PaymentRequestCreationRequest request) {
        return ApiResponse.<PaymentRequestResponse>builder()
                .result(paymentRequestService.create(request))
                .build();
    }

    @GetMapping("/my")
    public ApiResponse<List<PaymentRequestResponse>> getMyPaymentRequests() {
        return ApiResponse.<List<PaymentRequestResponse>>builder()
                .result(paymentRequestService.getMyPaymentRequests())
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

    @RequestMapping(
            value = {"/payos", "/payos/", "/payos/webhook", "/payos/webhook/", "/payos/**"},
            method = {RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH},
            consumes = MediaType.ALL_VALUE
    )
    public ApiResponse<?> handlePayosWebhook(@RequestBody(required = false) String rawBody) {
        if (!StringUtils.hasText(rawBody)) {
            return ApiResponse.<String>builder()
                    .message("PayOS webhook is ready")
                    .result("OK")
                    .build();
        }

        PayosWebhookRequest request;
        try {
            request = objectMapper.readValue(rawBody, PayosWebhookRequest.class);
        } catch (JsonProcessingException exception) {
            return ApiResponse.<String>builder()
                    .message("PayOS webhook is ready")
                    .result("OK")
                    .build();
        }

        if (request.getData() == null || !StringUtils.hasText(request.getSignature())) {
            return ApiResponse.<String>builder()
                    .message("PayOS webhook is ready")
                    .result("OK")
                    .build();
        }

        return ApiResponse.<PaymentRequestResponse>builder()
                .result(paymentRequestService.handlePayosWebhook(request))
                .build();
    }

    @GetMapping({"/payos", "/payos/", "/payos/webhook", "/payos/webhook/"})
    public ApiResponse<String> verifyPayosWebhookUrl() {
        return ApiResponse.<String>builder()
                .message("PayOS webhook is ready")
                .result("OK")
                .build();
    }
}
