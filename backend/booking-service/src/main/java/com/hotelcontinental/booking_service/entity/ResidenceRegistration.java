package com.hotelmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "residence_registration")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResidenceRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_booking_detail_id", nullable = false)
    RoomBookingDetails roomBookingDetails;
    @Column(name = "full_name", nullable = false)
    String fullName;
    @Column(name = "identity_number", nullable = false)
    String identityNumber;
    @Column(name = "gender", nullable = false)
    String gender;
    @Column(name = "date_of_birth", nullable = false)
    String dateOfBirth;
}
