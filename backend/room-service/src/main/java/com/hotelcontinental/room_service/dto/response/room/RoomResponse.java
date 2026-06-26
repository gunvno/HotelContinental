package com.hotelcontinental.room_service.dto.response.room;

import com.hotelcontinental.room_service.enums.RoomStatus;
import com.hotelcontinental.room_service.enums.HousekeepingStatus;
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
    String roomTypeId;
    String floorId;
    String image;
    String name;
    Float pricePerDay;
    Float pricePerHour;
    String description;
    String roomSize;
    RoomStatus status;
    HousekeepingStatus housekeepingStatus;
    String housekeepingNote;
    LocalDateTime housekeepingUpdatedTime;
    String housekeepingUpdatedBy;
    String housekeepingAssignedTo;
    String housekeepingAssignedBy;
    LocalDateTime housekeepingAssignedTime;
    String housekeepingCompletedBy;
    LocalDateTime housekeepingCompletedTime;
    LocalDateTime createdTime;
    String createdBy;
    LocalDateTime modifiedTime;
    String modifiedBy;
    Boolean deleted = false;
    LocalDateTime deletedTime;
    String deletedBy;
}
