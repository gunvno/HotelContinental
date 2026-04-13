package com.hotelcontinental.room_service.repository;

import com.hotelcontinental.room_service.entity.Amenities;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AmenitiesRepository extends JpaRepository<Amenities, String> {
    Page<Amenities> findByDeletedFalse(Pageable pageable);
    Optional<Amenities> findByIdAndDeletedFalse(String id);
}
