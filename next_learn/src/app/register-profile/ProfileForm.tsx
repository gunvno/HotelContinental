"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Calendar, MapPin, Phone, CreditCard, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createProfile } from "@/services/profile-service";
import { profileSchema, type ProfileSchema } from "./profile-schema";

export function ProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId"); // Lấy userId từ URL nếu có

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ProfileSchema) => {
    if (!userId) {
      setError("Không tìm thấy User ID. Vui lòng đăng nhập lại hoặc kiểm tra đường dẫn.");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await createProfile({
        userId,
        ...data,
      });
      
      setSuccess("Cập nhật hồ sơ thành công!");
      // Chuyển hướng về trang chủ hoặc dashboard
      setTimeout(() => {
        router.push("/");
      }, 1500);
      
    } catch (err: any) {
      const errorMessage = err?.message || "Cập nhật hồ sơ thất bại. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Hoàn tất hồ sơ</h3>
        <p className="text-sm text-muted-foreground">
          Vui lòng cập nhật thêm thông tin cá nhân để hoàn tất đăng ký.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Gender */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Giới tính</label>
          <div className="relative">
             <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <select
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                errors.gender && "border-red-500"
              )}
              {...register("gender")}
             >
               <option value="">Chọn giới tính</option>
               <option value="Male">Nam</option>
               <option value="Female">Nữ</option>
               <option value="Other">Khác</option>
             </select>
          </div>
          {errors.gender && <span className="text-xs text-red-500">{errors.gender.message}</span>}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Ngày sinh</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                errors.dateOfBirth && "border-red-500"
              )}
              {...register("dateOfBirth")}
            />
          </div>
          {errors.dateOfBirth && <span className="text-xs text-red-500">{errors.dateOfBirth.message}</span>}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Địa chỉ</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                errors.address && "border-red-500"
              )}
              placeholder="Số nhà, đường, phường/xã..."
              {...register("address")}
            />
          </div>
          {errors.address && <span className="text-xs text-red-500">{errors.address.message}</span>}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Số điện thoại</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="tel"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                errors.phoneNumber && "border-red-500"
              )}
              placeholder="09xxx..."
              {...register("phoneNumber")}
            />
          </div>
          {errors.phoneNumber && <span className="text-xs text-red-500">{errors.phoneNumber.message}</span>}
        </div>

        {/* Identity Number */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Số CMND/CCCD</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                errors.identityNumber && "border-red-500"
              )}
              placeholder="12 số..."
              {...register("identityNumber")}
            />
          </div>
          {errors.identityNumber && <span className="text-xs text-red-500">{errors.identityNumber.message}</span>}
        </div>

        {error && (
          <div className="bg-red-50/50 border border-red-200 text-red-600 rounded-md p-3 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50/50 border border-green-200 text-green-600 rounded-md p-3 text-sm text-center">
            {success}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Lưu hồ sơ"}
        </Button>
      </form>
    </div>
  );
}
