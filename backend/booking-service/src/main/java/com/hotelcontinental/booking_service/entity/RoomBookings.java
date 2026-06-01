package com.hotelmanagement.entity;

import com.hotelmanagement.enums.BookingType;
import com.hotelmanagement.enums.RoomBookingStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "room_bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomBookings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    User customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_type", nullable = false)
    BookingType bookingType;
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    RoomBookingStatus status;
    @Column(name = "total_price", nullable = false)
    float totalPrice;
    @Column(name = "total_room_price", nullable = false)
    float totalRoomPrice;
    @Column(name = "total_service_price", nullable = false)
    float totalServicePrice;
    @Column(name = "total_extra_price", nullable = false)
    float totalExtraPrice;

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

    @OneToMany(mappedBy = "roomBookings", cascade = CascadeType.ALL, orphanRemoval = true)
    List<PaymentHistory> paymentHistories;
    @OneToMany(mappedBy = "roomBookings", cascade = CascadeType.ALL, orphanRemoval = true)
    List<RoomBookingDetails> roomBookingDetails;
    @OneToMany(mappedBy = "roomBookings", cascade = CascadeType.ALL, orphanRemoval = true)
    List<VoucherDetails> voucherDetails;
}
