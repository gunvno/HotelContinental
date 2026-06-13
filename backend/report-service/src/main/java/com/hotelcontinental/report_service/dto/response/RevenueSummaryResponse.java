package com.hotelcontinental.report_service.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RevenueSummaryResponse {
    LocalDate fromDate;
    LocalDate toDate;
    double totalCollected;
    double todayCollected;
    double roomRevenue;
    double serviceRevenue;
    double extraRevenue;
    double pendingBookingValue;
    long paymentCount;
    long bookingCount;
    long paidBookingCount;
    long checkedInBookingCount;
    long checkedOutBookingCount;
    List<RevenueTimePointResponse> dailyRevenue;
    List<RevenueBreakdownResponse> breakdown;
}
