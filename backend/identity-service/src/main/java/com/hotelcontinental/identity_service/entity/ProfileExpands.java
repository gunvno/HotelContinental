package com.hotelcontinental.identity_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "profile_expands")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileExpands {
    @Id
    @Column(length = 36, nullable = false)
    String id;


    @Column(name = "gender")
    String gender;
    @Column(name = "date_of_birth")
    String dateOfBirth;
    @Column(name = "address")
    String address;
    @Column(name = "phone_number")
    String phoneNumber;
    @Column(name = "identity_number")
    String identityNumber;

    @Column(name = "created_time")
    LocalDateTime createdTime;

    @Column(name = "created_by", length = 100)
    String createdBy;

    @Column(name = "modified_time")
    LocalDateTime modifiedTime;

    @Column(name = "modified_by", length = 100)
    String modifiedBy;

    @Column(name = "deleted")
    Boolean deleted = false;

    @Column(name = "deleted_time")
    LocalDateTime deletedTime;

    @Column(name = "deleted_by", length = 100)
    String deletedBy;
}
