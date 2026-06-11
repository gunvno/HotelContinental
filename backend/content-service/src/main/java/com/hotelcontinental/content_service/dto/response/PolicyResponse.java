package com.hotelcontinental.content_service.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PolicyResponse {
    String id;
    String policyTypeId;
    String title;
    String content;
    LocalDateTime createdTime;
    LocalDateTime modifiedTime;
}
