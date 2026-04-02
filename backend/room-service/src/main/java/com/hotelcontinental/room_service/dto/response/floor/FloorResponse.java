package com.hotelcontinental.room_service.dto.response.floor;

import com.hotelcontinental.room_service.entity.Building;
import com.hotelcontinental.room_service.entity.Rooms;
import com.hotelcontinental.room_service.enums.FloorStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FloorResponse {
    Building building;
    String name;
    int numberOfRooms;
    FloorStatus status;
    LocalDateTime createdTime;
    String createdBy;
    LocalDateTime modifiedTime;
    String modifiedBy;
    Boolean deleted = false;
    LocalDateTime deletedTime;
    String deletedBy;
    List<Rooms> rooms;
}
