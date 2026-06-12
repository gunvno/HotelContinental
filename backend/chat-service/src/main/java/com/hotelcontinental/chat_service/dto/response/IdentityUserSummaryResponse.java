package com.hotelcontinental.chat_service.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IdentityUserSummaryResponse {
    String id;
    String username;
    String firstName;
    String lastName;
    String email;
}
