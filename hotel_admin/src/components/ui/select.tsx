"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type SelectOption<TValue extends string = string> = {
  value: TValue;
  label: string;
  disabled?: boolean;
};

export type SelectProps<TValue extends string = string> = {
  label?: string;
  error?: string;
  value: TValue;
  options: SelectOption<TValue>[];
  onValueChange: (value: TValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
};

export function Select<TValue extends string = string>({
  label,
  error,
  value,
  options,
  onValueChange,
  placeholder = "Chọn",
  disabled = false,
  className,
  buttonClassName,
  menuClassName,
}: SelectProps<TValue>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative space-y-2", className)}>
      {label ? (
        <label className="text-foreground text-sm font-medium">{label}</label>
      ) : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-[#decdb9] bg-white px-3 text-left text-sm font-semibold text-[#17213a] shadow-sm transition outline-none hover:border-[#c8792a] focus-visible:border-[#c8792a] focus-visible:ring-2 focus-visible:ring-[#c8792a]/20 disabled:cursor-not-allowed disabled:bg-[#f2eadf] disabled:text-[#9f8a77]",
          buttonClassName,
        )}
      >
        <span className={cn("min-w-0 truncate", selected ? "" : "text-[#9f8a77]")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#9b5c24] transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </button>

      {open && !disabled ? (
        <div
          className={cn(
            "absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-[#decdb9] bg-white p-1.5 shadow-[0_24px_60px_-28px_rgba(64,38,12,0.55)]",
            menuClassName,
          )}
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
                  active
                    ? "bg-[#fff6df] text-[#8a5724]"
                    : "text-[#17213a] hover:bg-[#fbf6ed]",
                )}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {active ? <Check className="h-4 w-4 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {error ? <span className="text-sm text-red-500">{error}</span> : null}
    </div>
  );
}
