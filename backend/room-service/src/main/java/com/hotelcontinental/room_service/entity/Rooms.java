package com.hotelcontinental.room_service.entity;

import com.hotelcontinental.room_service.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Rooms {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @ManyToOne
    @JoinColumn(name = "room_type_id")
    RoomTypes roomTypes;
    @Column(name = "image")
    String image;
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Images> images;
    @Column(name = "name", nullable = false)
    String name;
    @Column(name = "price_per_day", nullable = false)
    Float pricePerDay;
    @Column(name = "price_per_hour", nullable = false)
    Float pricePerHour;
    @Column(name = "address", nullable = false)
    String address;
    @Column(name = "description")
    String description;
    @Column(name = "room_size", nullable = false)
    String roomSize;
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    RoomStatus status;
    @Column(name = "created_time")
    LocalDateTime createdTime;
    @Column(name = "created_by", length = 100)
    String createdBy;
    @Column(name = "modified_time")
    LocalDateTime modifiedTime;
    @Column(name = "modified_by", length = 100)
    String modifiedBy;
    @Column(name = "deleted")
    @Builder.Default
    Boolean deleted = false;
    @Column(name = "deleted_time")
    LocalDateTime deletedTime;
    @Column(name = "deleted_by", length = 100)
    String deletedBy;
}
