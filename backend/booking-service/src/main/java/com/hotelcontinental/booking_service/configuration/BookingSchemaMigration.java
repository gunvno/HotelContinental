package com.hotelcontinental.booking_service.configuration;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.DependsOn;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@DependsOn("entityManagerFactory")
@RequiredArgsConstructor
public class BookingSchemaMigration {
    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    void widenStatusColumns() {
        jdbcTemplate.execute("alter table room_bookings modify status varchar(30) not null");
        jdbcTemplate.execute("alter table room_booking_details modify status varchar(30)");
    }
}
