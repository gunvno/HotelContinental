"use client";

import { TrendingUp } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type MetricCardProps = {
  label?: string;
  title?: string;
  value: string | number;
  detail?: string;
  sub?: string;
  icon: ReactNode;
  tone?: string;
  className?: string;
};

export function MetricCard({
  label,
  title,
  value,
  detail,
  sub,
  icon,
  tone = "bg-[#9b5c24]",
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#decdb9] bg-white/82 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-[#3a2e24] dark:bg-white/[0.05]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#75695d] dark:text-[#b7a99a]">
            {label ?? title}
          </p>
          <p className="mt-3 text-3xl font-black tracking-tight text-[#17213a] dark:text-white">
            {value}
          </p>
        </div>
        <div className={cn("rounded-2xl p-3 text-white shadow-sm", tone)}>{icon}</div>
      </div>
      {detail ? (
        <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#5f7f24] dark:text-[#a8d86b]">
          <TrendingUp className="h-3.5 w-3.5" />
          {detail}
        </p>
      ) : null}
      {!detail && sub ? (
        <p className="mt-4 text-xs font-semibold text-[#75695d] dark:text-[#b7a99a]">
          {sub}
        </p>
      ) : null}
    </div>
  );
}
