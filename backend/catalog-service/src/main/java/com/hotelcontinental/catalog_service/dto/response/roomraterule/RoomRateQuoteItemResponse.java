package com.hotelcontinental.catalog_service.dto.response.roomraterule;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomRateQuoteItemResponse {
    LocalDate date;
    BigDecimal basePrice;
    BigDecimal multiplier;
    String ruleName;
    String ruleType;
    BigDecimal finalUnitPrice;
    Integer quantity;
    BigDecimal finalPrice;
}
