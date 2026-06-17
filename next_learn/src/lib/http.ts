import ky, { type KyInstance } from "ky";

import { clientEnv } from "@/lib/env";
import type { AuthContent } from "@/store/auth-store";
import { useAuthStore } from "@/store/auth-store";
import type { ApiResponse } from "@/types/api-types";

const defaultHeaders = new Headers({
  "Content-Type": "application/json",
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

async function refreshAuthToken(refreshToken: string) {
  const response = await ky
    .post("identity/auth/refresh", {
      prefixUrl: clientEnv.NEXT_PUBLIC_API_BASE_URL,
      headers: defaultHeaders,
      json: { token: refreshToken },
    })
    .json<ApiResponse<AuthContent>>();

  return response.result ?? response.content;
}

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

function createHttpClient(): KyInstance {
  return ky.create({
    prefixUrl: clientEnv.NEXT_PUBLIC_API_BASE_URL,
    headers: defaultHeaders,
    hooks: {
      beforeRequest: [
        async (request) => {
          const token = useAuthStore.getState().token;
          if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }

          if (process.env.NODE_ENV === "development") {
            console.info(`[http] ${request.method} ${request.url}`);
          }
        },
      ],
      afterResponse: [
        async (request, options, response) => {
          if (response.status === 401) {
            const authStore = useAuthStore.getState();
            const refreshToken = authStore.refreshToken;

            if (!authStore.token && !refreshToken) {
              return response;
            }

            if (isRefreshing) {
              try {
                const newToken = await new Promise<string>((resolve, reject) => {
                  failedQueue.push({ resolve, reject });
                });
                request.headers.set("Authorization", `Bearer ${newToken}`);
                return ky(request, options);
              } catch {
                return response;
              }
            }

            if (!refreshToken) {
              authStore.logout();
              return response;
            }

            isRefreshing = true;

            try {
              const data = await refreshAuthToken(refreshToken);
              const newToken = data?.token;

              if (!data || !newToken) {
                throw new Error("Refresh token response is invalid");
              }

              authStore.login(
                {
                  token: data.token,
                  refreshToken: data.refreshToken,
                  userName: data.userName ?? authStore.userName,
                  email: data.email ?? authStore.email,
                  firstName: data.firstName ?? authStore.firstName,
                  lastName: data.lastName ?? authStore.lastName,
                  permissions: data.permissions ?? authStore.permissions,
                },
                !!localStorage.getItem("auth"),
              );

              isRefreshing = false;
              processQueue(null, newToken);

              request.headers.set("Authorization", `Bearer ${newToken}`);
              return ky(request, options);
            } catch (refreshError) {
              isRefreshing = false;
              processQueue(refreshError, null);
              authStore.logout();
              return response;
            }
          }

          return response;
        },
      ],
    },
  });
}

export const http = createHttpClient();

export const publicHttp = ky.create({
  prefixUrl: clientEnv.NEXT_PUBLIC_API_BASE_URL,
  headers: defaultHeaders,
  hooks: {
    beforeRequest: [
      async (request) => {
        if (process.env.NODE_ENV === "development") {
          console.info(`[http] ${request.method} ${request.url}`);
        }
      },
    ],
  },
});
