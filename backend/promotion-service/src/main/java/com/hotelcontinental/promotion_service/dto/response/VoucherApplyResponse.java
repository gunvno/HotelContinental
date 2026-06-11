package com.hotelcontinental.promotion_service.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherApplyResponse {
    String voucherId;
    String voucherDetailId;
    String code;
    String name;
    String discountType;
    float discountValue;
    float orderAmount;
    float discountAmount;
    float finalAmount;
}
