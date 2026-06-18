package com.hotelcontinental.catalog_service.repository;

import com.hotelcontinental.catalog_service.entity.RoomRateRule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomRateRuleRepository extends JpaRepository<RoomRateRule, String> {
    @Query("""
            select r from RoomRateRule r
            where (r.deleted = false or r.deleted is null)
            """)
    Page<RoomRateRule> findActiveRecords(Pageable pageable);

    @Query("""
            select r from RoomRateRule r
            where (r.deleted = false or r.deleted is null)
              and r.active = true
              and r.startDate <= :date
              and r.endDate >= :date
              and ((:roomTypeId is not null and r.roomTypeId = :roomTypeId) or r.roomTypeId is null or r.roomTypeId = '')
            order by r.priority desc, r.multiplier desc
            """)
    List<RoomRateRule> findApplicableRules(@Param("roomTypeId") String roomTypeId, @Param("date") LocalDate date);
}
