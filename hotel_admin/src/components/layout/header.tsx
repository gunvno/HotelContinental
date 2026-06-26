"use client";

import { BadgeInfo, ChevronDown, LogOut, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { logoutAuthToken } from "@/services/auth-service";
import {
  selectLastName,
  selectToken,
  selectUserName,
  useAuthStore,
} from "@/store/auth-store";

const navItems: Array<{ label: string; href: string; hash?: string }> = [
  { label: "Dashboard", href: "/" },
  { label: "Danh mục", href: "/admin/room-types" },
  { label: "Phòng", href: "/rooms" },
  { label: "Đặt phòng", href: "/bookings" },
  { label: "Người dùng", href: "/users" },
  { label: "Cài đặt", href: "/settings" },
];

export function Header() {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");
  const token = useAuthStore(selectToken);
  const userName = useAuthStore(selectUserName);
  const lastName = useAuthStore(selectLastName);
  const logoutLocal = useAuthStore((state) => state.logout);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateHash = () => {
      setActiveHash(window.location.hash);
    };

    updateHash();
    window.addEventListener("hashchange", updateHash);

    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const computedNav = useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        isActive:
          typeof item.hash === "string"
            ? activeHash === item.hash
            : pathname === item.href && (!activeHash || activeHash === "#top"),
      })),
    [pathname, activeHash],
  );

  useEffect(() => {
    if (mobileOpen) {
      queueMicrotask(() => setMobileOpen(false));
    }
  }, [pathname, activeHash, mobileOpen]);

  useEffect(() => {
    queueMicrotask(() => setAccountOpen(false));
  }, [pathname]);

  const displayName = [lastName, userName].filter(Boolean).join(" ") || "bạn";
  const displayEmail = userName || "Tài khoản khách";
  const accountInitial = (lastName?.[0] || userName?.[0] || "A").toUpperCase();

  const handleLogout = () => {
    if (token) {
      void logoutAuthToken(token).catch(() => undefined);
    }
    logoutLocal();
  };

  return (
    <header className="border-border/40 bg-background/85 sticky top-0 z-40 border-b shadow-[0_20px_60px_-40px_rgba(31,41,55,0.45)] backdrop-blur-xl">
      <Container className="relative flex items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="relative inline-flex h-12 w-12 items-center justify-center">
            <span
              className="absolute inset-0 rounded-full shadow-[0_30px_65px_-28px_rgba(15,10,5,0.92)]"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #fce7c3 0%, #d9a450 45%, #6b3a11 100%)",
              }}
              aria-hidden
            />
            <span
              className="absolute inset-[2px] rounded-full border border-white/25"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.35), transparent 55%), repeating-conic-gradient(from 0deg, rgba(255,255,255,0.08) 0deg 10deg, rgba(0,0,0,0.08) 10deg 20deg)",
                mixBlendMode: "screen",
              }}
              aria-hidden
            />
            <span
              className="absolute inset-[6px] rounded-full border border-[#f7d9a5]/40"
              style={{
                background:
                  "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.45), transparent 55%), conic-gradient(from 90deg, rgba(255,255,255,0.18) 0deg 45deg, rgba(198,132,48,0.45) 45deg 135deg, rgba(247,217,165,0.6) 135deg 180deg, rgba(198,132,48,0.45) 180deg 315deg, rgba(255,255,255,0.18) 315deg 360deg)",
              }}
              aria-hidden
            />
            <span className="relative flex h-12 w-12 items-center justify-center font-serif text-[26px] tracking-[0.3em] text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)]">
              C
            </span>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-foreground text-sm font-semibold tracking-[0.32em] uppercase">
              Continental
            </span>
            <span className="text-muted-foreground text-[10px] font-medium tracking-[0.45em] uppercase">
              Grand Hotel
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-3 text-sm font-medium md:flex">
          {computedNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                setActiveHash(item.hash ?? "");
              }}
              className={cn(
                "rounded-full border border-transparent px-3 py-1.5 transition-all duration-200",
                item.isActive
                  ? "border-ring/45 bg-ring/15 text-ring shadow-sm"
                  : "text-muted-foreground hover:border-border/40 hover:bg-background/70 hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Mở menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
            className="border-border/60 bg-background/80 hover:bg-background/70 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {!token ? (
            <Button
              href="/login"
              size="sm"
              variant="secondary"
              className="hidden md:inline-flex"
            >
              Đăng nhập
            </Button>
          ) : (
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                aria-haspopup="true"
                aria-expanded={accountOpen}
                className="border-border/60 bg-background/70 hover:border-ring/30 hover:bg-background flex items-center gap-3 rounded-full border px-3 py-2 text-left shadow-sm transition"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2b1d12] to-[#c68948] text-sm font-bold text-white shadow-[0_16px_30px_-18px_rgba(0,0,0,0.8)]">
                  {accountInitial}
                </span>
                <span className="flex max-w-[16rem] flex-col leading-tight">
                  <span className="text-muted-foreground text-[11px] tracking-[0.3em] uppercase">
                    Xin chào
                  </span>
                  <span className="text-foreground truncate text-sm font-semibold">
                    {displayName}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "text-muted-foreground h-4 w-4 transition-transform",
                    accountOpen && "rotate-180",
                  )}
                />
              </button>

              <div
                className={cn(
                  "border-border/60 bg-background/95 absolute top-full right-0 mt-3 w-[340px] rounded-3xl border p-4 shadow-[0_30px_80px_-35px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-150",
                  accountOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0",
                )}
              >
                <div className="border-border/60 bg-muted/30 flex items-start gap-3 rounded-2xl border p-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2b1d12] to-[#c68948] text-lg font-bold text-white shadow-[0_16px_30px_-18px_rgba(0,0,0,0.8)]">
                    {accountInitial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-semibold">
                      {displayName}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {displayEmail}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                      <BadgeInfo className="h-3.5 w-3.5" />
                      Hồ sơ cá nhân
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <Link
                    href="/account"
                    onClick={() => setAccountOpen(false)}
                    className="border-border/50 hover:border-ring/30 hover:bg-muted/40 flex items-center gap-3 rounded-2xl border px-3 py-3 transition"
                  >
                    <UserRound className="h-4 w-4 text-[#8b5e22]" />
                    <span className="flex-1">
                      <span className="text-foreground block font-medium">
                        Thông tin tài khoản
                      </span>
                      <span className="text-muted-foreground block text-xs">
                        Xem hồ sơ, liên hệ và trạng thái đăng nhập
                      </span>
                    </span>
                  </Link>
                  <div className="border-border/50 flex items-center gap-3 rounded-2xl border px-3 py-3">
                    <Mail className="h-4 w-4 text-[#8b5e22]" />
                    <span className="min-w-0 flex-1">
                      <span className="text-foreground block font-medium">Email</span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {displayEmail}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    href="/account"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setAccountOpen(false)}
                  >
                    Mở hồ sơ
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      handleLogout();
                      setAccountOpen(false);
                    }}
                    className="w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={cn(
            "border-border bg-background absolute top-full right-2 left-2 z-50 mt-2 origin-top rounded-xl border shadow-lg transition-all duration-150 md:hidden",
            mobileOpen
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0",
          )}
        >
          <nav className="flex flex-col p-2 text-sm">
            {computedNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setActiveHash(item.hash ?? "");
                  setMobileOpen(false);
                }}
                className={cn(
                  "rounded-lg px-3 py-2",
                  item.isActive
                    ? "bg-ring/15 text-ring"
                    : "text-foreground hover:bg-background/70",
                )}
              >
                {item.label}
              </Link>
            ))}
            {!token ? (
              <div className="p-2">
                <Button href="/login" size="sm" className="w-full">
                  Đăng nhập
                </Button>
              </div>
            ) : (
              <div className="p-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    handleLogout();
                    setAccountOpen(false);
                    setMobileOpen(false);
                  }}
                  className="w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </Button>
              </div>
            )}
          </nav>
        </div>
      </Container>
    </header>
  );
}
