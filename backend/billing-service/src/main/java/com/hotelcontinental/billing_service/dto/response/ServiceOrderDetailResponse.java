package com.hotelcontinental.billing_service.dto.response;

import com.hotelcontinental.billing_service.enums.ServiceOrderDetailStatus;
import com.hotelcontinental.billing_service.enums.ServiceOrderApprovalStatus;
import com.hotelcontinental.billing_service.enums.ServiceOrderPaymentStatus;
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
    ServiceOrderApprovalStatus approvalStatus;
    ServiceOrderSource source;
    Boolean chargeable;
    ServiceOrderPaymentStatus paymentStatus;
    String paymentRequestId;
    LocalDateTime paymentTime;
    String paidBy;
    String assignedTo;
    String assignedBy;
    LocalDateTime assignedTime;
    LocalDateTime servedTime;
    String servedBy;
    LocalDateTime createdTime;
    String createdBy;
}
