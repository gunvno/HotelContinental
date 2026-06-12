package com.hotelcontinental.billing_service.dto.response;

import com.hotelcontinental.billing_service.enums.ServiceOrderDetailStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceOrderDetailResponse {
    String id;
    String serviceId;
    String serviceName;
    String roomBookingId;
    String roomBookingDetailId;
    int quantity;
    int amount;
    float price;
    float totalPrice;
    String description;
    ServiceOrderDetailStatus status;
    LocalDateTime servedTime;
    LocalDateTime createdTime;
    String createdBy;
}
