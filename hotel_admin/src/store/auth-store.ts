import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UserInfo {
  name?: string;
  preferred_username?: string;
  email?: string;
  sub?: string;
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  
  login: (token: string, refreshToken: string, userInfo: UserInfo) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      userInfo: null,
      isAuthenticated: false,

      login: (token, refreshToken, userInfo) =>
        set({
          token,
          refreshToken,
          userInfo,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          refreshToken: null,
          userInfo: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "hotel-admin-auth-storage", // tên key trong localStorage
      storage: createJSONStorage(() => localStorage), // mặc định lưu localStorage
    }
  )
);
