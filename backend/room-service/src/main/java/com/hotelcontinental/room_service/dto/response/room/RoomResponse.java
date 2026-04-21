package com.hotelcontinental.room_service.dto.response.room;

import com.hotelcontinental.room_service.dto.response.roomtype.RoomTypeResponse;
import com.hotelcontinental.room_service.enums.RoomStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomResponse {
    String id;
    RoomTypeResponse roomTypes;
    String image;
    String name;
    Float pricePerDay;
    Float pricePerHour;
    String address;
    String description;
    String roomSize;
    RoomStatus status;
    LocalDateTime createdTime;
    String createdBy;
    LocalDateTime modifiedTime;
    String modifiedBy;
    Boolean deleted = false;
    LocalDateTime deletedTime;
    String deletedBy;
}
