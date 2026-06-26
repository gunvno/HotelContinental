package com.hotelcontinental.report_service.repository;

import com.hotelcontinental.report_service.entity.BookingReportSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingReportSnapshotRepository extends JpaRepository<BookingReportSnapshot, String> {
}
