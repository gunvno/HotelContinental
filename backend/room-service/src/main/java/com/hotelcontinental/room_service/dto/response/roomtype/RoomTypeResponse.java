package com.hotelcontinental.room_service.dto.response.roomtype;

import com.hotelcontinental.room_service.entity.AmenityRooms;
import com.hotelcontinental.room_service.entity.RoomTypeServices;
import com.hotelcontinental.room_service.entity.Rooms;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
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
    List<Rooms> rooms;
    List<AmenityRooms> amenityRooms;
    List<RoomTypeServices> roomTypeServices;
}
