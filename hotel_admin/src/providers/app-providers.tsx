"use client";

import type { ReactNode } from "react";

import { KeycloakAuthProvider } from "@/providers/keycloak-auth-provider";

export type AppProvidersProps = {
  children: ReactNode;
};

// Nơi tập trung các provider dùng chung để dễ mở rộng.
export function AppProviders({ children }: AppProvidersProps) {
  return <KeycloakAuthProvider>{children}</KeycloakAuthProvider>;
}
