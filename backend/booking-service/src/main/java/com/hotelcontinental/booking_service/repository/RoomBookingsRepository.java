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

    @Query(value = """
            select
              b.id,
              b.customer_id,
              b.booking_type,
              b.status,
              b.total_room_price,
              b.total_service_price,
              b.total_extra_price,
              b.total_price,
              b.voucher_code,
              b.discount_amount,
              b.refund_status,
              b.refund_amount,
              d.id as detail_id,
              d.room_id,
              d.status as detail_status,
              d.checkin,
              d.checkout,
              d.checkin_reality,
              d.checkout_reality,
              d.price,
              d.deposit
            from room_bookings b
            left join room_booking_details d
              on d.id = (
                select d2.id
                from room_booking_details d2
                where d2.room_booking_id = b.id
                  and (d2.deleted = false or d2.deleted is null)
                order by d2.created_time desc
                limit 1
              )
            where (b.deleted = false or b.deleted is null)
            order by b.created_time desc
            """, nativeQuery = true)
    List<Object[]> findActiveBookingRows();

    @Query(value = """
            select
              b.id,
              b.customer_id,
              b.booking_type,
              b.status,
              b.total_room_price,
              b.total_service_price,
              b.total_extra_price,
              b.total_price,
              b.voucher_code,
              b.discount_amount,
              b.refund_status,
              b.refund_amount,
              d.id as detail_id,
              d.room_id,
              d.status as detail_status,
              d.checkin,
              d.checkout,
              d.checkin_reality,
              d.checkout_reality,
              d.price,
              d.deposit
            from room_bookings b
            left join room_booking_details d
              on d.id = (
                select d2.id
                from room_booking_details d2
                where d2.room_booking_id = b.id
                  and (d2.deleted = false or d2.deleted is null)
                order by d2.created_time desc
                limit 1
              )
            where (b.deleted = false or b.deleted is null)
              and b.customer_id = :customerId
            order by b.created_time desc
            """, nativeQuery = true)
    List<Object[]> findActiveBookingRowsByCustomerId(String customerId);

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
