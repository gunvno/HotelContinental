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
    List<AmenityRooms> findByRoomTypesId(String roomTypeId);
    Page<AmenityRooms> findByRoomTypesId(String roomTypeId, Pageable pageable);
    List<AmenityRooms> findByAmenityId(String amenityId);
}
