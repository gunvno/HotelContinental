package com.hotelcontinental.catalog_service.dto.request.roomraterule;

import com.hotelcontinental.catalog_service.enums.RoomRateRuleType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomRateRuleRequest {
    String roomTypeId;
    String name;
    RoomRateRuleType ruleType;
    LocalDate startDate;
    LocalDate endDate;
    String daysOfWeek;
    BigDecimal multiplier;
    Integer priority;
    String note;
    Boolean active;
}
