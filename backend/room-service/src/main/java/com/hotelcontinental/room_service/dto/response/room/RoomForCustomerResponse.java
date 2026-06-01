package com.hotelcontinental.room_service.dto.response.room;

import com.hotelcontinental.room_service.enums.RoomStatus;
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
    String image;
    String name;
    Float pricePerDay;
    Float pricePerHour;
    String address;
    String description;
    String roomSize;
    RoomStatus status;
}
