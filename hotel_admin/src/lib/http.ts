import ky, { type KyInstance } from "ky";
import { clientEnv } from "@/lib/env";
import { useAuthStore } from "@/store/auth-store";

/*
HTTP client dùng chung (client-side) dựa trên ky:
- prefixUrl: base URL từ env
- headers mặc định: gửi/nhận JSON
- beforeRequest: tự gắn Authorization: Bearer <token> từ Zustand (nếu có) + log khi dev
- afterResponse: log lỗi chi tiết khi response !ok
*/

// Header mặc định giúp ky gửi JSON nhất quán.
const defaultHeaders = new Headers({
  "Content-Type": "application/json",
});

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
             // Token hết hạn hoặc không hợp lệ -> Logout
             // authStore.logout(); // Logout action
             // if (typeof window !== "undefined") window.location.href = "/"; // Redirect to home (which redirects to Keycloak)
             // return response;
             console.warn("[http] 401 Unauthorized - Token might be expired");
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