package com.hotelcontinental.room_service.entity;

import com.hotelcontinental.room_service.enums.RoomStatus;
import com.hotelcontinental.room_service.enums.HousekeepingStatus;
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

    @Column(name = "room_type_id")
    String roomTypeId;

    @Column(name = "floor_id")
    String floorId;

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
    @Column(name = "description")
    String description;
    @Column(name = "room_size", nullable = false)
    String roomSize;
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    RoomStatus status;
    @Enumerated(EnumType.STRING)
    @Column(name = "housekeeping_status", nullable = false)
    @Builder.Default
    HousekeepingStatus housekeepingStatus = HousekeepingStatus.CLEAN;
    @Column(name = "housekeeping_note", length = 500)
    String housekeepingNote;
    @Column(name = "housekeeping_updated_time")
    LocalDateTime housekeepingUpdatedTime;
    @Column(name = "housekeeping_updated_by", length = 100)
    String housekeepingUpdatedBy;
    @Column(name = "housekeeping_assigned_to", length = 100)
    String housekeepingAssignedTo;
    @Column(name = "housekeeping_assigned_by", length = 100)
    String housekeepingAssignedBy;
    @Column(name = "housekeeping_assigned_time")
    LocalDateTime housekeepingAssignedTime;
    @Column(name = "housekeeping_completed_by", length = 100)
    String housekeepingCompletedBy;
    @Column(name = "housekeeping_completed_time")
    LocalDateTime housekeepingCompletedTime;
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
