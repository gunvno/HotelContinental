package com.hotelcontinental.promotion_service.controller;

import com.hotelcontinental.promotion_service.dto.ApiResponse;
import com.hotelcontinental.promotion_service.dto.request.VoucherApplyRequest;
import com.hotelcontinental.promotion_service.dto.request.VoucherConsumeRequest;
import com.hotelcontinental.promotion_service.dto.request.VoucherCreationRequest;
import com.hotelcontinental.promotion_service.dto.response.VoucherApplyResponse;
import com.hotelcontinental.promotion_service.dto.response.VoucherResponse;
import com.hotelcontinental.promotion_service.service.interfaces.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/vouchers")
@RequiredArgsConstructor
public class VoucherController {
    private final VoucherService voucherService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<VoucherResponse> createVoucher(@RequestBody VoucherCreationRequest request) {
        return ApiResponse.<VoucherResponse>builder()
                .result(voucherService.createVoucher(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<VoucherResponse>> getVouchers() {
        return ApiResponse.<List<VoucherResponse>>builder()
                .result(voucherService.getVouchers())
                .build();
    }

    @PostMapping("/apply")
    public ApiResponse<VoucherApplyResponse> applyVoucher(@RequestBody VoucherApplyRequest request) {
        return ApiResponse.<VoucherApplyResponse>builder()
                .result(voucherService.applyVoucher(request))
                .build();
    }

    @PostMapping("/consume")
    public ApiResponse<VoucherResponse> consumeVoucher(@RequestBody VoucherConsumeRequest request) {
        return ApiResponse.<VoucherResponse>builder()
                .result(voucherService.consumeVoucher(request))
                .build();
    }
}
