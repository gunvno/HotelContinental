package com.hotelcontinental.catalog_service.dto.response.roomtype;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomTypeForCustomerResponse {
    String id;
    String name;
    String description;
    int maximumOccupancy;
    int quantity;
}

