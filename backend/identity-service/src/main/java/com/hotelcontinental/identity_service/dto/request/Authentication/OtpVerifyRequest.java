package com.hotelcontinental.identity_service.dto.request.Authentication;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OtpVerifyRequest {
    String email;
    String inputOtp;
    String expectedType;
}
