"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Mail, Lock, FileText, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { registerUser, otpRegister, otpVerify } from "@/services/auth-service";
import { registerSchema, type RegisterSchema } from "./register-schema";

export function RegisterForm() {
  const router = useRouter();
  
  // -- State Logic cho Form --
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
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
      setStep('OTP');
      setSuccess("Mã OTP xác thực đã được gửi đến email của bạn.");

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gửi OTP thất bại. Vui lòng kiểm tra lại email.";
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
            expectedType: "REGISTER" 
        });

        if (!isValid) {
            throw new Error("Mã OTP không chính xác hoặc đã hết hạn.");
        }

        // 2. Tạo tài khoản
        const userId = await registerUser({
            username: formData.username,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            password: formData.password,
        });
      
        setSuccess("Đăng ký thành công! Đang chuyển hướng...");
        
        setTimeout(() => {
            if (userId) {
              // Chuyển hướng sang trang cập nhật thông tin profile
              router.push(`/register-profile?userId=${userId}`);
            } else {
              // Fallback nếu không có userId -> Login
              router.push("/login"); 
            }
        }, 2000);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Đăng ký thất bại. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // -- Render Giao diện Step 2: Nhập OTP --
  if (step === 'OTP') {
    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="flex justify-center">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <KeyRound className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <h3 className="text-lg font-semibold">Xác thực Email</h3>
                <p className="text-sm text-muted-foreground">
                    Vui lòng nhập mã OTP 6 số đã gửi tới <br/>
                    <span className="font-medium text-foreground">{formData?.email}</span>
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200 text-center">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md border border-green-200 text-center">
                    {success}
                </div>
            )}

            <form onSubmit={onOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Mã OTP</label>
                    <input 
                        type="text" 
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} // Chỉ cho nhập số
                        maxLength={6}
                        className="flex h-12 w-full text-center text-lg tracking-[0.5em] font-bold rounded-md border border-input bg-background px-3 py-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="______"
                        autoFocus
                    />
                </div>

                <div className="grid gap-2">
                    <Button type="submit" className="w-full" disabled={loading || otpCode.length < 6}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Xác nhận đăng ký"}
                    </Button>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full" 
                        onClick={() => { setStep('FORM'); setError(null); }}
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
          <label htmlFor="username" className="text-sm font-medium text-foreground">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              id="username"
              type="text"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                errors.username && "border-red-500"
              )}
              placeholder="johndoe"
              {...register("username")}
            />
          </div>
          {errors.username && <span className="text-xs text-red-500">{errors.username.message}</span>}
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                Họ đệm
            </label>
            <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                id="firstName"
                type="text"
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                    errors.firstName && "border-red-500"
                )}
                placeholder="Nguyễn"
                {...register("firstName")}
                />
            </div>
            {errors.firstName && <span className="text-xs text-red-500">{errors.firstName.message}</span>}
            </div>

            <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                Tên
            </label>
            <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                id="lastName"
                type="text"
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                    errors.lastName && "border-red-500"
                )}
                placeholder="Văn A"
                {...register("lastName")}
                />
            </div>
            {errors.lastName && <span className="text-xs text-red-500">{errors.lastName.message}</span>}
            </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              id="email"
              type="email"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                errors.email && "border-red-500"
              )}
              placeholder="name@example.com"
              {...register("email")}
            />
          </div>
          {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              id="password"
              type="password"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                errors.password && "border-red-500"
              )}
              placeholder="••••••••"
              {...register("password")}
            />
          </div>
          {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
            Nhập lại mật khẩu
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              id="confirmPassword"
              type="password"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                errors.confirmPassword && "border-red-500"
              )}
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
        </div>

        {error && (
          <div className="bg-red-50/50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
            <span className="font-semibold">Lỗi:</span> {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50/50 border border-green-200 text-green-600 rounded-md p-3 text-sm">
             {success}
          </div>
        )}

        <Button type="submit" size="md" variant="primary" disabled={loading} className="w-full font-semibold">
          {loading ? (
             <span className="flex items-center gap-2">
               <Loader2 className="h-4 w-4 animate-spin" />
               Đang xử lý...
             </span>
          ) : "Đăng ký tài khoản"}
        </Button>
      </form>
      
      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <a 
          href="/login" 
          className="font-medium text-primary hover:text-primary/90 hover:underline"
        >
          Đăng nhập ngay
        </a>
      </p>
    </div>
  );
}
