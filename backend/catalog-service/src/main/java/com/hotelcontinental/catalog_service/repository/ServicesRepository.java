package com.hotelcontinental.catalog_service.repository;

import com.hotelcontinental.catalog_service.entity.Services;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServicesRepository extends JpaRepository<Services, String> {
}
