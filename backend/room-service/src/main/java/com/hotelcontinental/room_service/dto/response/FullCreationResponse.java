package com.hotelcontinental.room_service.dto.response;

import com.hotelcontinental.room_service.enums.BuildingStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FullCreationResponse {
    String buildingName;
    String buildingAddress;
    int numberOfFloors;
    int numberOfRooms;
}
