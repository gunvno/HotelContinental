"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { useKeycloakAuth } from "@/providers/keycloak-auth-provider";
import { selectLastName, selectToken, selectUserName, useAuthStore } from "@/store/auth-store";

/*
Hướng dẫn custom Header

- navItems: thêm/bớt mục menu hoặc đổi đường dẫn/hash.
- Kiểu nav: đổi class trong <nav>/<Link> để có underline, background khác...
- Logo: thay cụm <span> hiệu ứng bằng hình/biểu trưng riêng.
- Khu vực hành động: thêm nút/đường link ở khu vực bên phải (ThemeToggle, Button...).
- className: áp dụng lớp Tailwind ở <header>/<Container> để đổi nền, blur, shadow.
*/

// Danh sách menu gợi ý các điểm chạm chính trên website khách sạn.
const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Phòng & Suite", href: "/#rooms", hash: "#rooms" },
  { label: "Tiện nghi", href: "/#amenities", hash: "#amenities" },
  { label: "Liên hệ", href: "/#contact", hash: "#contact" },
];

// Header hiển thị logo, menu và nút đổi theme.
export function Header() {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState<string>("");
  const token = useAuthStore(selectToken);
  const userName = useAuthStore(selectUserName);
  const lastName = useAuthStore(selectLastName);
  const logoutLocal = useAuthStore((s) => s.logout);
  const { logout: logoutSSO } = useKeycloakAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
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

  // Đóng menu mobile khi điều hướng
  useEffect(() => {
    if (mobileOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMobileOpen(false);
    }
  }, [pathname, activeHash, mobileOpen]);

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
            <span
              className="absolute bottom-1 left-1 h-2 w-2 rounded-full bg-[#f7d9a5] shadow-[0_0_8px_rgba(247,217,165,0.9)]"
              aria-hidden
            />
            <span
              className="absolute top-1 right-1 h-2 w-2 rounded-full bg-white/85 shadow-[0_0_10px_rgba(255,255,255,0.95)]"
              aria-hidden
            />
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
          {/* Hamburger chỉ hiện trên mobile */}
          <button
            type="button"
            aria-label="Mở menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background/80 shadow-sm hover:bg-background/70"
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
          <span className="hidden md:inline-flex">
            <ThemeToggle />
          </span>
          {!token ? (
            // Nút đăng nhập thay thế vị trí nút liên hệ (đã bỏ)
            <Button href="/login" size="sm" variant="secondary" className="hidden md:inline-flex">
              Đăng nhập
            </Button>
          ) : (
            // Greeting + nút Đăng xuất trôi nổi: click để hiện, click lại để ẩn
            <>
              <button
                type="button"
                onClick={() => setLogoutOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={logoutOpen}
                className="hidden md:inline-flex items-center text-muted-foreground text-sm max-w-[20rem] truncate"
              >
                Xin chào, <span className="text-foreground font-medium ml-1 truncate">{lastName || userName || "bạn"}</span>
              </button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  logoutLocal();
                  logoutSSO();
                  setLogoutOpen(false);
                }}
                className={cn(
                  "hidden md:inline-flex absolute top-full right-0 mt-[3px] rounded-full shadow-lg transition-opacity duration-150",
                  logoutOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
                )}
                aria-label="Đăng xuất"
                title="Đăng xuất"
              >
                Đăng xuất
              </Button>
            </>
          )}
        </div>
        {/* Dropdown menu mobile */}
        <div
          className={cn(
            "absolute left-2 right-2 top-full mt-2 origin-top rounded-xl border border-border bg-background shadow-lg md:hidden z-50",
            mobileOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
            "transition-all duration-150",
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
            <div className="my-2 h-px bg-border/60" />
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-muted-foreground text-xs">Giao diện</span>
              <ThemeToggle />
            </div>
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
                    logoutLocal();
                    logoutSSO();
                    setLogoutOpen(false);
                    setMobileOpen(false);
                  }}
                  className="w-full"
                >
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
