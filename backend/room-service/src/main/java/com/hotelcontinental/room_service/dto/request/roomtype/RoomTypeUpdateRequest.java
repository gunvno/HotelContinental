package com.hotelcontinental.room_service.dto.request.roomtype;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomTypeUpdateRequest {
    String name;
    String description;
    int maximumOccupancy;
    int quantity;
}
