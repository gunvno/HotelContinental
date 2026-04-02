package com.hotelcontinental.room_service.repository;

import com.hotelcontinental.room_service.entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FloorRepository extends JpaRepository<Floor, String> {
    boolean existsByName(String name);
    Optional<Floor> findById(String id);
    List<Floor> findByBuildingId(String buildingId);
}
