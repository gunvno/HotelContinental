"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const permissions = useAuthStore((state) => state.permissions);
  const logout = useAuthStore((state) => state.logout);
  const canAccessAdmin = isAuthenticated && permissions.includes("ROLE_ADMIN");

  useEffect(() => {
    if (isAuthenticated && !canAccessAdmin) {
      logout();
      router.replace("/login");
      return;
    }

    if (!canAccessAdmin && pathname !== "/login") {
      router.replace("/login");
    } else if (canAccessAdmin && pathname === "/login") {
      router.replace("/");
    }
  }, [canAccessAdmin, isAuthenticated, logout, pathname, router]);

  if (!canAccessAdmin && pathname !== "/login") {
    return null;
  }

  if (canAccessAdmin && pathname === "/login") {
    return null;
  }

  return <>{children}</>;
}
