"use client";

import Link from "next/link";
import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  forwardRef,
  type ReactNode,
  type Ref,
} from "react";

import { cn } from "@/lib/utils";

/*
Hướng dẫn custom Button

- variant: chọn phong cách nút (primary | secondary | ghost).
- size: kích cỡ (sm | md | lg).
- className: thêm lớp Tailwind để tinh chỉnh (shadow, màu, hover...).
- href: nếu truyền href → render thẻ Link <a>; nếu không → thẻ <button>.
- ...rest: truyền HTML attributes (onClick, type, aria-*, data-*...).

Mở rộng nhanh:
- Thêm biến thể mới: thêm key vào variantClasses và mở rộng kiểu ButtonVariant.
- Thêm size mới: thêm key vào sizeClasses và mở rộng kiểu ButtonSize.
*/

// Định nghĩa các biến thể button chuẩn cho toàn dự án.
type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonSize = "sm" | "md" | "lg";

type BaseProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type ConditionalProps =
  | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement> & BaseProps)
  | (ButtonHTMLAttributes<HTMLButtonElement> & BaseProps & { href?: undefined });

// Quy ước class theo biến thể giúp dễ nhận diện và mở rộng.
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[#e3b480] to-[#c47a34] text-white shadow-[0_18px_42px_-24px_rgba(196,122,52,0.8)] hover:from-[#f0c899] hover:to-[#c17528]",
  secondary:
    "border border-border/50 bg-background/85 text-foreground shadow-[0_12px_30px_-24px_rgba(31,41,55,0.35)] hover:border-ring/40 hover:bg-background/95",
  ghost:
    "border border-transparent bg-transparent text-foreground hover:border-border/40 hover:bg-background/70",
};

// Kích thước thông dụng cần có để đảm bảo nhất quán.
const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export type ButtonProps = ConditionalProps;

// Button hỗ trợ cả thẻ a và button để phục vụ link hoặc action.
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    { children, className, href, variant = "primary", size = "md", ...rest },
    ref,
  ) {
    const composedClasses = cn(
      "inline-flex items-center justify-center rounded-full border border-transparent font-semibold transition-transform duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      variantClasses[variant],
      sizeClasses[size],
      className,
    );

    if (href) {
      const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
      return (
        <Link
          href={href}
          className={composedClasses}
          ref={ref as Ref<HTMLAnchorElement>}
          {...anchorProps}
        >
          {children}
        </Link>
      );
    }

    const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <button
        className={composedClasses}
        ref={ref as Ref<HTMLButtonElement>}
        {...buttonProps}
      >
        {children}
      </button>
    );
  },
);
