"use client";

import type { ReactNode } from "react";

import { KeycloakAuthProvider } from "@/providers/keycloak-auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export type AppProvidersProps = {
  children: ReactNode;
};

// Nơi tập trung các provider dùng chung để dễ mở rộng.
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <KeycloakAuthProvider>{children}</KeycloakAuthProvider>
    </ThemeProvider>
  );
}
