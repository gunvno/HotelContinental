package com.hotelcontinental.room_service.dto.response.room;

import com.hotelcontinental.room_service.enums.RoomStatus;
import com.hotelcontinental.room_service.enums.HousekeepingStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomForCustomerResponse {
    String id;
    String roomTypeId;
    String floorId;
    String image;
    String name;
    Float pricePerDay;
    Float pricePerHour;
    String description;
    String roomSize;
    RoomStatus status;
    HousekeepingStatus housekeepingStatus;
}
