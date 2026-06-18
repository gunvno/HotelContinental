package com.hotelcontinental.catalog_service.dto.response.roomraterule;

import com.hotelcontinental.catalog_service.enums.RoomRateRuleType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomRateRuleResponse {
    String id;
    String roomTypeId;
    String roomTypeName;
    String name;
    RoomRateRuleType ruleType;
    LocalDate startDate;
    LocalDate endDate;
    String daysOfWeek;
    BigDecimal multiplier;
    Integer priority;
    String note;
    Boolean active;
    String createdBy;
    LocalDateTime createdTime;
    String modifiedBy;
    LocalDateTime modifiedTime;
    Boolean deleted;
}
