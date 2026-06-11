package com.hotelcontinental.content_service.repository;

import com.hotelcontinental.content_service.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, String> {
    @Query("""
            select policy
            from Policy policy
            where policy.policyTypes.id = :policyTypeId
              and (policy.deleted = false or policy.deleted is null)
            order by policy.createdTime asc
            """)
    List<Policy> findAvailableByPolicyTypeId(@Param("policyTypeId") String policyTypeId);
}
