package com.hotelcontinental.room_service.repository;

import com.hotelcontinental.room_service.entity.Rooms;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Rooms, String> {
}
