"use client";

import {
  BedDouble,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  DoorOpen,
  Grid3X3,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { useKeycloakAuth } from "@/providers/keycloak-auth-provider";
import { useAuthStore } from "@/store/auth-store";

const primaryNav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Phòng", href: "/rooms", icon: BedDouble },
  { label: "Đặt phòng", href: "/bookings", icon: CalendarCheck },
  { label: "Khách hàng", href: "/users", icon: Users },
];

const catalogNav = [
  { label: "Tổng quan danh mục", href: "/admin", icon: Grid3X3 },
  { label: "Loại phòng", href: "/admin/room-types", icon: DoorOpen },
  { label: "Cơ sở vật chất", href: "/admin/amenities", icon: Sparkles },
  { label: "Gán cơ sở vật chất theo loại", href: "/admin/amenity-rooms", icon: ClipboardList },
  { label: "Gán dịch vụ bổ sung theo loại", href: "/admin/room-type-services", icon: ShieldCheck },
];

const systemNav = [{ label: "Cài đặt", href: "/settings", icon: Settings }];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const userInfo = useAuthStore((state) => state.userInfo);
  const { logout } = useKeycloakAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f2d7b4,transparent_35%),#140f0b] p-4">
        {children}
      </div>
    );
  }

  const pageTitle = getPathTitle(pathname);
  const displayName = userInfo?.name || userInfo?.preferred_username || "Admin";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen overflow-hidden bg-[#f5efe5] text-[#211a14] dark:bg-[#11100d] dark:text-[#f8f1e7]">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(178,106,44,0.18),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(33,26,20,0.16),transparent_26%)]" />

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#decdb9] bg-white/80 shadow-lg backdrop-blur lg:hidden dark:border-[#3a2e24] dark:bg-[#1a1713]/80"
        aria-label="Mở menu quản trị"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[19rem] flex-col border-r border-[#decdb9] bg-[#1f1710] text-[#f9efe1] shadow-2xl transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="relative overflow-hidden border-b border-white/10 p-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(236,183,110,0.35),transparent_35%)]" />
          <div className="relative flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e8c990]/40 bg-[#9b5c24] font-[var(--font-cormorant)] text-2xl font-bold shadow-[0_20px_50px_-28px_rgba(0,0,0,0.95)]">
                C
              </span>
              <span className="leading-tight">
                <span className="block font-[var(--font-cormorant)] text-2xl font-bold tracking-wide">
                  Continental
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d9bf9a]">
                  Admin House
                </span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-full p-2 text-white/70 hover:bg-white/10 lg:hidden"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <NavGroup title="Vận hành" items={primaryNav} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <NavGroup title="Danh mục phòng" items={catalogNav} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <NavGroup title="Hệ thống" items={systemNav} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8c990] text-sm font-black text-[#1f1710]">
                {initials || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{displayName}</p>
                <p className="truncate text-xs text-[#d9bf9a]">{userInfo?.email || "Quản trị viên"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[19rem]">
        <header className="sticky top-0 z-30 border-b border-[#decdb9]/80 bg-[#f6f1e8]/78 px-5 py-4 backdrop-blur-xl dark:border-[#3a2e24] dark:bg-[#11100d]/78 lg:px-8">
          <div className="flex items-center justify-between gap-4 pl-14 lg:pl-0">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-[#9b5c24] dark:text-[#d7a25f]">
                Hotel Continental
                <ChevronRight className="h-3.5 w-3.5" />
                Admin
              </div>
              <h1 className="mt-1 font-[var(--font-cormorant)] text-3xl font-bold tracking-tight lg:text-4xl">
                {pageTitle}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-[#decdb9] bg-white/60 px-4 py-2 text-sm font-semibold text-[#5f5144] shadow-sm dark:border-[#3a2e24] dark:bg-white/[0.05] dark:text-[#d8c9b7] md:block">
                {new Intl.DateTimeFormat("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }).format(new Date())}
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-88px)] p-5 lg:p-8">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

function NavGroup({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div className="mb-7">
      <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#b79b74]">
        {title}
      </p>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" || item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
                active
                  ? "bg-[#e8c990] text-[#1f1710] shadow-[0_18px_50px_-30px_rgba(232,201,144,0.85)]"
                  : "text-[#eadbc4]/82 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {active ? <span className="h-2 w-2 rounded-full bg-[#1f1710]" /> : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function getPathTitle(pathname: string) {
  if (pathname === "/") return "Bảng điều khiển";
  if (pathname.startsWith("/rooms")) return "Quản lý phòng";
  if (pathname === "/admin") return "Danh mục vận hành";
  if (pathname.startsWith("/admin/room-types")) return "Loại phòng";
  if (pathname.startsWith("/admin/amenities")) return "Cơ sở vật chất";
  if (pathname.startsWith("/admin/amenity-rooms")) return "Gán cơ sở vật chất theo loại phòng";
  if (pathname.startsWith("/admin/room-type-services")) return "Gán dịch vụ bổ sung theo loại phòng";
  if (pathname.startsWith("/bookings")) return "Đặt phòng";
  if (pathname.startsWith("/users")) return "Khách hàng";
  if (pathname.startsWith("/settings")) return "Cài đặt";
  return "Hotel Admin";
}
