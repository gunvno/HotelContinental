package com.hotelcontinental.billing_service.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PayosPaymentLinkResponse {
    String paymentLinkId;
    Long orderCode;
    Integer amount;
    String description;
    String checkoutUrl;
    String qrCode;
    String status;
}
