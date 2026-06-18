package com.hotelcontinental.billing_service.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomTypeServiceSnapshotResponse {
    String id;
    String roomTypeId;
    String roomTypeName;
    String serviceId;
    String serviceName;
    int amount;
    Boolean deleted;
}
