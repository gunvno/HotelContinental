package com.hotelcontinental.room_service.dto.request;

import com.hotelcontinental.room_service.enums.BuildingStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FullCreationRequest {
    String buildingName;
    String buildingAddress;
    int numberOfFloors;
    int numberOfRooms;
}
