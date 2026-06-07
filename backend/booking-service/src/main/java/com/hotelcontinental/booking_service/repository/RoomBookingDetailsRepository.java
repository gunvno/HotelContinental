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
}
