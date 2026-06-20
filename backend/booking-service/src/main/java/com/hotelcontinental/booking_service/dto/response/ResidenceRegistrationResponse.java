package com.hotelcontinental.booking_service.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResidenceRegistrationResponse {
    String id;
    String roomBookingDetailId;
    String fullName;
    String identityNumber;
    String gender;
    String dateOfBirth;
}
