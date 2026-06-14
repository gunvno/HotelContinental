package com.hotelcontinental.booking_service.repository;

import com.hotelcontinental.booking_service.entity.RoomBookings;
import com.hotelcontinental.booking_service.enums.RoomBookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

    @Query("""
            select booking
            from RoomBookings booking
            where booking.customerId = :customerId
              and (booking.deleted = false or booking.deleted is null)
            order by booking.createdTime desc
            """)
    List<RoomBookings> findByCustomerIdAndDeletedFalseOrderByCreatedTimeDesc(String customerId);

    @Query("""
            select booking
            from RoomBookings booking
            where (booking.deleted = false or booking.deleted is null)
              and booking.status = :status
              and booking.createdTime < :expiredBefore
            """)
    List<RoomBookings> findExpiredPendingBookings(
            RoomBookingStatus status,
            LocalDateTime expiredBefore
    );
}
