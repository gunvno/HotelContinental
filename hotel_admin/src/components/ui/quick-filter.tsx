"use client";

import { Filter } from "lucide-react";

import { cn } from "@/lib/utils";

export type QuickFilterOption<TValue extends string> = {
  value: TValue;
  label: string;
  desc?: string;
};

type QuickFilterProps<TValue extends string> = {
  title?: string;
  value: TValue;
  options: QuickFilterOption<TValue>[];
  onChange: (value: TValue) => void;
  columnsClassName?: string;
  className?: string;
};

export function QuickFilter<TValue extends string>({
  title = "Bộ lọc nhanh",
  value,
  options,
  onChange,
  columnsClassName = "sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7",
  className,
}: QuickFilterProps<TValue>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-[#17213a]">
        <Filter className="h-4 w-4" /> {title}
      </div>
      <div className={cn("mt-4 grid gap-3 text-sm", columnsClassName)}>
        {options.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "rounded-xl border px-3 py-2 text-left transition-colors",
              value === item.value
                ? "border-[#9b5c24] bg-[#fff6df] text-[#8a5724]"
                : "border-[#decdb9] bg-[#fbf6ed] text-[#5f5144] hover:bg-[#f4eadc]",
            )}
          >
            <div className="font-semibold">{item.label}</div>
            {item.desc ? <div className="text-xs opacity-70">{item.desc}</div> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
