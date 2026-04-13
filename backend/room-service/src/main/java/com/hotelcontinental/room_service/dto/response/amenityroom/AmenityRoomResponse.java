package com.hotelcontinental.room_service.dto.response.amenityroom;

import com.hotelcontinental.room_service.dto.response.amenity.AmenityResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AmenityRoomResponse {
    String id;
    AmenityResponse amenity;
    String roomTypeId;
    float amount;
    LocalDateTime createdTime;
    String createdBy;
    LocalDateTime modifiedTime;
    String modifiedBy;
    Boolean deleted;
}
