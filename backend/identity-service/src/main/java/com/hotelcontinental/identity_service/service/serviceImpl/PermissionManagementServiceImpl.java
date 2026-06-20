package com.hotelcontinental.identity_service.service.serviceImpl;

import com.hotelcontinental.identity_service.dto.request.Permission.AccountPermissionUpdateRequest;
import com.hotelcontinental.identity_service.dto.request.Permission.AccountPasswordResetRequest;
import com.hotelcontinental.identity_service.dto.request.Permission.AccountStatusUpdateRequest;
import com.hotelcontinental.identity_service.dto.request.Permission.StaffAccountCreationRequest;
import com.hotelcontinental.identity_service.dto.response.Permission.PermissionResponse;
import com.hotelcontinental.identity_service.dto.response.Permission.StaffPermissionResponse;
import com.hotelcontinental.identity_service.entity.Accounts;
import com.hotelcontinental.identity_service.entity.Permissions;
import com.hotelcontinental.identity_service.entity.Roles;
import com.hotelcontinental.identity_service.entity.User;
import com.hotelcontinental.identity_service.enums.AccountStatus;
import com.hotelcontinental.identity_service.enums.Role;
import com.hotelcontinental.identity_service.enums.UserStatus;
import com.hotelcontinental.identity_service.exception.AppException;
import com.hotelcontinental.identity_service.exception.ErrorCode;
import com.hotelcontinental.identity_service.repository.AccountsRepository;
import com.hotelcontinental.identity_service.repository.PermissionsRepository;
import com.hotelcontinental.identity_service.repository.RolesRepository;
import com.hotelcontinental.identity_service.repository.UserRepository;
import com.hotelcontinental.identity_service.service.interfaces.PermissionManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionManagementServiceImpl implements PermissionManagementService {
    private final AccountsRepository accountsRepository;
    private final PermissionsRepository permissionsRepository;
    private final RolesRepository rolesRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public List<PermissionResponse> getPermissions() {
        return permissionsRepository.findAvailable().stream()
                .map(this::mapPermission)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public List<StaffPermissionResponse> getStaffAccounts() {
        return accountsRepository.findStaffAccounts().stream()
                .map(this::mapStaff)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public StaffPermissionResponse getStaffPermissions(String accountId) {
        return mapStaff(getStaffAccount(accountId));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public StaffPermissionResponse createStaffAccount(StaffAccountCreationRequest request) {
        if (request == null || !StringUtils.hasText(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_IS_MISSING);
        }
        if (!StringUtils.hasText(request.getPassword())) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        String username = request.getUsername().trim();
        String email = StringUtils.hasText(request.getEmail()) ? request.getEmail().trim() : null;
        Role roleName = parseInternalRole(request.getRoleName());

        if (accountsRepository.existsByUsername(username)) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        if (StringUtils.hasText(email) && userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        Roles role = getRole(roleName);
        LocalDateTime now = LocalDateTime.now();

        User user = userRepository.save(User.builder()
                .firstName(StringUtils.hasText(request.getFirstName()) ? request.getFirstName().trim() : null)
                .lastName(StringUtils.hasText(request.getLastName()) ? request.getLastName().trim() : null)
                .email(email)
                .status(UserStatus.ACTIVE)
                .userType(roleName.name())
                .createdBy("admin")
                .createdTime(now)
                .deleted(false)
                .build());

        Accounts account = accountsRepository.save(Accounts.builder()
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .status(AccountStatus.ACTIVE)
                .userId(user.getId())
                .roles(Set.of(role))
                .permissions(new LinkedHashSet<>())
                .createdBy("admin")
                .createdTime(now)
                .deleted(false)
                .build());
        account.setUser(user);

        return mapStaff(account);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public StaffPermissionResponse updateStaffPermissions(String accountId, AccountPermissionUpdateRequest request) {
        Accounts account = getStaffAccount(accountId);
        Set<Permissions> permissions = new LinkedHashSet<>();

        List<String> permissionNames = request != null && request.getPermissionNames() != null
                ? request.getPermissionNames()
                : List.of();

        for (String permissionName : permissionNames) {
            if (!StringUtils.hasText(permissionName)) {
                continue;
            }

            String normalizedName = permissionName.trim().toUpperCase();
            Permissions permission = permissionsRepository.findByName(normalizedName)
                    .filter(item -> !Boolean.TRUE.equals(item.getDeleted()))
                    .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
            permissions.add(permission);
        }

        if (request != null && StringUtils.hasText(request.getRoleName())) {
            Role roleName = parseInternalRole(request.getRoleName());
            account.setRoles(Set.of(getRole(roleName)));
            if (account.getUser() != null) {
                account.getUser().setUserType(roleName.name());
                account.getUser().setModifiedBy("admin");
                account.getUser().setModifiedTime(LocalDateTime.now());
            }
        }

        account.setPermissions(permissions);
        account.setModifiedBy("admin");
        account.setModifiedTime(LocalDateTime.now());
        return mapStaff(accountsRepository.save(account));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public StaffPermissionResponse updateStaffStatus(String accountId, AccountStatusUpdateRequest request) {
        Accounts account = getStaffAccount(accountId);
        if (request == null || !StringUtils.hasText(request.getStatus())) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        AccountStatus status;
        try {
            status = AccountStatus.valueOf(request.getStatus().trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        account.setStatus(status);
        account.setModifiedBy("admin");
        account.setModifiedTime(LocalDateTime.now());
        return mapStaff(accountsRepository.save(account));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public StaffPermissionResponse resetStaffPassword(String accountId, AccountPasswordResetRequest request) {
        Accounts account = getStaffAccount(accountId);
        if (request == null || !StringUtils.hasText(request.getPassword())) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setModifiedBy("admin");
        account.setModifiedTime(LocalDateTime.now());
        return mapStaff(accountsRepository.save(account));
    }

    private Accounts getStaffAccount(String accountId) {
        return accountsRepository.findById(accountId)
                .filter(account -> !Boolean.TRUE.equals(account.getDeleted()))
                .filter(this::hasInternalRole)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private StaffPermissionResponse mapStaff(Accounts account) {
        Set<String> rolePermissions = getRolePermissions(account);
        Set<String> directPermissions = getDirectPermissions(account);
        Set<String> effectivePermissions = new LinkedHashSet<>();
        effectivePermissions.addAll(rolePermissions);
        effectivePermissions.addAll(directPermissions);

        List<String> availablePermissions = permissionsRepository.findAvailable().stream()
                .map(Permissions::getName)
                .filter(StringUtils::hasText)
                .filter(permission -> !effectivePermissions.contains(permission))
                .toList();

        String fullName = account.getUser() != null
                ? List.of(account.getUser().getFirstName(), account.getUser().getLastName()).stream()
                .filter(StringUtils::hasText)
                .collect(Collectors.joining(" "))
                : "";

        return StaffPermissionResponse.builder()
                .accountId(account.getId())
                .userId(account.getUserId())
                .username(account.getUsername())
                .email(account.getUser() != null ? account.getUser().getEmail() : null)
                .fullName(StringUtils.hasText(fullName) ? fullName : account.getUsername())
                .accountStatus(account.getStatus() != null ? account.getStatus().name() : null)
                .roleNames(getRoleNames(account).stream().toList())
                .rolePermissions(rolePermissions.stream().toList())
                .directPermissions(directPermissions.stream().toList())
                .effectivePermissions(effectivePermissions.stream().toList())
                .availablePermissions(availablePermissions)
                .build();
    }

    private boolean hasInternalRole(Accounts account) {
        return account.getRoles() != null && account.getRoles().stream()
                .anyMatch(role -> role.getName() != Role.CUSTOMER && !Boolean.TRUE.equals(role.getDeleted()));
    }

    private Role parseInternalRole(String roleName) {
        if (!StringUtils.hasText(roleName)) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }

        try {
            Role role = Role.valueOf(roleName.trim().toUpperCase());
            if (role == Role.CUSTOMER) {
                throw new AppException(ErrorCode.ROLE_NOT_FOUND);
            }
            return role;
        } catch (IllegalArgumentException exception) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }
    }

    private Roles getRole(Role roleName) {
        return rolesRepository.findByName(roleName)
                .filter(role -> !Boolean.TRUE.equals(role.getDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
    }

    private Set<String> getRoleNames(Accounts account) {
        if (account.getRoles() == null) {
            return new LinkedHashSet<>();
        }

        return account.getRoles().stream()
                .filter(role -> !Boolean.TRUE.equals(role.getDeleted()))
                .map(Roles::getName)
                .filter(role -> role != Role.CUSTOMER)
                .map(Role::name)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<String> getRolePermissions(Accounts account) {
        Set<String> permissions = new LinkedHashSet<>();
        if (account.getRoles() == null) {
            return permissions;
        }

        for (Roles role : account.getRoles()) {
            if (role.getPermissions() == null || Boolean.TRUE.equals(role.getDeleted())) {
                continue;
            }

            role.getPermissions().stream()
                    .filter(permission -> !Boolean.TRUE.equals(permission.getDeleted()))
                    .map(Permissions::getName)
                    .filter(StringUtils::hasText)
                    .forEach(permissions::add);
        }
        return permissions;
    }

    private Set<String> getDirectPermissions(Accounts account) {
        if (account.getPermissions() == null) {
            return new LinkedHashSet<>();
        }

        return account.getPermissions().stream()
                .filter(permission -> !Boolean.TRUE.equals(permission.getDeleted()))
                .map(Permissions::getName)
                .filter(StringUtils::hasText)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private PermissionResponse mapPermission(Permissions permission) {
        return PermissionResponse.builder()
                .id(permission.getId())
                .name(permission.getName())
                .description(permission.getDescription())
                .build();
    }
}
