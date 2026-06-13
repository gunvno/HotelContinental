package com.hotelcontinental.billing_service.dto.response;

import com.hotelcontinental.billing_service.enums.PaymentMethod;
import com.hotelcontinental.billing_service.enums.PaymentRequestStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRequestResponse {
    String id;
    String roomBookingId;
    PaymentMethod paymentMethod;
    float amount;
    String bankAccountNo;
    String bankAccountName;
    String bankName;
    String transferContent;
    PaymentRequestStatus status;
    String providerTransactionId;
    LocalDateTime paidTime;
    LocalDateTime expiredTime;
    LocalDateTime createdTime;
}
