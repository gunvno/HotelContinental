package com.hotelcontinental.identity_service.dto.response.StaffActivity;

import com.hotelcontinental.identity_service.enums.StaffActivityStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StaffActivitySessionResponse {
    String id;
    String accountId;
    String userId;
    String username;
    String fullName;
    String primaryRole;
    LocalDateTime loginTime;
    LocalDateTime logoutTime;
    LocalDateTime workCheckInTime;
    LocalDateTime workCheckOutTime;
    StaffActivityStatus status;
    Long loginDurationMinutes;
    Long workDurationMinutes;
}
