package com.hotelcontinental.catalog_service.dto.request.service;

import com.hotelcontinental.catalog_service.enums.ServiceStatus;
import com.hotelcontinental.catalog_service.enums.ServiceOrderMode;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceRequest {
    String name;
    String description;
    Float price;
    String image;
    ServiceStatus status;
    ServiceOrderMode orderMode;
    Boolean deleted;
}
