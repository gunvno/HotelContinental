"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";

type ProtectedRouteProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) return;

    const currentPath = `${pathname}${window.location.search}`;
    router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
  }, [pathname, router, token]);

  if (!token) {
    return (
      fallback ?? (
        <main className="bg-background text-muted-foreground min-h-screen p-10 text-center text-sm">
          Đang kiểm tra đăng nhập...
        </main>
      )
    );
  }

  return <>{children}</>;
}
