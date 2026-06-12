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

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
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

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[#865316] to-[#C68948] text-white font-bold text-sm uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all",
  secondary:
    "border border-outline-variant/30 bg-white/40 text-on-surface font-bold text-sm uppercase tracking-widest backdrop-blur-md transition-all hover:bg-white/60",
  ghost:
    "border border-outline/20 bg-transparent text-on-surface font-bold text-sm uppercase tracking-widest transition-all hover:bg-surface-variant/50",
  outline:
    "border border-outline/30 bg-transparent text-on-surface font-bold text-sm uppercase tracking-widest transition-all hover:bg-surface-variant/50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export type ButtonProps = ConditionalProps;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    { children, className, href, variant = "primary", size = "md", ...rest },
    ref,
  ) {
    const composedClasses = cn(
      "inline-flex items-center justify-center rounded-full border border-transparent font-semibold transition-transform duration-200 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
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
