package com.hotelcontinental.room_service.dto.request.amenity;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AmenityCreationRequest {
    String name;
    String description;
}
