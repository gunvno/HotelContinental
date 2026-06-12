package com.hotelcontinental.identity_service.service.serviceImpl;

import com.hotelcontinental.identity_service.dto.request.Permission.AccountPermissionUpdateRequest;
import com.hotelcontinental.identity_service.dto.response.Permission.PermissionResponse;
import com.hotelcontinental.identity_service.dto.response.Permission.StaffPermissionResponse;
import com.hotelcontinental.identity_service.entity.Accounts;
import com.hotelcontinental.identity_service.entity.Permissions;
import com.hotelcontinental.identity_service.entity.Roles;
import com.hotelcontinental.identity_service.enums.Role;
import com.hotelcontinental.identity_service.exception.AppException;
import com.hotelcontinental.identity_service.exception.ErrorCode;
import com.hotelcontinental.identity_service.repository.AccountsRepository;
import com.hotelcontinental.identity_service.repository.PermissionsRepository;
import com.hotelcontinental.identity_service.service.interfaces.PermissionManagementService;
import lombok.RequiredArgsConstructor;
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

    @Override
    @Transactional(readOnly = true)
    public List<PermissionResponse> getPermissions() {
        return permissionsRepository.findAvailable().stream()
                .map(this::mapPermission)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffPermissionResponse> getStaffAccounts() {
        return accountsRepository.findStaffAccounts().stream()
                .map(this::mapStaff)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StaffPermissionResponse getStaffPermissions(String accountId) {
        return mapStaff(getStaffAccount(accountId));
    }

    @Override
    @Transactional
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

        account.setPermissions(permissions);
        account.setModifiedBy("system");
        account.setModifiedTime(LocalDateTime.now());
        return mapStaff(accountsRepository.save(account));
    }

    private Accounts getStaffAccount(String accountId) {
        return accountsRepository.findById(accountId)
                .filter(account -> !Boolean.TRUE.equals(account.getDeleted()))
                .filter(account -> account.getRoles() != null && account.getRoles().stream()
                        .anyMatch(role -> role.getName() == Role.STAFF && !Boolean.TRUE.equals(role.getDeleted())))
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
                .rolePermissions(rolePermissions.stream().toList())
                .directPermissions(directPermissions.stream().toList())
                .effectivePermissions(effectivePermissions.stream().toList())
                .availablePermissions(availablePermissions)
                .build();
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
