package com.hotelcontinental.room_service.dto.request.building;

import com.hotelcontinental.room_service.enums.BuildingStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BuildingEditRequest {
    String address;
    BuildingStatus status;
    String name;
}
