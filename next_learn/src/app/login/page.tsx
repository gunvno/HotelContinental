"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Container } from "@/components/ui/container";
import { selectToken, useAuthStore } from "@/store/auth-store";

import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const token = useAuthStore(selectToken);

  useEffect(() => {
    if (token) {
      const redirectTo =
        new URLSearchParams(window.location.search).get("redirect") || "/";
      router.replace(redirectTo);
    }
  }, [token, router]);

  return (
    <main className="py-6 sm:py-10 md:py-12">
      <Container className="max-w-6xl">
        <div className="border-border bg-card grid overflow-hidden rounded-xl border md:grid-cols-2">
          {/* Left: Login form */}
          <section className="order-2 flex items-center p-6 sm:p-8 md:order-1 md:p-10">
            <div className="mx-auto w-full max-w-sm">
              <h1 className="mb-6 text-2xl font-semibold tracking-tight">Đăng nhập</h1>
              <LoginForm />
            </div>
          </section>

          {/* Right: Travel-themed banner */}
          <aside className="relative order-1 flex h-40 items-center justify-center bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 md:order-2 md:h-auto">
            {/* Subtle decorative overlays */}
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <div className="absolute -top-6 -left-6 h-36 w-36 rounded-full bg-white/20" />
              <div className="absolute right-10 bottom-6 h-24 w-24 rounded-full bg-white/20" />
            </div>
            <div className="relative p-6 text-center text-white sm:p-8 md:p-10">
              <h2 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
                <span>Khám phá hành trình của bạn</span>
                <span className="text-2xl">✈️</span>
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs/6 opacity-90 md:mt-3 md:text-sm/6">
                Lên kế hoạch cho chuyến đi tiếp theo, đặt vé nhanh, lưu lịch trình và khám
                phá ưu đãi mới mỗi ngày.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px]/5 opacity-95 md:mt-6 md:gap-3 md:text-xs/5">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                  🗺️ <span>Điểm đến</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                  🎟️ <span>Ưu đãi vé</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                  🧭 <span>Hành trình</span>
                </span>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
