package com.hotelcontinental.room_service.repository;

import com.hotelcontinental.room_service.entity.RoomTypeServices;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomTypeServicesRepository extends JpaRepository<RoomTypeServices, String> {
    List<RoomTypeServices> findByRoomTypesId(String roomTypeId);
    Page<RoomTypeServices> findByRoomTypesId(String roomTypeId, Pageable pageable);
}
