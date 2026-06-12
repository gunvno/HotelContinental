import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type PermissionResponse = {
  id: string;
  name: string;
  description?: string;
};

export type StaffPermissionResponse = {
  accountId: string;
  userId: string;
  username: string;
  email?: string;
  fullName: string;
  rolePermissions: string[];
  directPermissions: string[];
  effectivePermissions: string[];
  availablePermissions: string[];
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

export async function updateStaffPermissions(
  accountId: string,
  permissionNames: string[],
) {
  const res = await http
    .put(`identity/admin/permissions/staff/${accountId}`, { json: { permissionNames } })
    .json<ApiResponse<StaffPermissionResponse>>();
  return (res.result ?? res.content) as StaffPermissionResponse;
}
