package com.hotelcontinental.identity_service.repository;

import com.hotelcontinental.identity_service.entity.Accounts;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountsRepository extends JpaRepository<Accounts, String> {
    boolean existsByUsername(String username);

    @EntityGraph(attributePaths = {"roles", "roles.permissions", "user"})
    Optional<Accounts> findByUsername(String username);

    @EntityGraph(attributePaths = {"roles", "roles.permissions", "user"})
    Optional<Accounts> findByUserId(String userId);

    @EntityGraph(attributePaths = {"roles", "roles.permissions", "user"})
    @Query("""
        select account
        from Accounts account
        join account.user user
        where account.username = :identifier or user.email = :identifier
        """)
    Optional<Accounts> findByUsernameOrEmail(@Param("identifier") String identifier);
}
