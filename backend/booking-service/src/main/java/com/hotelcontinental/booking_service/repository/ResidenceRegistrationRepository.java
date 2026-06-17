package com.hotelcontinental.booking_service.repository;

import com.hotelcontinental.booking_service.entity.ResidenceRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResidenceRegistrationRepository extends JpaRepository<ResidenceRegistration, String> {
    void deleteByRoomBookingDetailsId(String roomBookingDetailId);
}
