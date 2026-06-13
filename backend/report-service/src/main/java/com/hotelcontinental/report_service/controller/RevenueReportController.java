package com.hotelcontinental.report_service.controller;

import com.hotelcontinental.report_service.dto.ApiResponse;
import com.hotelcontinental.report_service.dto.response.RevenueSummaryResponse;
import com.hotelcontinental.report_service.service.interfaces.RevenueReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/revenue")
@RequiredArgsConstructor
public class RevenueReportController {
    private final RevenueReportService revenueReportService;

    @GetMapping("/summary")
    public ApiResponse<RevenueSummaryResponse> getRevenueSummary(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {
        return ApiResponse.<RevenueSummaryResponse>builder()
                .result(revenueReportService.getRevenueSummary(from, to))
                .build();
    }
}
