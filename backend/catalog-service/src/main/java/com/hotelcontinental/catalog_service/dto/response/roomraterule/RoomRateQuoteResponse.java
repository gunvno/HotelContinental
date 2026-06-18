package com.hotelcontinental.catalog_service.dto.response.roomraterule;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomRateQuoteResponse {
    String roomTypeId;
    BigDecimal basePrice;
    BigDecimal totalPrice;
    List<RoomRateQuoteItemResponse> items;
}
