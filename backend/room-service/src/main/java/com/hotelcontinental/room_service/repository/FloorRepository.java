package com.hotelcontinental.room_service.repository;

import com.hotelcontinental.room_service.entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FloorRepository extends JpaRepository<Floor, String> {
    List<Floor> findAllByBuildingIdAndDeletedFalseOrderByFloorNumberAsc(String buildingId);
}
