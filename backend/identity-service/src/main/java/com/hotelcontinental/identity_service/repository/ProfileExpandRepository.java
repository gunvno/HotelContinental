package com.hotelcontinental.identity_service.repository;

import com.hotelcontinental.identity_service.entity.ProfileExpands;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfileExpandRepository extends JpaRepository<ProfileExpands, String> {
    boolean existsById(String id);
}
