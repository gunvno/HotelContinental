package com.hotelcontinental.promotion_service.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherCreationRequest {
    String name;
    String description;
    String discountType;
    float discountValue;
    String code;
    LocalDateTime startDate;
    LocalDateTime endDate;
}
