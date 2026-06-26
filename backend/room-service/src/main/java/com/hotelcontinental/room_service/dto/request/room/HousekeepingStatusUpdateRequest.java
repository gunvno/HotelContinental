package com.hotelcontinental.room_service.dto.request.room;

import com.hotelcontinental.room_service.enums.HousekeepingStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HousekeepingStatusUpdateRequest {
    HousekeepingStatus housekeepingStatus;
    String note;
}
