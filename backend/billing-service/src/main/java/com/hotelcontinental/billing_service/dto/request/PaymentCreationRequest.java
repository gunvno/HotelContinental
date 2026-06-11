package com.hotelcontinental.billing_service.dto.request;

import com.hotelcontinental.billing_service.enums.PaymentMethod;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentCreationRequest {
    String roomBookingId;
    PaymentMethod paymentMethod;
    float amount;
    String note;
}
