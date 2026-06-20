package com.hotelcontinental.booking_service.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EditHistoryResponse {
    String id;
    String roomBookingDetailId;
    String fieldName;
    String content;
    String description;
    LocalDateTime modifiedAt;
    String modifiedBy;
}
