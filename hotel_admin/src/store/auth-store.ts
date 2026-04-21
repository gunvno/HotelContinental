import { create } from "zustand";
import { createJSONStorage,persist } from "zustand/middleware";

export interface UserInfo {
  name?: string;
  preferred_username?: string;
  email?: string;
  sub?: string;
  [key: string]: unknown;
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

export const selectToken = (state: AuthState) => state.token;
export const selectUserName = (state: AuthState) =>
  state.userInfo?.preferred_username || state.userInfo?.name || null;
export const selectFirstName = (state: AuthState) => {
  const name = state.userInfo?.name;
  return name ? name.split(" ")[0] : null;
};
export const selectLastName = (state: AuthState) => {
  const name = state.userInfo?.name;
  if (!name) {
    return state.userInfo?.preferred_username || null;
  }

  return name.split(" ").slice(1).join(" ") || name;
};
