package com.hotelcontinental.identity_service.dto.response.Permission;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StaffPermissionResponse {
    String accountId;
    String userId;
    String username;
    String email;
    String fullName;
    List<String> rolePermissions;
    List<String> directPermissions;
    List<String> effectivePermissions;
    List<String> availablePermissions;
}
