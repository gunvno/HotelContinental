package com.hotelcontinental.room_service.dto.request.floor;

import com.hotelcontinental.room_service.entity.Building;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FloorCreationRequest {
    Building building;
    String name;
    int numberOfRooms;
}
