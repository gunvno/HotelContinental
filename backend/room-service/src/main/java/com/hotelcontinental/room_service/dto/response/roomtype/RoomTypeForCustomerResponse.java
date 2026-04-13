package com.hotelcontinental.room_service.dto.response.roomtype;

import com.hotelcontinental.room_service.entity.AmenityRooms;
import com.hotelcontinental.room_service.entity.RoomTypeServices;
import com.hotelcontinental.room_service.entity.Rooms;
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
public class RoomTypeForCustomerResponse {
    String id;
    String name;
    String description;
    int maximumOccupancy;
    int quantity;
}
