package com.hotelcontinental.report_service.service.serviceImpl;

import com.hotelcontinental.report_service.dto.response.PaymentHistorySnapshotResponse;
import com.hotelcontinental.report_service.dto.response.RevenueBreakdownResponse;
import com.hotelcontinental.report_service.dto.response.RevenueSummaryResponse;
import com.hotelcontinental.report_service.dto.response.RevenueTimePointResponse;
import com.hotelcontinental.report_service.dto.response.RoomBookingSnapshotResponse;
import com.hotelcontinental.report_service.repository.httpclient.ExternalReportDataClient;
import com.hotelcontinental.report_service.service.interfaces.RevenueReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RevenueReportServiceImpl implements RevenueReportService {
    private final ExternalReportDataClient externalReportDataClient;

    @Override
    @PreAuthorize("hasAuthority('REVENUE_VIEW')")
    public RevenueSummaryResponse getRevenueSummary(LocalDate fromDate, LocalDate toDate) {
        LocalDate today = LocalDate.now();
        LocalDate effectiveTo = toDate != null ? toDate : today;
        LocalDate effectiveFrom = fromDate != null ? fromDate : effectiveTo.minusDays(6);
        if (effectiveFrom.isAfter(effectiveTo)) {
            LocalDate tmp = effectiveFrom;
            effectiveFrom = effectiveTo;
            effectiveTo = tmp;
        }

        List<PaymentHistorySnapshotResponse> allPayments = externalReportDataClient.getPayments();
        List<RoomBookingSnapshotResponse> bookings = externalReportDataClient.getRoomBookings();
        Map<String, RoomBookingSnapshotResponse> bookingMap = bookings.stream()
                .collect(Collectors.toMap(RoomBookingSnapshotResponse::getId, Function.identity(), (left, right) -> left));

        LocalDate from = effectiveFrom;
        LocalDate to = effectiveTo;
        List<PaymentHistorySnapshotResponse> payments = allPayments.stream()
                .filter(payment -> payment.getPaymentTime() != null)
                .filter(payment -> !payment.getPaymentTime().isBefore(from) && !payment.getPaymentTime().isAfter(to))
                .toList();
        Set<String> paidBookingIds = payments.stream()
                .map(PaymentHistorySnapshotResponse::getRoomBookingId)
                .collect(Collectors.toSet());

        double totalCollected = payments.stream().mapToDouble(PaymentHistorySnapshotResponse::getAmount).sum();
        double todayCollected = payments.stream()
                .filter(payment -> today.equals(payment.getPaymentTime()))
                .mapToDouble(PaymentHistorySnapshotResponse::getAmount)
                .sum();
        double roomRevenue = paidBookingIds.stream()
                .map(bookingMap::get)
                .filter(booking -> booking != null)
                .mapToDouble(RoomBookingSnapshotResponse::getTotalRoomPrice)
                .sum();
        double serviceRevenue = paidBookingIds.stream()
                .map(bookingMap::get)
                .filter(booking -> booking != null)
                .mapToDouble(RoomBookingSnapshotResponse::getTotalServicePrice)
                .sum();
        double extraRevenue = paidBookingIds.stream()
                .map(bookingMap::get)
                .filter(booking -> booking != null)
                .mapToDouble(RoomBookingSnapshotResponse::getTotalExtraPrice)
                .sum();
        double pendingBookingValue = bookings.stream()
                .filter(booking -> "PENDING".equals(booking.getStatus()))
                .mapToDouble(RoomBookingSnapshotResponse::getTotalPrice)
                .sum();

        Map<LocalDate, Double> daily = new LinkedHashMap<>();
        for (LocalDate date = effectiveFrom; !date.isAfter(effectiveTo); date = date.plusDays(1)) {
            daily.put(date, 0D);
        }
        payments.forEach(payment -> daily.computeIfPresent(
                payment.getPaymentTime(),
                (date, amount) -> amount + payment.getAmount()
        ));

        return RevenueSummaryResponse.builder()
                .fromDate(effectiveFrom)
                .toDate(effectiveTo)
                .totalCollected(totalCollected)
                .todayCollected(todayCollected)
                .roomRevenue(roomRevenue)
                .serviceRevenue(serviceRevenue)
                .extraRevenue(extraRevenue)
                .pendingBookingValue(pendingBookingValue)
                .paymentCount(payments.size())
                .bookingCount(bookings.size())
                .paidBookingCount(paidBookingIds.size())
                .checkedInBookingCount(countBookingsByStatus(bookings, "CHECKED_IN"))
                .checkedOutBookingCount(countBookingsByStatus(bookings, "DONE"))
                .dailyRevenue(daily.entrySet().stream()
                        .map(entry -> RevenueTimePointResponse.builder()
                                .date(entry.getKey())
                                .amount(entry.getValue())
                                .build())
                        .toList())
                .breakdown(List.of(
                        RevenueBreakdownResponse.builder().label("Tiền phòng").amount(roomRevenue).build(),
                        RevenueBreakdownResponse.builder().label("Dịch vụ phát sinh").amount(serviceRevenue).build(),
                        RevenueBreakdownResponse.builder().label("Thuế, ưu đãi và phụ phí").amount(extraRevenue).build()
                ))
                .build();
    }

    private long countBookingsByStatus(List<RoomBookingSnapshotResponse> bookings, String status) {
        return bookings.stream()
                .filter(booking -> status.equals(booking.getStatus()))
                .count();
    }
}
