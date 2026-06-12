package com.hotelcontinental.identity_service.controller;

import com.hotelcontinental.identity_service.dto.ApiResponse;
import com.hotelcontinental.identity_service.dto.request.Permission.AccountPermissionUpdateRequest;
import com.hotelcontinental.identity_service.dto.response.Permission.PermissionResponse;
import com.hotelcontinental.identity_service.dto.response.Permission.StaffPermissionResponse;
import com.hotelcontinental.identity_service.service.interfaces.PermissionManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/permissions")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
public class PermissionManagementController {
    private final PermissionManagementService permissionManagementService;

    @GetMapping
    public ApiResponse<List<PermissionResponse>> getPermissions() {
        return ApiResponse.<List<PermissionResponse>>builder()
                .result(permissionManagementService.getPermissions())
                .build();
    }

    @GetMapping("/staff")
    public ApiResponse<List<StaffPermissionResponse>> getStaffAccounts() {
        return ApiResponse.<List<StaffPermissionResponse>>builder()
                .result(permissionManagementService.getStaffAccounts())
                .build();
    }

    @GetMapping("/staff/{accountId}")
    public ApiResponse<StaffPermissionResponse> getStaffPermissions(@PathVariable String accountId) {
        return ApiResponse.<StaffPermissionResponse>builder()
                .result(permissionManagementService.getStaffPermissions(accountId))
                .build();
    }

    @PutMapping("/staff/{accountId}")
    public ApiResponse<StaffPermissionResponse> updateStaffPermissions(
            @PathVariable String accountId,
            @RequestBody AccountPermissionUpdateRequest request
    ) {
        return ApiResponse.<StaffPermissionResponse>builder()
                .result(permissionManagementService.updateStaffPermissions(accountId, request))
                .build();
    }
}
