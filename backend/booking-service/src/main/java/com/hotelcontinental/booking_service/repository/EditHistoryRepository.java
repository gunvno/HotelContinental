package com.hotelcontinental.booking_service.repository;

import com.hotelcontinental.booking_service.entity.EditHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EditHistoryRepository extends JpaRepository<EditHistory, String> {
    List<EditHistory> findByRoomBookingDetailsRoomBookingsIdOrderByModifiedAtDesc(String roomBookingId);
}
