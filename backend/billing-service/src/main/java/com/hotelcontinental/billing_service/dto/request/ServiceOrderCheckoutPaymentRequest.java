package com.hotelcontinental.billing_service.dto.request;

import com.hotelcontinental.billing_service.enums.PaymentMethod;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceOrderCheckoutPaymentRequest {
    PaymentMethod paymentMethod;
    String note;
}
