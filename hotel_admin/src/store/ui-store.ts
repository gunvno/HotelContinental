import { create } from "zustand";

// ThemeMode giữ 3 trạng thái chính cho ứng dụng.
export type ThemeMode = "light" | "dark" | "system";

export type UIState = {
  isSidebarOpen: boolean;
  theme: ThemeMode;
  toggleSidebar: () => void;
  setSidebar: (isOpen: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
};

// Cửa hàng UI dùng chung cho theme và các flag giao diện.
export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  theme: "light",
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebar: (isOpen) => set({ isSidebarOpen: isOpen }),
  setTheme: (theme) => set({ theme }),
}));
