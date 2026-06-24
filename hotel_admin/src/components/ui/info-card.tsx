"use client";

import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type SummaryInfoCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  className?: string;
};

export function SummaryInfoCard({
  icon,
  label,
  value,
  sub,
  className,
}: SummaryInfoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#decdb9] bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#fbf6ed] p-2 text-[#9b5c24]">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
            {label}
          </p>
          <p className="mt-2 text-lg font-black break-words text-[#17213a]">
            {value}
          </p>
          {sub ? <p className="mt-1 text-sm text-[#7c6f63]">{sub}</p> : null}
        </div>
      </div>
    </div>
  );
}

type LargeInfoCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
};

export function LargeInfoCard({ icon, label, value, className }: LargeInfoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#eee3d5] bg-[#fbf6ed] p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-white p-2 text-[#9b5c24]">{icon}</div>
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
            {label}
          </p>
          <p className="mt-2 text-xl font-bold text-[#17213a]">{value}</p>
        </div>
      </div>
    </div>
  );
}

type DetailInfoCardProps = {
  label: string;
  value: string;
  className?: string;
};

export function DetailInfoCard({ label, value, className }: DetailInfoCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#eee3d5] bg-[#fbf6ed] p-4",
        className,
      )}
    >
      <p className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
        {label}
      </p>
      <p className="mt-2 font-semibold break-words text-[#17213a]">{value}</p>
    </div>
  );
}

type MoneyInfoCardProps = {
  label: string;
  value: string;
  strong?: boolean;
  className?: string;
};

export function MoneyInfoCard({
  label,
  value,
  strong = false,
  className,
}: MoneyInfoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#eee3d5] bg-[#fbf6ed] p-5",
        className,
      )}
    >
      <p className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-xl font-bold text-[#8a5724]",
          strong && "font-black text-[#17213a]",
        )}
      >
        {value}
      </p>
    </div>
  );
}
