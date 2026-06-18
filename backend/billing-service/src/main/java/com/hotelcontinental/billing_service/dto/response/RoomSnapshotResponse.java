package com.hotelcontinental.billing_service.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomSnapshotResponse {
    String id;
    String roomTypeId;
    String name;
}
