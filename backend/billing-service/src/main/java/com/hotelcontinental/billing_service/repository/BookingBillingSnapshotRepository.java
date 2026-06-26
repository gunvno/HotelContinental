package com.hotelcontinental.billing_service.repository;

import com.hotelcontinental.billing_service.entity.BookingBillingSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingBillingSnapshotRepository extends JpaRepository<BookingBillingSnapshot, String> {
}
