package com.hotelcontinental.room_service.repository;

import com.hotelcontinental.room_service.entity.Rooms;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Rooms, String> {
    boolean existsByNameAndAddress(String name, String address);

    Page<Rooms> findAllByDeletedFalse(Pageable pageable);

    Optional<Rooms> findByIdAndDeletedFalse(String id);
}
