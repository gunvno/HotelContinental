package com.hotelcontinental.identity_service.entity;

import com.hotelcontinental.identity_service.enums.AccountStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "accounts")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Accounts {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "username", unique = true, nullable = false, length = 100)
    String username;

    @Column(name = "password", nullable = false, length = 255)
    String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    AccountStatus status;

    @Column(name = "user_id", nullable = false)
    String userId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
    User user;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "account_roles",
            joinColumns = @JoinColumn(name = "account_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    Set<Roles> roles;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "account_permissions",
            joinColumns = @JoinColumn(name = "account_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id"))
    Set<Permissions> permissions;

    @Column(name = "created_time")
    LocalDateTime createdTime;

    @Column(name = "created_by", length = 100)
    String createdBy;

    @Column(name = "modified_time")
    LocalDateTime modifiedTime;

    @Column(name = "modified_by", length = 100)
    String modifiedBy;

    @Column(name = "deleted")
    Boolean deleted = false;

    @Column(name = "deleted_time")
    LocalDateTime deletedTime;

    @Column(name = "deleted_by", length = 100)
    String deletedBy;
}
