package com.hotelcontinental.identity_service.dto.identity;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationParam {
    String username;
    Boolean enabled;
    String email;
    Boolean emailVerified;
    String firstName;
    String lastName;
}
