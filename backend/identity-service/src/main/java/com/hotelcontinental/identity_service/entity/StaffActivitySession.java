package com.hotelcontinental.identity_service.entity;

import com.hotelcontinental.identity_service.enums.StaffActivityStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "staff_activity_sessions")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StaffActivitySession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "account_id", nullable = false)
    String accountId;

    @Column(name = "user_id", nullable = false)
    String userId;

    @Column(name = "username", nullable = false, length = 100)
    String username;

    @Column(name = "full_name", length = 255)
    String fullName;

    @Column(name = "primary_role", length = 100)
    String primaryRole;

    @Column(name = "login_time", nullable = false)
    LocalDateTime loginTime;

    @Column(name = "logout_time")
    LocalDateTime logoutTime;

    @Column(name = "work_check_in_time")
    LocalDateTime workCheckInTime;

    @Column(name = "work_check_out_time")
    LocalDateTime workCheckOutTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    StaffActivityStatus status;

    @Column(name = "created_time")
    LocalDateTime createdTime;

    @Column(name = "modified_time")
    LocalDateTime modifiedTime;
}
