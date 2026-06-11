package com.hotelcontinental.content_service.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PolicyTypeResponse {
    String id;
    String code;
    String titleOfType;
    String content;
    List<PolicyResponse> policies;
    LocalDateTime createdTime;
    LocalDateTime modifiedTime;
}
