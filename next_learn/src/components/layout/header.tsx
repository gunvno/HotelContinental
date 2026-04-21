"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { useKeycloakAuth } from "@/providers/keycloak-auth-provider";
import {
  selectFirstName,
  selectLastName,
  selectToken,
  selectUserName,
  useAuthStore,
} from "@/store/auth-store";
import { BadgeInfo, ChevronDown, LogOut, Mail, UserRound } from "lucide-react";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Phòng & Suite", href: "/room/listroom" },
  { label: "Tiện nghi", href: "/amenities" },
  { label: "Liên hệ", href: "/#contact", hash: "#contact" },
];

const PENDING_HOME_HASH_KEY = "next_learn:pending-home-hash";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeHash, setActiveHash] = useState("");
  const token = useAuthStore(selectToken);
  const userName = useAuthStore(selectUserName);
  const firstName = useAuthStore(selectFirstName);
  const lastName = useAuthStore(selectLastName);
  const logoutLocal = useAuthStore((state) => state.logout);
  const { logout: logoutSSO, userInfo } = useKeycloakAuth();
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
      setMobileOpen(false);
    }
  }, [pathname, activeHash, mobileOpen]);

  useEffect(() => {
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined" || pathname !== "/") {
      return;
    }

    const pendingHash = window.sessionStorage.getItem(PENDING_HOME_HASH_KEY);
    if (!pendingHash) {
      return;
    }

    window.sessionStorage.removeItem(PENDING_HOME_HASH_KEY);
    window.scrollTo({ top: 0, behavior: "auto" });
    window.requestAnimationFrame(() => {
      const target = document.querySelector(pendingHash);
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", pendingHash);
        setActiveHash(pendingHash);
      }
    });
  }, [pathname]);

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof navItems)[number],
  ) => {
    if (!item.hash) {
      setActiveHash("");
      return;
    }

    event.preventDefault();
    setActiveHash(item.hash);
    setMobileOpen(false);

    if (pathname !== "/") {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(PENDING_HOME_HASH_KEY, item.hash);
      }
      router.push("/");
      return;
    }

    const target = document.querySelector(item.hash);
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", item.hash);
    }
  };

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || userName || userInfo?.name || "bạn";
  const displayEmail = userInfo?.email || userInfo?.preferred_username || "Tài khoản khách";
  const accountInitial = (firstName?.[0] || lastName?.[0] || userName?.[0] || userInfo?.name?.[0] || "C").toUpperCase();

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
              onClick={(event) => handleNavClick(event, item)}
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background/80 shadow-sm hover:bg-background/70 md:hidden"
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
            <Button href="/login" size="sm" variant="primary" className="hidden md:inline-flex">
              Đăng nhập
            </Button>
          ) : (
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                aria-haspopup="true"
                aria-expanded={accountOpen}
                className="flex items-center gap-3 rounded-full border border-border/60 bg-background/70 px-3 py-2 text-left shadow-sm transition hover:border-ring/30 hover:bg-background"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2b1d12] to-[#c68948] text-sm font-bold text-white shadow-[0_16px_30px_-18px_rgba(0,0,0,0.8)]">
                  {accountInitial}
                </span>
                <span className="flex max-w-[16rem] flex-col leading-tight">
                  <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                    Xin chào
                  </span>
                  <span className="truncate text-sm font-semibold text-foreground">
                    {displayName}
                  </span>
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 text-muted-foreground transition-transform", accountOpen && "rotate-180")}
                />
              </button>

              <div
                className={cn(
                  "absolute right-0 top-full mt-3 w-[340px] rounded-3xl border border-border/60 bg-background/95 p-4 shadow-[0_30px_80px_-35px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-150",
                  accountOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
                )}
              >
                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2b1d12] to-[#c68948] text-lg font-bold text-white shadow-[0_16px_30px_-18px_rgba(0,0,0,0.8)]">
                    {accountInitial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
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
                    className="flex items-center gap-3 rounded-2xl border border-border/50 px-3 py-3 transition hover:border-ring/30 hover:bg-muted/40"
                  >
                    <UserRound className="h-4 w-4 text-[#8b5e22]" />
                    <span className="flex-1">
                      <span className="block font-medium text-foreground">Thông tin tài khoản</span>
                      <span className="block text-xs text-muted-foreground">Xem hồ sơ, liên hệ và trạng thái đăng nhập</span>
                    </span>
                  </Link>
                  <div className="flex items-center gap-3 rounded-2xl border border-border/50 px-3 py-3">
                    <Mail className="h-4 w-4 text-[#8b5e22]" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-foreground">Email</span>
                      <span className="block truncate text-xs text-muted-foreground">{displayEmail}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button href="/account" variant="secondary" size="sm" className="w-full" onClick={() => setAccountOpen(false)}>
                    Mở hồ sơ
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      logoutLocal();
                      logoutSSO();
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
            "absolute left-2 right-2 top-full z-50 mt-2 origin-top rounded-xl border border-border bg-background shadow-lg transition-all duration-150 md:hidden",
            mobileOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
          )}
        >
          <nav className="flex flex-col p-2 text-sm">
            {computedNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(event) => {
                  handleNavClick(event, item);
                  setMobileOpen(false);
                }}
                className={cn(
                  "rounded-lg px-3 py-2",
                  item.isActive ? "bg-ring/15 text-ring" : "text-foreground hover:bg-background/70",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border/60" />
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs text-muted-foreground">Giao diện</span>
              <ThemeToggle />
            </div>
            {!token ? (
              <div className="p-2">
                <Button href="/login" size="sm" className="w-full">
                  Đăng nhập
                </Button>
              </div>
            ) : (
              <div className="space-y-3 p-2">
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Tài khoản</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
                </div>
                <Button href="/account" size="sm" variant="secondary" className="w-full" onClick={() => setMobileOpen(false)}>
                  Thông tin tài khoản
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    logoutLocal();
                    logoutSSO();
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
