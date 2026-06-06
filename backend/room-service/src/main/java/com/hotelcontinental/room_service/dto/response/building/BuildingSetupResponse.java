package com.hotelcontinental.room_service.dto.response.building;

import com.hotelcontinental.room_service.dto.response.room.RoomResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BuildingSetupResponse {
    BuildingResponse building;
    List<FloorResponse> floors;
    List<RoomResponse> rooms;
    Integer createdFloorCount;
    Integer createdRoomCount;
}
