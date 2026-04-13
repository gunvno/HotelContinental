package com.hotelcontinental.room_service.dto.request.roomtype;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomTypeCreationRequest {
    String name;
    String description;
    int maximumOccupancy;
    int quantity;
}
