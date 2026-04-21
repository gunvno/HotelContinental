"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getMyProfile, type ProfileResponse } from "@/services/profile-service";
import { useKeycloakAuth } from "@/providers/keycloak-auth-provider";
import { useAuthStore } from "@/store/auth-store";
import Link from "next/link";
import {
  CalendarCheck,
  CreditCard,
  Lock,
  ReceiptText,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function AccountPage() {
  const { userInfo, logout } = useKeycloakAuth();
  const logoutLocal = useAuthStore((state) => state.logout);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const loadProfile = async () => {
      try {
        const result = await getMyProfile();
        if (alive) {
          setProfile(result);
        }
      } catch (loadError) {
        if (alive) {
          setError(loadError instanceof Error ? loadError.message : "Không tải được hồ sơ tài khoản.");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      alive = false;
    };
  }, []);

  const displayName = userInfo?.name || userInfo?.preferred_username || "Khách lưu trú";
  const email = userInfo?.email || userInfo?.preferred_username || "Chưa có email";
  const nameParts = displayName.split(" ").filter(Boolean);
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : displayName;
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const userId = userInfo?.sub;

  const handleLogout = () => {
    logoutLocal();
    logout();
  };

  return (
    <section className="min-h-screen bg-white">
      <Container className="py-12 md:py-20 lg:py-24">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          {/* Left Sidebar */}
          <aside className="w-full md:w-[240px] lg:w-[280px] shrink-0 md:sticky md:top-32 flex flex-col gap-8 md:gap-10">
            <div>
              <h2 className="font-serif text-[28px] font-bold text-[#1f1a17]">Cài đặt tài khoản</h2>
              <p className="mt-2 text-sm text-[#8c8277]">Quản lý thông tin và bảo mật</p>
            </div>

            <nav className="flex flex-col gap-5 text-[15px]">
              <Link href="/account" className="flex items-center gap-4 text-[#00b0a6] font-semibold transition-colors">
                <UserRound className="h-[18px] w-[18px]" />
                Hồ sơ cá nhân
              </Link>
              <Link href="/account/invoices" className="flex items-center gap-4 text-[#8c8277] transition-colors hover:text-[#1f1a17]">
                <ReceiptText className="h-[18px] w-[18px]" />
                Lịch sử hóa đơn
              </Link>
              <Link href="/account/payments" className="flex items-center gap-4 text-[#8c8277] transition-colors hover:text-[#1f1a17]">
                <CreditCard className="h-[18px] w-[18px]" />
                Thanh toán
              </Link>
              <button type="button" className="flex items-center gap-4 text-[#8c8277] transition-colors hover:text-[#1f1a17]">
                <Settings className="h-[18px] w-[18px]" />
                Cài đặt chung
              </button>
            </nav>

            <div className="pt-4 border-t border-[#f0ece5]">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#d6af7a]">TRẠNG THÁI HỘI VIÊN</p>
              <p className="mt-2 font-serif text-[22px] font-bold text-[#1f1a17]">Hạng Gold Member</p>
              <p className="mt-3 text-[13px] leading-relaxed text-[#8c8277]">Tận hưởng ưu đãi độc quyền tại mọi sảnh chờ của Continental.</p>
            </div>
          </aside>

          {/* Right Content */}
          <div className="flex-1 w-full space-y-16">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="relative h-[110px] w-[110px] shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"
                  alt="Avatar người dùng"
                  className="h-full w-full object-cover rounded-3xl"
                />
                <button
                  type="button"
                  aria-label="Đổi ảnh đại diện"
                  className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#d99a4c] text-white shadow-sm transition-transform hover:scale-105 border-[3px] border-white"
                >
                  <UserRound className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex justify-center flex-col">
                <h1 className="font-serif text-[32px] font-bold text-[#1f1a17]">{displayName}</h1>
                <p className="mt-1 text-[13px] text-[#8c8277]">Thành viên từ tháng 12, 2022</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#00b0a6]">XÁC THỰC</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d6af7a]">PREMIUM</span>
                  {loading && <span className="text-[10px] uppercase text-[#8c8277]">Đang tải...</span>}
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="space-y-8">
              <h3 className="flex items-center gap-3 font-serif text-2xl font-bold text-[#1f1a17]">
                <UserRound className="h-5 w-5 text-[#d99a4c]" />
                Thông tin cá nhân
              </h3>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold tracking-wide text-[#8c8277] uppercase">Họ</label>
                  <input
                    value={firstName}
                    readOnly
                    className="w-full border-b border-[#f0ece5] bg-transparent py-2 text-[15px] font-medium text-[#1f1a17] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold tracking-wide text-[#8c8277] uppercase">Tên</label>
                  <input
                    value={lastName}
                    readOnly
                    className="w-full border-b border-[#f0ece5] bg-transparent py-2 text-[15px] font-medium text-[#1f1a17] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold tracking-wide text-[#8c8277] uppercase">Địa chỉ Email</label>
                <input
                  value={email}
                  readOnly
                  className="w-full border-b border-[#f0ece5] bg-transparent py-2 text-[15px] font-medium text-[#1f1a17] outline-none"
                />
              </div>

              {profile && (
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold tracking-wide text-[#8c8277] uppercase">Số điện thoại</label>
                    <input
                      value={profile.phoneNumber || ""}
                      readOnly
                      className="w-full border-b border-[#f0ece5] bg-transparent py-2 text-[15px] font-medium text-[#1f1a17] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold tracking-wide text-[#8c8277] uppercase">Ngày sinh</label>
                    <input
                      value={profile.dateOfBirth || ""}
                      readOnly
                      className="w-full border-b border-[#f0ece5] bg-transparent py-2 text-[15px] font-medium text-[#1f1a17] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Security */}
            <div className="space-y-8">
              <h3 className="flex items-center gap-3 font-serif text-2xl font-bold text-[#1f1a17]">
                <Lock className="h-5 w-5 text-[#d99a4c]" />
                Mật khẩu & Bảo mật
              </h3>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold tracking-wide text-[#8c8277] uppercase">Mật khẩu hiện tại</label>
                  <input
                    value="••••••••••••"
                    readOnly
                    type="password"
                    className="w-full border-b border-[#f0ece5] bg-transparent py-2 text-[15px] tracking-widest text-[#1f1a17] outline-none"
                  />
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold tracking-wide text-[#8c8277] uppercase">Mật khẩu mới</label>
                    <input
                      placeholder="Tối thiểu 8 ký tự"
                      type="password"
                      className="w-full border-b border-[#f0ece5] bg-transparent py-2 text-[15px] text-[#1f1a17] placeholder:text-[#d3ccc3] outline-none focus:border-[#d99a4c]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold tracking-wide text-[#8c8277] uppercase">Xác nhận mật khẩu mới</label>
                    <input
                      placeholder="Nhập lại mật khẩu mới"
                      type="password"
                      className="w-full border-b border-[#f0ece5] bg-transparent py-2 text-[15px] text-[#1f1a17] placeholder:text-[#d3ccc3] outline-none focus:border-[#d99a4c]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-8">
              <button
                type="button"
                className="rounded-full bg-[#eca853] px-10 py-3.5 text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(236,168,83,0.3)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(236,168,83,0.4)]"
              >
                Lưu thay đổi
              </button>
            </div>
            
            <div className="flex justify-end border-t border-[#f0ece5] pt-6">
              <button
                type="button"
                onClick={handleLogout}
                className="text-[13px] font-semibold text-[#8c8277] transition-colors hover:text-[#d94c4c]"
              >
                Đăng xuất
              </button>
            </div>
            
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
