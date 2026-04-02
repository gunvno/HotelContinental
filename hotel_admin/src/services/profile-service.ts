import { http } from "@/lib/http";
import { type ApiResponse } from "@/types/api-types";

export type CreateProfilePayload = {
  userId: string;
  gender: string;
  dateOfBirth: string; // "YYYY-MM-DD"
  address: string;
  phoneNumber: string;
  identityNumber: string;
};

export async function createProfile(payload: CreateProfilePayload) {
  // Assuming the endpoint is "users/profile" or similar. Adjust as needed.
  // The user didn't specify the exact endpoint, but based on context:
  const res = await http.post("identity/profileExpand/create", { json: payload }).json<ApiResponse<any>>();
  return res.result;
}

export type ProfileResponse = {
  gender: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  identityNumber: string;
};

export async function getMyProfile() {
  const res = await http.get("identity/profileExpand/my-profile").json<ApiResponse<ProfileResponse | null>>();
  return res.result;
}

