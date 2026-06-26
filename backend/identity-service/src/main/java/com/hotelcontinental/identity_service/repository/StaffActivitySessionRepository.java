package com.hotelcontinental.identity_service.repository;

import com.hotelcontinental.identity_service.entity.StaffActivitySession;
import com.hotelcontinental.identity_service.enums.StaffActivityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffActivitySessionRepository extends JpaRepository<StaffActivitySession, String> {
    List<StaffActivitySession> findTop200ByOrderByLoginTimeDesc();

    List<StaffActivitySession> findByAccountIdOrderByLoginTimeDesc(String accountId);

    Optional<StaffActivitySession> findFirstByAccountIdAndStatusOrderByLoginTimeDesc(
            String accountId,
            StaffActivityStatus status
    );

    Optional<StaffActivitySession> findFirstByAccountIdAndWorkCheckInTimeIsNotNullAndWorkCheckOutTimeIsNullOrderByWorkCheckInTimeDesc(
            String accountId
    );
}
