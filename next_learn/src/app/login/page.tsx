"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Container } from "@/components/ui/container";
import { useKeycloakAuth } from "@/providers/keycloak-auth-provider";
import { selectToken,useAuthStore } from "@/store/auth-store";

import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const token = useAuthStore(selectToken);
  const { authenticated } = useKeycloakAuth();

  useEffect(() => {
    if (token || authenticated) {
      router.replace("/");
    }
  }, [token, authenticated, router]);

  return (
    <main className="py-6 sm:py-10 md:py-12">
      <Container className="max-w-6xl">
        <div className="grid md:grid-cols-2 rounded-xl border border-border overflow-hidden bg-card">
          {/* Left: Login form */}
          <section className="order-2 md:order-1 p-6 sm:p-8 md:p-10 flex items-center">
            <div className="w-full max-w-sm mx-auto">
              <h1 className="mb-6 text-2xl font-semibold tracking-tight">Đăng nhập</h1>
              <LoginForm />
            </div>
          </section>

          {/* Right: Travel-themed banner */}
          <aside className="order-1 md:order-2 relative flex h-40 md:h-auto items-center justify-center bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500">
            {/* Subtle decorative overlays */}
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <div className="absolute -top-6 -left-6 h-36 w-36 rounded-full bg-white/20" />
              <div className="absolute bottom-6 right-10 h-24 w-24 rounded-full bg-white/20" />
            </div>
            <div className="relative p-6 sm:p-8 md:p-10 text-center text-white">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
                <span>Khám phá hành trình của bạn</span>
                <span className="text-2xl">✈️</span>
              </h2>
              <p className="mt-2 md:mt-3 text-xs/6 md:text-sm/6 opacity-90 max-w-md mx-auto">
                Lên kế hoạch cho chuyến đi tiếp theo, đặt vé nhanh, lưu
                lịch trình và khám phá ưu đãi mới mỗi ngày.
              </p>
              <div className="mt-4 md:mt-6 flex items-center justify-center gap-2 md:gap-3 text-[11px]/5 md:text-xs/5 opacity-95">
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
