package com.hotelcontinental.room_service.dto.response.building;

import com.hotelcontinental.room_service.enums.FloorStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FloorResponse {
    String id;
    String buildingId;
    String name;
    Integer floorNumber;
    FloorStatus status;
}
