package com.hotelcontinental.room_service.dto.response.building;

import com.hotelcontinental.room_service.enums.BuildingStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BuildingResponse {
    String id;
    String name;
    String description;
    String address;
    BuildingStatus status;
    LocalDateTime createdTime;
    String createdBy;
}
