package com.hotelcontinental.identity_service.repository;

import com.hotelcontinental.identity_service.entity.Roles;
import com.hotelcontinental.identity_service.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolesRepository extends JpaRepository<Roles, String> {
    Optional<Roles> findByName(Role name);
}
