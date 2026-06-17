package com.hotelcontinental.booking_service.entity;

import com.hotelcontinental.booking_service.enums.RoomBookingDetailStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "room_booking_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomBookingDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "room_id")
    String roomId;

    @ManyToOne
    @JoinColumn(name = "room_booking_id")
    RoomBookings roomBookings;
    @Column(name = "price")
    float price;
    @Column(name = "total_price")
    float totalPrice;
    @Column(name = "checkin")
    LocalDateTime checkin;
    @Column(name = "checkout")
    LocalDateTime checkout;
    @Column(name = "checkin_reality")
    LocalDateTime checkinReality;
    @Column(name = "checkout_reality")
    LocalDateTime checkoutReality;
    @Column(name = "deposit")
    float deposit;
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    RoomBookingDetailStatus status;


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
    @OneToMany(mappedBy = "roomBookingDetails", cascade = CascadeType.ALL, orphanRemoval = true)
    List<ResidenceRegistration> residenceRegistrations;
    @OneToMany(mappedBy = "roomBookingDetails", cascade = CascadeType.ALL, orphanRemoval = true)
    List<EditHistory> editHistories;

}
