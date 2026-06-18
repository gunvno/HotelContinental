package com.hotelcontinental.catalog_service.entity;

import com.hotelcontinental.catalog_service.enums.RoomRateRuleType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_rate_rules")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomRateRule {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "room_type_id")
    String roomTypeId;

    @Column(name = "name", nullable = false)
    String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", nullable = false)
    RoomRateRuleType ruleType;

    @Column(name = "start_date", nullable = false)
    LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    LocalDate endDate;

    @Column(name = "days_of_week")
    String daysOfWeek;

    @Column(name = "multiplier", nullable = false, precision = 8, scale = 3)
    BigDecimal multiplier;

    @Column(name = "priority", nullable = false)
    Integer priority;

    @Column(name = "note")
    String note;

    @Builder.Default
    @Column(name = "active", nullable = false)
    Boolean active = true;

    @Column(name = "created_time")
    LocalDateTime createdTime;

    @Column(name = "created_by", length = 100)
    String createdBy;

    @Column(name = "modified_time")
    LocalDateTime modifiedTime;

    @Column(name = "modified_by", length = 100)
    String modifiedBy;

    @Builder.Default
    @Column(name = "deleted")
    Boolean deleted = false;

    @Column(name = "deleted_time")
    LocalDateTime deletedTime;

    @Column(name = "deleted_by", length = 100)
    String deletedBy;
}
