package com.hotelcontinental.promotion_service.repository;

import com.hotelcontinental.promotion_service.entity.VoucherDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherDetailsRepository extends JpaRepository<VoucherDetails, String> {
    @Query("""
            select detail
            from VoucherDetails detail
            where upper(detail.code) = upper(:code)
              and (detail.deleted = false or detail.deleted is null)
            """)
    Optional<VoucherDetails> findAvailableByCode(@Param("code") String code);
}
