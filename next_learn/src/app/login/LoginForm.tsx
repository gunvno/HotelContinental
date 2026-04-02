"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Chrome, KeyRound, Loader2,Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect,useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useKeycloakAuth } from "@/providers/keycloak-auth-provider";
import { getUserInfoKeycloak, loginWithKeycloakDirect } from "@/services/keycloak-direct-service";
import { useAuthStore } from "@/store/auth-store";

import { type LoginSchema,loginSchema } from "./login-schema";

export function LoginForm() {
  const router = useRouter();
  const doLogin = useAuthStore((s) => s.login);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { keycloak } = useKeycloakAuth();
  const [isKeycloakReady, setIsKeycloakReady] = useState(false);

  // Check if keycloak is ready
  useEffect(() => {
    if (keycloak) {
      setIsKeycloakReady(true);
    }
  }, [keycloak]);

  const handleGoogleLogin = () => {
    if (!keycloak) {
      console.error("Keycloak is not initialized yet.");
      return;
    }
    // Chuyển hướng sang Google Login thông qua Keycloak
    keycloak.login({ idpHint: 'google' });
  };

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
      const result = await loginWithKeycloakDirect(data.username, data.password);
      
      // Lấy thêm thông tin user (First Name, Last Name) từ Keycloak
      let userProfile = { given_name: "", family_name: "" };
      try {
        userProfile = await getUserInfoKeycloak(result.access_token);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }

      // Map kết quả từ Keycloak Direct Grant về AuthContent
      doLogin({
        token: result.access_token,
        refreshToken: result.refresh_token,
        userName: data.username, 
        firstName: userProfile.given_name,
        lastName: userProfile.family_name,
        permissions: [] 
      }, data.rememberMe);

      router.replace("/");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Đăng nhập không thành công. Vui lòng thử lại.";
      setError(errorMessage);
      console.error(err);
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
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9",
                errors.username && "border-red-500 focus-visible:ring-red-500"
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
            <a href="#" className="text-xs text-primary hover:underline">
              Quên mật khẩu?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9",
                 errors.password && "border-red-500 focus-visible:ring-red-500"
              )}
              placeholder="••••••••"
              {...register("password")}
            />
          </div>
          {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            {...register("rememberMe")}
          />
          <label
            htmlFor="rememberMe"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Ghi nhớ đăng nhập
          </label>
        </div>

        {error && (
          <div className="bg-red-50/50 border border-red-200 text-red-600 rounded-md p-3 text-sm flex items-center gap-2">
            <span className="font-semibold">Lỗi:</span> {error}
          </div>
        )}

        <Button type="submit" size="md" variant="primary" disabled={loading} className="w-full font-semibold">
          {loading ? (
             <span className="flex items-center gap-2">
               <Loader2 className="h-4 w-4 animate-spin" />
               Đang xử lý...
             </span>
          ) : "Đăng nhập"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Hoặc tiếp tục với</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          size="md"
          variant="secondary"
          onClick={handleGoogleLogin}
          disabled={!isKeycloakReady}
          className="w-full flex items-center gap-2"
        >
          { !isKeycloakReady ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" /> }
          <span>Google</span>
        </Button>
        <Button
           type="button"
           size="md"
           variant="secondary"
           disabled={!isKeycloakReady}
           onClick={() => keycloak?.login()}
           className="w-full flex items-center gap-2"
         >
           <KeyRound className="h-4 w-4" />
           <span>SSO</span>
         </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <a 
          href="/register" 
          className="font-medium text-primary hover:text-primary/90 hover:underline"
        >
          Đăng ký ngay
        </a>
      </p>
    </div>
  );
}
