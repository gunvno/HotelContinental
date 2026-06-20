package com.hotelcontinental.identity_service.dto.request.Permission;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountStatusUpdateRequest {
    String status;
}
