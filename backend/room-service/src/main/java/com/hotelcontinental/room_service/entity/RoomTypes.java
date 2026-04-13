package com.hotelcontinental.room_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "room_types")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomTypes {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @Column(name = "name", nullable = false)
    String name;
    @Column(name = "description")
    String description;
    @Column(name = "maximum_occupancy", nullable = false)
    int maximumOccupancy;
    @Column(name = "quantity", nullable = false)
    int quantity;

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
    @OneToMany(mappedBy = "roomTypes",cascade = CascadeType.ALL, orphanRemoval = true)
    List<Rooms> rooms;
    @OneToMany(mappedBy = "roomTypes",cascade = CascadeType.ALL, orphanRemoval = true)
    List<AmenityRooms> amenityRooms;
    @OneToMany(mappedBy = "roomTypes",cascade = CascadeType.ALL, orphanRemoval = true)
    List<RoomTypeServices> roomTypeServices;
}
