package com.hotelcontinental.booking_service.repository;

import com.hotelcontinental.booking_service.entity.RoomBookingDetails;
import com.hotelcontinental.booking_service.enums.RoomBookingDetailStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface RoomBookingDetailsRepository extends JpaRepository<RoomBookingDetails, String> {
    List<RoomBookingDetails> findByRoomBookingsId(String roomBookingId);

    @Query("""
            select detail
            from RoomBookingDetails detail
            join detail.roomBookings booking
            where (detail.deleted = false or detail.deleted is null)
              and (booking.deleted = false or booking.deleted is null)
              and booking.customerId = :customerId
              and detail.roomId = :roomId
              and detail.checkin = :checkin
              and detail.checkout = :checkout
              and detail.status in :blockingStatuses
            order by detail.createdTime desc
            """)
    List<RoomBookingDetails> findExistingActiveBookingDetails(
            @Param("customerId") String customerId,
            @Param("roomId") String roomId,
            @Param("checkin") LocalDateTime checkin,
            @Param("checkout") LocalDateTime checkout,
            @Param("blockingStatuses") Collection<RoomBookingDetailStatus> blockingStatuses
    );

    @Query("""
            select distinct detail.roomId
            from RoomBookingDetails detail
            where (detail.deleted = false or detail.deleted is null)
              and detail.roomId is not null
              and detail.status in :blockingStatuses
              and detail.checkin < :endTime
              and detail.checkout > :startTime
            """)
    List<String> findBusyRoomIds(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("blockingStatuses") Collection<RoomBookingDetailStatus> blockingStatuses
    );

    @Query("""
            select count(detail) > 0
            from RoomBookingDetails detail
            where (detail.deleted = false or detail.deleted is null)
              and detail.id <> :excludedDetailId
              and detail.roomId = :roomId
              and detail.status in :blockingStatuses
              and detail.checkin < :endTime
              and detail.checkout > :startTime
            """)
    boolean existsOverlappingRoomBookingExcludingDetail(
            @Param("excludedDetailId") String excludedDetailId,
            @Param("roomId") String roomId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("blockingStatuses") Collection<RoomBookingDetailStatus> blockingStatuses
    );
}
