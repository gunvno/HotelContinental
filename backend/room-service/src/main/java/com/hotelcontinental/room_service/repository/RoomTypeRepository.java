package com.hotelcontinental.room_service.repository;

import com.hotelcontinental.room_service.entity.RoomTypes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomTypes, String> {
}
