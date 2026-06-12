package com.hotelcontinental.identity_service.dto.request.Permission;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountPermissionUpdateRequest {
    List<String> permissionNames;
}
