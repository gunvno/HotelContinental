package com.hotelcontinental.identity_service.service.interfaces;

import com.hotelcontinental.identity_service.dto.request.Permission.AccountPermissionUpdateRequest;
import com.hotelcontinental.identity_service.dto.response.Permission.PermissionResponse;
import com.hotelcontinental.identity_service.dto.response.Permission.StaffPermissionResponse;

import java.util.List;

public interface PermissionManagementService {
    List<PermissionResponse> getPermissions();
    List<StaffPermissionResponse> getStaffAccounts();
    StaffPermissionResponse getStaffPermissions(String accountId);
    StaffPermissionResponse updateStaffPermissions(String accountId, AccountPermissionUpdateRequest request);
}
