package com.hotelcontinental.promotion_service.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherApplyRequest {
    String code;
    float orderAmount;
}
