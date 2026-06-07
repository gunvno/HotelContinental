import { http } from "@/lib/http";

export type AuthContent = {
  token: string | null;
  refreshToken: string | null;
  userName: string | null;
  permissions: string[];
  firstName?: string | null;
  lastName?: string | null;
};

type ApiResponse<T> = {
  result?: T;
  content?: T;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export async function login(payload: LoginPayload) {
  const response = await http
    .post("identity/auth/login", { json: payload })
    .json<ApiResponse<AuthContent>>();

  return response.result ?? response.content;
}

export async function logoutAuthToken(token: string) {
  await http.post("identity/auth/logout", { json: { token } }).json<ApiResponse<void>>();
}
