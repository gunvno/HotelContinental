"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Tránh lỗi hydration mismatch bằng cách chỉ render client-side
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // UseEffect để redirect
  useEffect(() => {
    // Chỉ chạy redirect khi đã mount client-side
    if (!mounted) return;

    if (!isAuthenticated && pathname !== "/login") {
      console.log("[AuthGuard] Chưa đăng nhập -> Chuyển hướng về login");
      router.replace("/login");
    } else if (isAuthenticated && pathname === "/login") {
      console.log("[AuthGuard] Đã đăng nhập -> Chuyển hướng về trang chủ");
      router.replace("/");
    }
  }, [isAuthenticated, pathname, router, mounted]);


  // 1. Nếu chưa mount xong (đang server render hoặc hydration), hiện loading trắng
  if (!mounted) {
      return null; // Hoặc return <LoadingSpinner />
  }

  // 2. Nếu chưa đăng nhập mà CỐ TÌNH truy cập trang khác login -> Chặn render nội dung
  if (!isAuthenticated && pathname !== "/login") {
      return null; 
  }

  // 3. Nếu đã đăng nhập mà CỐ TÌNH truy cập trang login -> Chặn render nội dung trang login
  if (isAuthenticated && pathname === "/login") {
      return null;
  }

  // 4. Các trường hợp hợp lệ -> Render Children
  return <>{children}</>;
}
