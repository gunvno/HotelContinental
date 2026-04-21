package com.hotelcontinental.room_service.dto.response.roomtype;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomTypeResponse {
    String id;
    String name;
    String description;
    int maximumOccupancy;
    int quantity;
    LocalDateTime createdTime;
    String createdBy;
    LocalDateTime modifiedTime;
    String modifiedBy;
    Boolean deleted = false;
    LocalDateTime deletedTime;
    String deletedBy;
}
