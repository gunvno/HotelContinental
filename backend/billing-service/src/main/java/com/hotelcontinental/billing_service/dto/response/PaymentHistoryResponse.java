package com.hotelcontinental.billing_service.dto.response;

import com.hotelcontinental.billing_service.enums.PaymentMethod;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentHistoryResponse {
    String id;
    String roomBookingId;
    PaymentMethod paymentMethod;
    float amount;
    LocalDate paymentTime;
    String note;
    LocalDateTime createdTime;
}
