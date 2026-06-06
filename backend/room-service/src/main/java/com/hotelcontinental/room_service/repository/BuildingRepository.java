package com.hotelcontinental.room_service.repository;

import com.hotelcontinental.room_service.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BuildingRepository extends JpaRepository<Building, String> {
    List<Building> findAllByDeletedFalse();
}
