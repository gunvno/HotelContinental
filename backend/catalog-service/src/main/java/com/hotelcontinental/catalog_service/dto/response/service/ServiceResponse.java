package com.hotelcontinental.catalog_service.dto.response.service;

import com.hotelcontinental.catalog_service.enums.ServiceStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceResponse {
    String id;
    String name;
    String description;
    float price;
    String image;
    ServiceStatus status;
    Boolean deleted;
    LocalDateTime createdTime;
    String createdBy;
    LocalDateTime modifiedTime;
    String modifiedBy;
}
