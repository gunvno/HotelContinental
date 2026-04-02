package com.hotelcontinental.room_service.dto.response.building;

import com.hotelcontinental.room_service.enums.BuildingStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BuildingCustomerResponse {
    String name;
    BuildingStatus status;
    String address;
}
