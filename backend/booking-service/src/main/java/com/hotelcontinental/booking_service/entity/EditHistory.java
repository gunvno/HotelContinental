package com.hotelcontinental.booking_service.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Entity
@Table(name = "edit_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EditHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_booking_detail_id", nullable = false)
    RoomBookingDetails roomBookingDetails;
    @Column(name = "field_name", nullable = false)
    String fieldName;
    @Column(name = "content" , nullable = false)
    String content;
    @Column(name = "description")
    String description;
    @Column(name = "modified_at")
    LocalDate modifiedAt;


}
