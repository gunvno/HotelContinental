package com.hotelcontinental.room_service.dto.request.building;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BuildingSetupRequest {
    String buildingName;
    String description;
    String address;
    Integer floorStart;
    Integer floorEnd;
    Integer roomsPerFloor;
    String roomNumberPattern;
    String defaultRoomTypeId;
    Float defaultPricePerDay;
    Float defaultPricePerHour;
    String defaultRoomSize;
    List<String> skipRoomNumbers;
}
