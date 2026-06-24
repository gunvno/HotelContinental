"use client";

import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  text?: string;
  children?: ReactNode;
  className?: string;
};

export function EmptyState({ text, children, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-[#decdb9] bg-[#fbf6ed] p-6 text-center text-sm font-semibold text-[#7c6f63]",
        className,
      )}
    >
      {children ?? text}
    </div>
  );
}
