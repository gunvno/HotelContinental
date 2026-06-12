"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { login } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";

const LOGIN_ERROR_MESSAGE = "Tài khoản hoặc mật khẩu không chính xác";

const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập username hoặc email"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function normalizeLoginError(error: unknown) {
  if (!(error instanceof Error)) {
    return LOGIN_ERROR_MESSAGE;
  }

  if (error.message === "Unauthenticated" || error.message === "Unauthorized") {
    return LOGIN_ERROR_MESSAGE;
  }

  return error.message || LOGIN_ERROR_MESSAGE;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const doLogin = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    setLoading(true);

    try {
      const result = await login(values);

      if (!result?.token || !result.permissions?.includes("ADMIN_PORTAL_ACCESS")) {
        logout();
        setError(LOGIN_ERROR_MESSAGE);
        return;
      }

      doLogin(
        result.token,
        result.refreshToken,
        {
          name:
            [result.firstName, result.lastName].filter(Boolean).join(" ") ||
            result.userName ||
            undefined,
          preferred_username: result.userName || undefined,
          firstName: result.firstName,
          lastName: result.lastName,
        },
        result.permissions,
      );
      router.replace("/");
    } catch (loginError) {
      setError(normalizeLoginError(loginError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-[460px] rounded-[2rem] border border-[#e8d9c6]/25 bg-[#fbf6ed] p-8 shadow-[0_35px_100px_-45px_rgba(0,0,0,0.7)]">
      <div className="mb-8 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9b5c24] font-serif text-3xl font-bold text-white shadow-xl">
          C
        </span>
        <div>
          <p className="text-[11px] font-bold tracking-[0.35em] text-[#9b5c24] uppercase">
            Continental
          </p>
          <h1 className="font-serif text-3xl font-bold text-[#211a14]">Admin Login</h1>
        </div>
      </div>

      <div className="mb-7 rounded-3xl border border-[#decdb9] bg-white/55 p-4 text-sm text-[#6d5b49]">
        <div className="mb-2 flex items-center gap-2 font-bold text-[#211a14]">
          <ShieldCheck className="h-4 w-4 text-[#9b5c24]" />
          Chỉ tài khoản quản trị hoặc nhân viên được phân quyền mới được truy cập trang
          quản trị.
        </div>
        Tài khoản khách hoặc tài khoản chưa được cấp quyền sẽ được báo như sai tài
        khoản/mật khẩu.
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-bold text-[#4b3a2a]">
            Username / Email
          </label>
          <div className="relative">
            <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#9b5c24]" />
            <input
              id="username"
              type="text"
              autoComplete="username"
              className={cn(
                "h-12 w-full rounded-2xl border border-[#decdb9] bg-white px-4 pl-11 text-sm font-medium text-[#211a14] transition outline-none focus:border-[#c68948] focus:ring-4 focus:ring-[#c68948]/15",
                errors.username &&
                  "border-red-400 focus:border-red-400 focus:ring-red-100",
              )}
              placeholder="admin hoặc admin@email.com"
              {...register("username")}
            />
          </div>
          {errors.username && (
            <p className="text-xs font-medium text-red-600">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-bold text-[#4b3a2a]">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#9b5c24]" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={cn(
                "h-12 w-full rounded-2xl border border-[#decdb9] bg-white px-4 pl-11 text-sm font-medium text-[#211a14] transition outline-none focus:border-[#c68948] focus:ring-4 focus:ring-[#c68948]/15",
                errors.password &&
                  "border-red-400 focus:border-red-400 focus:ring-red-100",
              )}
              placeholder="••••••••"
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-red-600">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang đăng nhập...
            </span>
          ) : (
            "Đăng nhập quản trị"
          )}
        </Button>
      </form>
    </section>
  );
}
