package com.hotelcontinental.billing_service.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PayosWebhookRequest {
    String code;
    String desc;
    Boolean success;
    Map<String, Object> data;
    String signature;
}
