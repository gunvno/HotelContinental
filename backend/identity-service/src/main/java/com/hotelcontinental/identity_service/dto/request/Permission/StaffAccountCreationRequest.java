package com.hotelcontinental.identity_service.dto.request.Permission;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StaffAccountCreationRequest {
    String username;
    String password;
    String email;
    String firstName;
    String lastName;
    String roleName;
}
