package com.hotelcontinental.promotion_service.dto.response;

import com.hotelcontinental.promotion_service.enums.VoucherStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherResponse {
    String id;
    String detailId;
    String name;
    String description;
    String discountType;
    float discountValue;
    VoucherStatus status;
    String code;
    LocalDateTime startDate;
    LocalDateTime endDate;
    String roomBookingId;
}
