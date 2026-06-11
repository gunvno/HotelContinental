package com.hotelcontinental.booking_service.repository;

import com.hotelcontinental.booking_service.entity.RoomBookings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomBookingsRepository extends JpaRepository<RoomBookings, String> {
}
