package com.hotelcontinental.promotion_service.repository;

import com.hotelcontinental.promotion_service.entity.Vouchers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VouchersRepository extends JpaRepository<Vouchers, String> {
    @Query("""
            select voucher
            from Vouchers voucher
            where voucher.deleted = false or voucher.deleted is null
            order by voucher.createdTime desc
            """)
    List<Vouchers> findAvailableOrderByCreatedTimeDesc();
}
