package com.hotelcontinental.billing_service.dto.response;

import com.hotelcontinental.billing_service.enums.ServiceOrderDetailStatus;
import com.hotelcontinental.billing_service.enums.ServiceOrderSource;
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
    String roomId;
    String roomName;
    int quantity;
    int amount;
    float price;
    float totalPrice;
    String description;
    ServiceOrderDetailStatus status;
    ServiceOrderSource source;
    Boolean chargeable;
    LocalDateTime servedTime;
    String servedBy;
    LocalDateTime createdTime;
    String createdBy;
}
