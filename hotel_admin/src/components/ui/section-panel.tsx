"use client";

import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionPanelProps = {
  title: string;
  eyebrow?: string;
  icon?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionPanel({
  title,
  eyebrow,
  icon,
  right,
  children,
  className,
}: SectionPanelProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm",
        className,
      )}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon ? (
            <div className="rounded-2xl bg-[#fbf6ed] p-3 text-[#9b5c24]">{icon}</div>
          ) : null}
          <div>
            {eyebrow ? (
              <p className="text-xs font-black tracking-[0.22em] text-[#9b5c24] uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-xl font-black text-[#17213a]">{title}</h2>
          </div>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}
