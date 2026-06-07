package com.hotelcontinental.identity_service.configuration;

import com.hotelcontinental.identity_service.entity.Accounts;
import com.hotelcontinental.identity_service.entity.Roles;
import com.hotelcontinental.identity_service.entity.User;
import com.hotelcontinental.identity_service.enums.AccountStatus;
import com.hotelcontinental.identity_service.enums.Role;
import com.hotelcontinental.identity_service.enums.UserStatus;
import com.hotelcontinental.identity_service.repository.AccountsRepository;
import com.hotelcontinental.identity_service.repository.RolesRepository;
import com.hotelcontinental.identity_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {
    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "admin";
    private static final String ADMIN_EMAIL = "admin@hotelcontinental.local";

    private final AccountsRepository accountsRepository;
    private final RolesRepository rolesRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Role[] requiredRoles = {Role.ADMIN, Role.STAFF, Role.CUSTOMER};
        for (Role role : requiredRoles) {
            ensureRole(role);
        }

        if (accountsRepository.existsByUsername(ADMIN_USERNAME)) {
            return;
        }

        Roles adminRole = ensureRole(Role.ADMIN);
        LocalDateTime now = LocalDateTime.now();

        User adminUser = userRepository.save(User.builder()
                .firstName("System")
                .lastName("Admin")
                .email(ADMIN_EMAIL)
                .status(UserStatus.ACTIVE)
                .userType(Role.ADMIN.name())
                .createdBy("system")
                .createdTime(now)
                .deleted(false)
                .build());

        accountsRepository.save(Accounts.builder()
                .username(ADMIN_USERNAME)
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .status(AccountStatus.ACTIVE)
                .userId(adminUser.getId())
                .roles(Collections.singleton(adminRole))
                .createdBy("system")
                .createdTime(now)
                .deleted(false)
                .build());

        log.warn("Created default admin account. username={}, password={}", ADMIN_USERNAME, ADMIN_PASSWORD);
    }

    private Roles ensureRole(Role role) {
        return rolesRepository.findByName(role)
                .orElseGet(() -> rolesRepository.save(Roles.builder()
                        .name(role)
                        .createdBy("system")
                        .createdTime(LocalDateTime.now())
                        .deleted(false)
                        .build()));
    }
}
