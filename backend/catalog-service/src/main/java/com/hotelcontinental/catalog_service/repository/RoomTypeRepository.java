package com.hotelcontinental.catalog_service.repository;

import com.hotelcontinental.catalog_service.entity.RoomTypes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomTypes, String> {
}

