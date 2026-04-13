package com.hotelcontinental.room_service.repository;

import com.hotelcontinental.room_service.entity.AmenityRooms;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AmenitiesRoomsRepository extends JpaRepository<AmenityRooms, String> {
    List<AmenityRooms> findByRoomTypesIdAndDeletedFalse(String roomTypeId);
    Page<AmenityRooms> findByRoomTypesIdAndDeletedFalse(String roomTypeId, Pageable pageable);
    List<AmenityRooms> findByAmenityIdAndDeletedFalse(String amenityId);
    Optional<AmenityRooms> findByIdAndDeletedFalse(String id);
}
