package com.hotelcontinental.billing_service.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRequestCreationRequest {
    String roomBookingId;
    String serviceOrderId;
    String purpose;
    float amount;
}
