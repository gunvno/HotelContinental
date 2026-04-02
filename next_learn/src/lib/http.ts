import ky, { type KyInstance } from "ky";
import { clientEnv } from "@/lib/env";
import { useAuthStore } from "@/store/auth-store";
import { refreshTokenKeycloak } from "@/services/keycloak-direct-service";

/*
HTTP client dùng chung (client-side) dựa trên ky:
- prefixUrl: base URL từ env
- headers mặc định: gửi/nhận JSON
- beforeRequest: tự gắn Authorization: Bearer <token> từ Zustand (nếu có) + log khi dev
- afterResponse: log lỗi chi tiết khi response !ok
- REFRESH TOKEN LOGIC: Tự động refresh khi gặp 401.
*/

// Header mặc định giúp ky gửi JSON nhất quán.
const defaultHeaders = new Headers({
  "Content-Type": "application/json",
});

// Biến cờ để tránh loop vô hạn khi refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
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
          // Chỉ xử lý khi gặp lỗi 401 Unauthorized
          if (response.status === 401) {
            const authStore = useAuthStore.getState();
            const originalRequest = request;

            // Nếu đang refresh thì đợi
            if (isRefreshing) {
              try {
                const newToken = await new Promise<string>((resolve, reject) => {
                  failedQueue.push({ resolve, reject });
                });
                // Thử lại request cũ với token mới
                originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
                return ky(originalRequest, options);
              } catch (err) {
                return response; // Hủy bỏ
              }
            }

            // Bắt đầu logic refresh Token
            const refreshToken = authStore.refreshToken;
            
            // Nếu không có refresh token -> Logout luôn
            if (!refreshToken) {
               authStore.logout();
               if (typeof window !== "undefined") window.location.href = "/login";
               return response;
            }

            isRefreshing = true;

            try {
              const data = await refreshTokenKeycloak(refreshToken);
              
              // Cập nhật Store (giữ nguyên thông tin user cũ, chỉ update token)
              // Lưu ý: data trả về từ Keycloak có: access_token, refresh_token, ...
              authStore.login({
                token: data.access_token,
                refreshToken: data.refresh_token,
                userName: authStore.userName, // Giữ nguyên
                firstName: authStore.firstName, // Giữ nguyên
                lastName: authStore.lastName,   // Giữ nguyên
                permissions: authStore.permissions, // Giữ nguyên
              }, !!localStorage.getItem("auth")); // Check remember me status

              isRefreshing = false;
              processQueue(null, data.access_token);

              // Retry request gốc
              originalRequest.headers.set("Authorization", `Bearer ${data.access_token}`);
              return ky(originalRequest, options);

            } catch (refreshError) {
              isRefreshing = false;
              processQueue(refreshError, null);
              
              // Refresh thất bại (hết hạn cả refresh token) -> Logout
              authStore.logout();
              if (typeof window !== "undefined") window.location.href = "/login";
              return response; 
            }
          }

          // Khi !ok khác (không phải 401), log debug
          if (!response.ok) {
            // Clone response vì .text() chỉ đọc được 1 lần
            const errRes = response.clone();
            try {
               const body = await errRes.text();
               console.error("[http] Request failed", {
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