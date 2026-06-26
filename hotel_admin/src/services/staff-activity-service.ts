import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type StaffActivityStatus = "ACTIVE" | "COMPLETED";

export type StaffActivitySessionResponse = {
  id: string;
  accountId: string;
  userId: string;
  username: string;
  fullName?: string;
  primaryRole?: string;
  loginTime: string;
  logoutTime?: string;
  workCheckInTime?: string;
  workCheckOutTime?: string;
  status: StaffActivityStatus;
  loginDurationMinutes?: number;
  workDurationMinutes?: number;
};

export async function getStaffActivitySessions() {
  const res = await http
    .get("identity/staff-activity")
    .json<ApiResponse<StaffActivitySessionResponse[]>>();
  return (res.result ?? res.content ?? []) as StaffActivitySessionResponse[];
}

export async function getMyStaffActivitySessions() {
  const res = await http
    .get("identity/staff-activity/me")
    .json<ApiResponse<StaffActivitySessionResponse[]>>();
  return (res.result ?? res.content ?? []) as StaffActivitySessionResponse[];
}

export async function checkInStaffActivity() {
  const res = await http
    .post("identity/staff-activity/me/check-in")
    .json<ApiResponse<StaffActivitySessionResponse>>();
  return (res.result ?? res.content) as StaffActivitySessionResponse;
}

export async function checkOutStaffActivity() {
  const res = await http
    .post("identity/staff-activity/me/check-out")
    .json<ApiResponse<StaffActivitySessionResponse>>();
  return (res.result ?? res.content) as StaffActivitySessionResponse;
}
