package com.hotelcontinental.booking_service.repository;

import com.hotelcontinental.booking_service.entity.RoomBookings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomBookingsRepository extends JpaRepository<RoomBookings, String> {
    @Query("""
            select booking
            from RoomBookings booking
            where booking.deleted = false or booking.deleted is null
            order by booking.createdTime desc
            """)
    List<RoomBookings> findAllByDeletedFalseOrderByCreatedTimeDesc();
}
