package com.hotelcontinental.identity_service.repository;

import com.hotelcontinental.identity_service.entity.Permissions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionsRepository extends JpaRepository<Permissions, String> {
    Optional<Permissions> findByName(String name);

    @Query("""
            select permission
            from Permissions permission
            where permission.deleted = false or permission.deleted is null
            order by permission.name asc
            """)
    List<Permissions> findAvailable();
}
