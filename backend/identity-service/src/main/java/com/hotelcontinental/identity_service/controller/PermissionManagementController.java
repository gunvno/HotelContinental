package com.hotelcontinental.identity_service.controller;

import com.hotelcontinental.identity_service.dto.ApiResponse;
import com.hotelcontinental.identity_service.dto.request.Permission.AccountPermissionUpdateRequest;
import com.hotelcontinental.identity_service.dto.request.Permission.AccountPasswordResetRequest;
import com.hotelcontinental.identity_service.dto.request.Permission.AccountStatusUpdateRequest;
import com.hotelcontinental.identity_service.dto.request.Permission.StaffAccountCreationRequest;
import com.hotelcontinental.identity_service.dto.response.Permission.PermissionResponse;
import com.hotelcontinental.identity_service.dto.response.Permission.StaffPermissionResponse;
import com.hotelcontinental.identity_service.service.interfaces.PermissionManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/permissions")
@RequiredArgsConstructor
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

    @PostMapping("/staff")
    public ApiResponse<StaffPermissionResponse> createStaffAccount(
            @RequestBody StaffAccountCreationRequest request
    ) {
        return ApiResponse.<StaffPermissionResponse>builder()
                .result(permissionManagementService.createStaffAccount(request))
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

    @PutMapping("/staff/{accountId}/status")
    public ApiResponse<StaffPermissionResponse> updateStaffStatus(
            @PathVariable String accountId,
            @RequestBody AccountStatusUpdateRequest request
    ) {
        return ApiResponse.<StaffPermissionResponse>builder()
                .result(permissionManagementService.updateStaffStatus(accountId, request))
                .build();
    }

    @PutMapping("/staff/{accountId}/reset-password")
    public ApiResponse<StaffPermissionResponse> resetStaffPassword(
            @PathVariable String accountId,
            @RequestBody AccountPasswordResetRequest request
    ) {
        return ApiResponse.<StaffPermissionResponse>builder()
                .result(permissionManagementService.resetStaffPassword(accountId, request))
                .build();
    }
}
