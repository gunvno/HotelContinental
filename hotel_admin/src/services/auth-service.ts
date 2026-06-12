import { HTTPError } from "ky";

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
  code?: number;
  message?: string;
  result?: T;
  content?: T;
};

export type LoginPayload = {
  username: string;
  password: string;
};

const LOGIN_ERROR_MESSAGE = "Tài khoản hoặc mật khẩu không chính xác";

function normalizeAuthMessage(message?: string) {
  if (!message || message === "Unauthenticated" || message === "Unauthorized") {
    return LOGIN_ERROR_MESSAGE;
  }

  return message;
}

export async function login(payload: LoginPayload) {
  try {
    const response = await http
      .post("identity/auth/login", { json: payload })
      .json<ApiResponse<AuthContent>>();

    return response.result ?? response.content;
  } catch (error) {
    if (error instanceof HTTPError) {
      const body = (await error.response
        .clone()
        .json()
        .catch(() => null)) as ApiResponse<unknown> | null;
      throw new Error(normalizeAuthMessage(body?.message));
    }

    throw error;
  }
}

export async function logoutAuthToken(token: string) {
  await http.post("identity/auth/logout", { json: { token } }).json<ApiResponse<void>>();
}
