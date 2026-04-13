package com.hotelcontinental.room_service.dto.request.roomtypeservice;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomTypeServiceUpdateRequest {
    String serviceId;
    int amount;
}
