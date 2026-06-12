"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, KeyRound, Loader2, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { otpRegister, otpVerify, registerUser } from "@/services/auth-service";

import { type RegisterSchema, registerSchema } from "./register-schema";

export function RegisterForm() {
  const router = useRouter();

  // -- State Logic cho Form --
  const [step, setStep] = useState<"FORM" | "OTP">("FORM");
  const [formData, setFormData] = useState<RegisterSchema | null>(null);
  const [otpCode, setOtpCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  // Giai đoạn 1: Submit Form -> Gửi OTP
  const onFormSubmit = async (data: RegisterSchema) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // 1. Gọi service gửi OTP
      await otpRegister({ email: data.email });

      // 2. Lưu data và chuyển bước
      setFormData(data);
      setStep("OTP");
      setSuccess("Mã OTP xác thực đã được gửi đến email của bạn.");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Gửi OTP thất bại. Vui lòng kiểm tra lại email.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Giai đoạn 2: Submit OTP -> Verify -> Tạo tài khoản
  const onOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !otpCode) return;

    setError(null);
    setLoading(true);

    try {
      // 1. Verify OTP
      const isValid = await otpVerify({
        email: formData.email,
        inputOtp: otpCode,
        expectedType: "REGISTER",
      });

      if (!isValid) {
        throw new Error("Mã OTP không chính xác hoặc đã hết hạn.");
      }

      // 2. Tạo tài khoản
      await registerUser({
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
      });

      setSuccess("Đăng ký thành công! Đang chuyển hướng...");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Đăng ký thất bại. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // -- Render Giao diện Step 2: Nhập OTP --
  if (step === "OTP") {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 rounded-full p-3">
              <KeyRound className="text-primary h-6 w-6" />
            </div>
          </div>
          <h3 className="text-lg font-semibold">Xác thực Email</h3>
          <p className="text-muted-foreground text-sm">
            Vui lòng nhập mã OTP 6 số đã gửi tới <br />
            <span className="text-foreground font-medium">{formData?.email}</span>
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-center text-sm text-green-600">
            {success}
          </div>
        )}

        <form onSubmit={onOtpSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mã OTP</label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))} // Chỉ cho nhập số
              maxLength={6}
              className="border-input bg-background focus-visible:ring-ring flex h-12 w-full rounded-md border px-3 py-2 text-center text-lg font-bold tracking-[0.5em] focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
              placeholder="______"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || otpCode.length < 6}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Xác nhận đăng ký"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep("FORM");
                setError(null);
              }}
              disabled={loading}
            >
              Quay lại chỉnh sửa & Gửi lại
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // -- Render Giao diện Step 1: Điền Form (Mặc định) --
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Username */}
        <div className="space-y-2">
          <label htmlFor="username" className="text-foreground text-sm font-medium">
            Username
          </label>
          <div className="relative">
            <User className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <input
              id="username"
              type="text"
              className={cn(
                "border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50",
                errors.username && "border-red-500",
              )}
              placeholder="johndoe"
              {...register("username")}
            />
          </div>
          {errors.username && (
            <span className="text-xs text-red-500">{errors.username.message}</span>
          )}
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-foreground text-sm font-medium">
              Họ đệm
            </label>
            <div className="relative">
              <FileText className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <input
                id="firstName"
                type="text"
                className={cn(
                  "border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50",
                  errors.firstName && "border-red-500",
                )}
                placeholder="Nguyễn"
                {...register("firstName")}
              />
            </div>
            {errors.firstName && (
              <span className="text-xs text-red-500">{errors.firstName.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="text-foreground text-sm font-medium">
              Tên
            </label>
            <div className="relative">
              <FileText className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <input
                id="lastName"
                type="text"
                className={cn(
                  "border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50",
                  errors.lastName && "border-red-500",
                )}
                placeholder="Văn A"
                {...register("lastName")}
              />
            </div>
            {errors.lastName && (
              <span className="text-xs text-red-500">{errors.lastName.message}</span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-foreground text-sm font-medium">
            Email
          </label>
          <div className="relative">
            <Mail className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <input
              id="email"
              type="email"
              className={cn(
                "border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50",
                errors.email && "border-red-500",
              )}
              placeholder="name@example.com"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email.message}</span>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-foreground text-sm font-medium">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <input
              id="password"
              type="password"
              className={cn(
                "border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50",
                errors.password && "border-red-500",
              )}
              placeholder="••••••••"
              {...register("password")}
            />
          </div>
          {errors.password && (
            <span className="text-xs text-red-500">{errors.password.message}</span>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-foreground text-sm font-medium"
          >
            Nhập lại mật khẩu
          </label>
          <div className="relative">
            <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <input
              id="confirmPassword"
              type="password"
              className={cn(
                "border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pl-9 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50",
                errors.confirmPassword && "border-red-500",
              )}
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50/50 p-3 text-sm text-red-600">
            <span className="font-semibold">Lỗi:</span> {error}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-green-200 bg-green-50/50 p-3 text-sm text-green-600">
            {success}
          </div>
        )}

        <Button
          type="submit"
          size="md"
          variant="primary"
          disabled={loading}
          className="w-full font-semibold"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xử lý...
            </span>
          ) : (
            "Đăng ký tài khoản"
          )}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Đã có tài khoản?{" "}
        <a
          href="/login"
          className="text-primary hover:text-primary/90 font-medium hover:underline"
        >
          Đăng nhập ngay
        </a>
      </p>
    </div>
  );
}
