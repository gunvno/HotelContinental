"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { useAuthStore } from "@/store/auth-store";

type ProtectedRouteProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!checked || token) return;

    const currentPath = `${pathname}${window.location.search}`;
    router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
  }, [checked, pathname, router, token]);

  if (!checked || !token) {
    return (
      fallback ?? (
        <main className="min-h-screen bg-background p-10 text-center text-sm text-muted-foreground">
          Đang kiểm tra đăng nhập...
        </main>
      )
    );
  }

  return <>{children}</>;
}
