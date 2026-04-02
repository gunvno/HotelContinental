package com.hotelcontinental.room_service.dto.response.building;

import com.hotelcontinental.room_service.entity.Floor;
import com.hotelcontinental.room_service.enums.BuildingStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BuildingResponse {
    String name;
    BuildingStatus status;
    String address;
    LocalDateTime createdTime;
    String createdBy;
    LocalDateTime modifiedTime;
    String modifiedBy;
    Boolean deleted = false;
    LocalDateTime deletedTime;
    String deletedBy;
    List<Floor> floors;
}
