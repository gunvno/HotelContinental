package com.hotelcontinental.billing_service.controller;

import com.hotelcontinental.billing_service.dto.ApiResponse;
import com.hotelcontinental.billing_service.dto.response.InvoiceResponse;
import com.hotelcontinental.billing_service.service.interfaces.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService invoiceService;

    @GetMapping("/booking/{roomBookingId}")
    public ApiResponse<InvoiceResponse> getByBooking(@PathVariable String roomBookingId) {
        return ApiResponse.<InvoiceResponse>builder()
                .result(invoiceService.getByBooking(roomBookingId))
                .build();
    }
}
