package com.hotelcontinental.room_service.dto.response.floor;

import com.hotelcontinental.room_service.entity.Building;
import com.hotelcontinental.room_service.entity.Rooms;
import com.hotelcontinental.room_service.enums.FloorStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FloorCustomerResponse {
    Building building;
    String name;
    int numberOfRooms;
    FloorStatus status;
    List<Rooms> rooms;
}
