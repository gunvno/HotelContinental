package com.hotelcontinental.room_service.repository;

import com.hotelcontinental.room_service.entity.Building;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BuildingRepository extends JpaRepository<Building, String> {
        boolean existsByName(String name);
        Optional<Building> findById(String id);

        @Query("SELECT b FROM Building b WHERE " +
                        "(:name IS NULL OR b.name LIKE %:name%) AND " +
                        "(:address IS NULL OR b.address LIKE %:address%) AND " +
                        "(b.deleted = false)")
        Page<Building> getBuilding(String name, String address, Pageable pageable);
        @Query("SELECT b FROM Building b WHERE " +
                "(:name IS NULL OR b.name LIKE %:name%) AND " +
                "(:address IS NULL OR b.address LIKE %:address%)")
        Page<Building> getAllBuilding(String name, String address, Pageable pageable);

}
