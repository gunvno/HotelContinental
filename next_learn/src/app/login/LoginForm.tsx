"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { login } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";

import { type LoginSchema, loginSchema } from "./login-schema";

const LOGIN_ERROR_MESSAGE = "Tài khoản hoặc mật khẩu không chính xác";
const PENDING_LOGIN_REDIRECT_KEY = "continental.pendingLoginRedirect";

export function LoginForm() {
  const router = useRouter();
  const doLogin = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const redirectTo = new URLSearchParams(window.location.search).get("redirect");
    if (redirectTo) {
      window.sessionStorage.setItem(PENDING_LOGIN_REDIRECT_KEY, redirectTo);
      window.localStorage.setItem(PENDING_LOGIN_REDIRECT_KEY, redirectTo);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginSchema) => {
    setError(null);
    setLoading(true);

    try {
      const result = await login({
        username: data.username,
        password: data.password,
      });

      if (!result?.token) {
        throw new Error(LOGIN_ERROR_MESSAGE);
      }

      if (result.permissions?.includes("ROLE_ADMIN")) {
        logout();
        setError(LOGIN_ERROR_MESSAGE);
        return;
      }

      doLogin(result, data.rememberMe);
      const redirectTo = new URLSearchParams(window.location.search).get("redirect") || "/";
      router.replace(redirectTo);
    } catch {
      setError(LOGIN_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-foreground">
            Username / Email
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              id="username"
              type="text"
              autoComplete="username"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                errors.username && "border-red-500 focus-visible:ring-red-500",
              )}
              placeholder="Username hoặc Email"
              {...register("username")}
            />
          </div>
          {errors.username && <span className="text-xs text-red-500">{errors.username.message}</span>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Mật khẩu
            </label>
            <Link href="#" className="text-xs text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                errors.password && "border-red-500 focus-visible:ring-red-500",
              )}
              placeholder="••••••••"
              {...register("password")}
            />
          </div>
          {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="rememberMe" {...register("rememberMe")} />
          <label
            htmlFor="rememberMe"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Ghi nhớ đăng nhập
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50/50 p-3 text-sm text-red-600">
            <span className="font-semibold">Lỗi:</span> {error}
          </div>
        )}

        <Button type="submit" size="md" variant="primary" disabled={loading} className="w-full font-semibold">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xử lý...
            </span>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-primary hover:text-primary/90 hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
