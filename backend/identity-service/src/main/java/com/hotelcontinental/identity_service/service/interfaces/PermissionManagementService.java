package com.hotelcontinental.identity_service.service.interfaces;

import com.hotelcontinental.identity_service.dto.request.Permission.AccountPermissionUpdateRequest;
import com.hotelcontinental.identity_service.dto.request.Permission.AccountPasswordResetRequest;
import com.hotelcontinental.identity_service.dto.request.Permission.AccountStatusUpdateRequest;
import com.hotelcontinental.identity_service.dto.request.Permission.StaffAccountCreationRequest;
import com.hotelcontinental.identity_service.dto.response.Permission.PermissionResponse;
import com.hotelcontinental.identity_service.dto.response.Permission.StaffPermissionResponse;

import java.util.List;

public interface PermissionManagementService {
    List<PermissionResponse> getPermissions();
    List<StaffPermissionResponse> getStaffAccounts();
    StaffPermissionResponse getStaffPermissions(String accountId);
    StaffPermissionResponse createStaffAccount(StaffAccountCreationRequest request);
    StaffPermissionResponse updateStaffPermissions(String accountId, AccountPermissionUpdateRequest request);
    StaffPermissionResponse updateStaffStatus(String accountId, AccountStatusUpdateRequest request);
    StaffPermissionResponse resetStaffPassword(String accountId, AccountPasswordResetRequest request);
}
