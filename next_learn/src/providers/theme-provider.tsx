"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo } from "react";
import { useEffect } from "react";

import { useIsClient } from "@/hooks/use-is-client";
import { useMediaQuery } from "@/hooks/use-media-query";
import { type ThemeMode, useUIStore } from "@/store/ui-store";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (nextTheme: ThemeMode) => void;
  toggleTheme: () => void;
};

// Context giữ thông tin theme để các component client truy cập.
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

// ThemeProvider đồng bộ theme theo store và media query.
export function ThemeProvider({ children }: ThemeProviderProps) {
  const isClient = useIsClient();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  const resolvedTheme: "light" | "dark" = useMemo(() => {
    if (theme === "system") {
      return prefersDark ? "dark" : "light";
    }

    return theme;
  }, [prefersDark, theme]);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
  }, [isClient, resolvedTheme]);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  }, [resolvedTheme, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
