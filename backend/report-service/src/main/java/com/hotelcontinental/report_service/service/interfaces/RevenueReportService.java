package com.hotelcontinental.report_service.service.interfaces;

import com.hotelcontinental.report_service.dto.response.RevenueSummaryResponse;

import java.time.LocalDate;

public interface RevenueReportService {
    RevenueSummaryResponse getRevenueSummary(LocalDate fromDate, LocalDate toDate);
}
