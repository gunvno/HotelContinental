package com.hotelcontinental.billing_service.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CatalogServiceSnapshotResponse {
    String id;
    String name;
    float price;
    String status;
    Boolean deleted;
}
