package com.hotelcontinental.room_service.repository;

import com.hotelcontinental.room_service.entity.Images;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<Images, String> {
    List<Images> findAllByRoomIdAndDeletedFalse(String roomId);
    Optional<Images> findByIdAndRoomIdAndDeletedFalse(String id, String roomId);
}
