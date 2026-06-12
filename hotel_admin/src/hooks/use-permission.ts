"use client";

import { useMemo } from "react";

import { useAuthStore } from "@/store/auth-store";

export function usePermission() {
  const permissions = useAuthStore((state) => state.permissions);

  return useMemo(() => {
    const set = new Set(permissions);
    return {
      permissions,
      has: (permission: string) => set.has(permission),
      hasAny: (...items: string[]) => items.some((permission) => set.has(permission)),
      hasAll: (...items: string[]) => items.every((permission) => set.has(permission)),
    };
  }, [permissions]);
}
