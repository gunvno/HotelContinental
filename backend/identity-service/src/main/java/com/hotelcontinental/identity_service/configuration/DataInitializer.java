package com.hotelcontinental.identity_service.configuration;

import com.hotelcontinental.identity_service.entity.Accounts;
import com.hotelcontinental.identity_service.entity.Permissions;
import com.hotelcontinental.identity_service.entity.Roles;
import com.hotelcontinental.identity_service.entity.User;
import com.hotelcontinental.identity_service.enums.AccountStatus;
import com.hotelcontinental.identity_service.enums.Role;
import com.hotelcontinental.identity_service.enums.UserStatus;
import com.hotelcontinental.identity_service.repository.AccountsRepository;
import com.hotelcontinental.identity_service.repository.PermissionsRepository;
import com.hotelcontinental.identity_service.repository.RolesRepository;
import com.hotelcontinental.identity_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {
    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "admin";
    private static final String ADMIN_EMAIL = "admin@hotelcontinental.local";
    private static final String STAFF_USERNAME = "staff";
    private static final String STAFF_PASSWORD = "staff";
    private static final String STAFF_EMAIL = "staff@hotelcontinental.local";
    private static final String CUSTOMER_USERNAME = "customer";
    private static final String CUSTOMER_PASSWORD = "customer";
    private static final String CUSTOMER_EMAIL = "customer@hotelcontinental.local";

    private final AccountsRepository accountsRepository;
    private final RolesRepository rolesRepository;
    private final PermissionsRepository permissionsRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RolePermissionProperties rolePermissionProperties;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Role[] requiredRoles = {Role.ADMIN, Role.STAFF, Role.CUSTOMER};
        for (Role role : requiredRoles) {
            ensureRole(role);
        }
        syncRolePermissions();

        ensureDefaultAccount(
                ADMIN_USERNAME,
                ADMIN_PASSWORD,
                ADMIN_EMAIL,
                "System",
                "Admin",
                Role.ADMIN
        );
        ensureDefaultAccount(
                STAFF_USERNAME,
                STAFF_PASSWORD,
                STAFF_EMAIL,
                "System",
                "Staff",
                Role.STAFF
        );
        ensureDefaultAccount(
                CUSTOMER_USERNAME,
                CUSTOMER_PASSWORD,
                CUSTOMER_EMAIL,
                "Demo",
                "Customer",
                Role.CUSTOMER
        );
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

    private void ensureDefaultAccount(
            String username,
            String password,
            String email,
            String firstName,
            String lastName,
            Role roleName
    ) {
        if (accountsRepository.existsByUsername(username)) {
            return;
        }

        Roles role = ensureRole(roleName);
        LocalDateTime now = LocalDateTime.now();

        User user = userRepository.save(User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .status(UserStatus.ACTIVE)
                .userType(roleName.name())
                .createdBy("system")
                .createdTime(now)
                .deleted(false)
                .build());

        accountsRepository.save(Accounts.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .status(AccountStatus.ACTIVE)
                .userId(user.getId())
                .roles(Set.of(role))
                .createdBy("system")
                .createdTime(now)
                .deleted(false)
                .build());

        log.warn("Created default {} account. username={}, password={}", roleName, username, password);
    }

    private void syncRolePermissions() {
        assignPermissions(Role.ADMIN, rolePermissionProperties.getAdminPermission());
        assignPermissions(Role.STAFF, rolePermissionProperties.getStaffPermission());
        assignPermissions(Role.CUSTOMER, rolePermissionProperties.getCustomerPermission());
    }

    private void assignPermissions(Role roleName, List<String> permissionNames) {
        Roles role = ensureRole(roleName);
        Set<String> requestedPermissionNames = new LinkedHashSet<>();

        if (permissionNames == null) {
            permissionNames = List.of();
        }

        for (String permissionName : permissionNames) {
            if (StringUtils.hasText(permissionName)) {
                requestedPermissionNames.add(permissionName.trim().toUpperCase());
            }
        }

        Set<String> currentPermissionNames = role.getPermissions() == null
                ? Set.of()
                : role.getPermissions().stream()
                .filter(permission -> !Boolean.TRUE.equals(permission.getDeleted()))
                .map(Permissions::getName)
                .filter(StringUtils::hasText)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        if (currentPermissionNames.equals(requestedPermissionNames)) {
            return;
        }

        Set<Permissions> permissions = requestedPermissionNames.stream()
                .map(this::ensurePermission)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        role.setPermissions(permissions);
        role.setModifiedBy("system");
        role.setModifiedTime(LocalDateTime.now());
        rolesRepository.save(role);
    }

    private Permissions ensurePermission(String permissionName) {
        String normalizedName = permissionName.trim().toUpperCase();
        return permissionsRepository.findByName(normalizedName)
                .orElseGet(() -> permissionsRepository.save(Permissions.builder()
                        .name(normalizedName)
                        .description(normalizedName)
                        .createdBy("system")
                        .createdTime(LocalDateTime.now())
                        .deleted(false)
                        .build()));
    }
}
