"use client";

import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";

export type AppProvidersProps = {
  children: ReactNode;
};

// Nơi tập trung các provider dùng chung để dễ mở rộng.
export function AppProviders({ children }: AppProvidersProps) {
  return <AuthGuard>{children}</AuthGuard>;
}
