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
public class InvoiceResponse {
    String invoiceNo;
    String roomBookingId;
    String paymentId;
    String customerId;
    String roomId;
    float totalRoomPrice;
    float totalServicePrice;
    float totalExtraPrice;
    float totalPrice;
    float paidAmount;
    PaymentMethod paymentMethod;
    LocalDate paymentTime;
    LocalDateTime issuedTime;
}
