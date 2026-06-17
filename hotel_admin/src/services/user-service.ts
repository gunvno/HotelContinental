import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type UserSummaryResponse = {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

export async function getUserSummary(userId: string) {
  const res = await http
    .get(`identity/users/${userId}/summary`)
    .json<ApiResponse<UserSummaryResponse>>();
  return (res.result ?? res.content) as UserSummaryResponse;
}
