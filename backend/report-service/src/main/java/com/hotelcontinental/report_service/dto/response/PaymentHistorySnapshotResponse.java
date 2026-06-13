package com.hotelcontinental.report_service.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentHistorySnapshotResponse {
    String id;
    String roomBookingId;
    String paymentMethod;
    double amount;
    LocalDate paymentTime;
    String note;
    LocalDateTime createdTime;
}
