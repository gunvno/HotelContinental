import { fi } from "zod/v4/locales";
import { create } from "zustand";


export type AuthContent = {
  token: string | null;
  refreshToken: string | null;
  userName: string | null;
  permissions: string[];
  lastName?: string | null;
  firstName?: string | null;
};

type AuthState = AuthContent & {
  login: (resp: AuthContent, rememberMe?: boolean) => void;
  logout: () => void;
  hasPermission: (perm: string) => boolean;
};

export const useAuthStore = create<AuthState>()(

  (set, get) => ({
    token: null,
    refreshToken: null,
    userName: null,
    permissions: [],
    login: (resp, rememberMe) => {
      // Xóa dữ liệu cũ ở cả hai nơi
      localStorage.removeItem("auth");
      sessionStorage.removeItem("auth");
      // Lưu vào storage phù hợp
      const data = JSON.stringify({
        token: resp.token,
        refreshToken: resp.refreshToken,
        userName: resp.userName,
        firstName: resp.firstName,
        lastName: resp.lastName,
        permissions: resp.permissions ?? [],
      });
      if (rememberMe) {
        localStorage.setItem("auth", data);
      } else {
        sessionStorage.setItem("auth", data);
      }
      set({
        token: resp.token,
        refreshToken: resp.refreshToken,
        userName: resp.userName,
        firstName: resp.firstName,
        lastName: resp.lastName,
        permissions: resp.permissions ?? [],
      });
    },
    logout: () => {
      localStorage.removeItem("auth");
      sessionStorage.removeItem("auth");
      set({
        token: null,
        refreshToken: null,
        userName: null,
        firstName: null,
        lastName: null,
        permissions: [],
      });
    },
    hasPermission: (perm) => get().permissions.includes(perm),
  })
);

// Load state từ storage khi khởi tạo (nếu có)
if (typeof window !== "undefined") {
  const authStr = localStorage.getItem("auth") || sessionStorage.getItem("auth");
  if (authStr) {
    try {
      const auth = JSON.parse(authStr);
      useAuthStore.setState({
        token: auth.token,
        refreshToken: auth.refreshToken,
        userName: auth.userName,
        firstName: auth.firstName,
        lastName: auth.lastName,
        permissions: auth.permissions ?? [],
      });
    } catch {}
  }
}

// Useful selectors (optional):
export const selectToken = (s: AuthState) => s.token;
export const selectUserName = (s: AuthState) => s.userName;
export const selectFirstName = (s: AuthState) => s.firstName;
export const selectLastName = (s: AuthState) => s.lastName;
export const selectHasPermission = (perm: string) => (s: AuthState) => s.permissions.includes(perm);