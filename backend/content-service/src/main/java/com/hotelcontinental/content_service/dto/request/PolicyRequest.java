package com.hotelcontinental.content_service.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PolicyRequest {
    String policyTypeId;
    String title;
    String content;
}
