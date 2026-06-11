package com.hotelcontinental.content_service.repository;

import com.hotelcontinental.content_service.entity.PolicyTypes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyTypesRepository extends JpaRepository<PolicyTypes, String> {
    @Query("""
            select type
            from PolicyTypes type
            where type.deleted = false or type.deleted is null
            order by type.createdTime desc
            """)
    List<PolicyTypes> findAvailable();

    @Query("""
            select type
            from PolicyTypes type
            where upper(type.code) = upper(:code)
              and (type.deleted = false or type.deleted is null)
            """)
    Optional<PolicyTypes> findAvailableByCode(@Param("code") String code);
}
