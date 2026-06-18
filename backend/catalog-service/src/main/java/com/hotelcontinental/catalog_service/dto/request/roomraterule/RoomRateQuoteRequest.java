package com.hotelcontinental.catalog_service.dto.request.roomraterule;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomRateQuoteRequest {
    String roomTypeId;
    BigDecimal basePrice;
    LocalDateTime checkin;
    LocalDateTime checkout;
    String stayType;
}
