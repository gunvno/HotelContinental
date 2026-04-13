package com.hotelcontinental.room_service.dto.request.amenity;

import com.hotelcontinental.room_service.enums.AmenityStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AmenityUpdateRequest {
    String name;
    String description;
    AmenityStatus status;
}
