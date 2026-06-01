package com.hotelcontinental.room_service.dto.request.amenityroom;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AmenityRoomUpdateRequest {
    String roomTypeId;
    String amenityId;
    float amount;
    Boolean deleted;
}
