import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type PermissionResponse = {
  id: string;
  name: string;
  description?: string;
};

export type StaffRoleName = "ADMIN" | "MANAGER" | "RECEPTIONIST" | "CUSTOMER_SUPPORT";
export type StaffAccountStatus = "ACTIVE" | "UNACTIVE";

export type StaffPermissionResponse = {
  accountId: string;
  userId: string;
  username: string;
  email?: string;
  fullName: string;
  accountStatus?: StaffAccountStatus;
  roleNames: StaffRoleName[];
  rolePermissions: string[];
  directPermissions: string[];
  effectivePermissions: string[];
  availablePermissions: string[];
};

export type StaffAccountPayload = {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roleName: StaffRoleName;
};

export async function getPermissions() {
  const res = await http
    .get("identity/admin/permissions")
    .json<ApiResponse<PermissionResponse[]>>();
  return (res.result ?? res.content ?? []) as PermissionResponse[];
}

export async function getStaffAccounts() {
  const res = await http
    .get("identity/admin/permissions/staff")
    .json<ApiResponse<StaffPermissionResponse[]>>();
  return (res.result ?? res.content ?? []) as StaffPermissionResponse[];
}

export async function getStaffPermissions(accountId: string) {
  const res = await http
    .get(`identity/admin/permissions/staff/${accountId}`)
    .json<ApiResponse<StaffPermissionResponse>>();
  return (res.result ?? res.content) as StaffPermissionResponse;
}

export async function createStaffAccount(payload: StaffAccountPayload) {
  const res = await http
    .post("identity/admin/permissions/staff", { json: payload })
    .json<ApiResponse<StaffPermissionResponse>>();
  return (res.result ?? res.content) as StaffPermissionResponse;
}

export async function updateStaffPermissions(
  accountId: string,
  permissionNames: string[],
  roleName?: StaffRoleName,
) {
  const res = await http
    .put(`identity/admin/permissions/staff/${accountId}`, {
      json: { permissionNames, roleName },
    })
    .json<ApiResponse<StaffPermissionResponse>>();
  return (res.result ?? res.content) as StaffPermissionResponse;
}

export async function updateStaffAccountStatus(
  accountId: string,
  status: StaffAccountStatus,
) {
  const res = await http
    .put(`identity/admin/permissions/staff/${accountId}/status`, { json: { status } })
    .json<ApiResponse<StaffPermissionResponse>>();
  return (res.result ?? res.content) as StaffPermissionResponse;
}

export async function resetStaffPassword(accountId: string, password: string) {
  const res = await http
    .put(`identity/admin/permissions/staff/${accountId}/reset-password`, {
      json: { password },
    })
    .json<ApiResponse<StaffPermissionResponse>>();
  return (res.result ?? res.content) as StaffPermissionResponse;
}
