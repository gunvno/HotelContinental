import ky, { type KyInstance } from "ky";

import { clientEnv } from "@/lib/env";
import type { AuthContent } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";

type ApiResponse<T> = {
  result?: T;
  content?: T;
};

const defaultHeaders = new Headers({
  "Content-Type": "application/json",
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

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
              if (!data?.token) {
                throw new Error("Refresh token response is invalid");
              }

              authStore.login(
                data.token,
                data.refreshToken,
                {
                  name:
                    [data.firstName, data.lastName].filter(Boolean).join(" ") ||
                    data.userName ||
                    undefined,
                  preferred_username: data.userName || undefined,
                  firstName: data.firstName,
                  lastName: data.lastName,
                },
                data.permissions ?? authStore.permissions,
              );

              isRefreshing = false;
              processQueue(null, data.token);

              request.headers.set("Authorization", `Bearer ${data.token}`);
              return ky(request, options);
            } catch (refreshError) {
              isRefreshing = false;
              processQueue(refreshError, null);
              authStore.logout();
              return response;
            }
          }

          if (!response.ok && process.env.NODE_ENV === "development") {
            const errRes = response.clone();
            try {
              const body = await errRes.text();
              console.warn("[http] Request failed", {
                url: request.url,
                status: response.status,
                body,
              });
            } catch {}
          }

          return response;
        },
      ],
    },
  });
}

export const http = createHttpClient();
