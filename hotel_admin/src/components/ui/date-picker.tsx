"use client";

import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type DatePickerProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
  className?: string;
  buttonClassName?: string;
  calendarClassName?: string;
};

type DateTimePickerProps = Omit<DatePickerProps, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

const monthLabels = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const weekdayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  const date = parseDateValue(value);
  if (!date) return "";

  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}/${date.getFullYear()}`;
}

function isOutsideRange(value: string, min?: string, max?: string) {
  if (min && value < min) return true;
  if (max && value > max) return true;
  return false;
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  disabled = false,
  required = false,
  min,
  max,
  className,
  buttonClassName,
  calendarClassName,
}: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedDate = useMemo(() => parseDateValue(value), [value]);
  const todayValue = toDateValue(new Date());
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const baseDate = selectedDate ?? parseDateValue(min || "") ?? new Date();
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  });

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

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

  const days = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const firstGridDay = new Date(year, month, 1 - startOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(firstGridDay);
      date.setDate(firstGridDay.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  function moveMonth(offset: number) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function selectDate(date: Date) {
    const nextValue = toDateValue(date);
    if (isOutsideRange(nextValue, min, max)) return;

    onChange(nextValue);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative space-y-2", className)}>
      {label ? (
        <label className="text-xs font-bold tracking-[0.16em] text-[#75695d] uppercase">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </label>
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
        <span className={cn(value ? "" : "text-[#9f8a77]")}>
          {formatDisplayDate(value) || placeholder}
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-[#9b5c24]" />
      </button>

      {open && !disabled ? (
        <div
          className={cn(
            "absolute z-50 mt-2 w-[19rem] rounded-2xl border border-[#decdb9] bg-white p-3 shadow-[0_24px_60px_-28px_rgba(64,38,12,0.55)]",
            calendarClassName,
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#7c6f63] transition hover:bg-[#fbf6ed] hover:text-[#9b5c24]"
              aria-label="Tháng trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm font-bold text-[#17213a]">
              {monthLabels[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#7c6f63] transition hover:bg-[#fbf6ed] hover:text-[#9b5c24]"
              aria-label="Tháng sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#9b5c24]">
            {weekdayLabels.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((date) => {
              const dateValue = toDateValue(date);
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isSelected = dateValue === value;
              const isToday = dateValue === todayValue;
              const unavailable = isOutsideRange(dateValue, min, max);

              return (
                <button
                  key={dateValue}
                  type="button"
                  disabled={unavailable}
                  onClick={() => selectDate(date)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-xl text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-30",
                    isSelected
                      ? "bg-[#9b5c24] text-white shadow-sm"
                      : "text-[#17213a] hover:bg-[#fbf6ed]",
                    !isCurrentMonth && !isSelected ? "text-[#b8aa9c]" : "",
                    isToday && !isSelected ? "ring-1 ring-[#c8792a]" : "",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[#eadccb] pt-3">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-xs font-bold text-[#7c6f63] transition hover:bg-[#fbf6ed] hover:text-[#9b5c24]"
            >
              <X className="h-3.5 w-3.5" />
              Xóa
            </button>
            <button
              type="button"
              disabled={isOutsideRange(todayValue, min, max)}
              onClick={() => {
                onChange(todayValue);
                setVisibleMonth(new Date());
                setOpen(false);
              }}
              className="h-9 rounded-full bg-[#fff6df] px-3 text-xs font-bold text-[#8a5724] transition hover:bg-[#f6e7bc] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Hôm nay
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DateTimePicker({
  value,
  onChange,
  disabled,
  required,
  ...props
}: DateTimePickerProps) {
  const [dateValue = "", timeValue = ""] = value.split("T");
  const dateLabel = props.label ?? "Ngày";

  function updateDate(nextDate: string) {
    onChange(nextDate ? `${nextDate}T${timeValue || "00:00"}` : "");
  }

  function updateTime(nextTime: string) {
    onChange(dateValue ? `${dateValue}T${nextTime}` : "");
  }

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_8rem]">
      <DatePicker
        {...props}
        label={dateLabel}
        value={dateValue}
        onChange={updateDate}
        disabled={disabled}
        required={required}
      />
      <label className="space-y-2">
        <span className="block text-xs font-bold tracking-[0.16em] text-[#75695d] uppercase">
          Giờ
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </span>
        <input
          type="time"
          value={timeValue}
          onChange={(event) => updateTime(event.target.value)}
          disabled={disabled || !dateValue}
          required={required}
          className="h-11 w-full rounded-xl border border-[#decdb9] bg-white px-3 text-sm font-semibold text-[#17213a] shadow-sm transition outline-none hover:border-[#c8792a] focus-visible:border-[#c8792a] focus-visible:ring-2 focus-visible:ring-[#c8792a]/20 disabled:cursor-not-allowed disabled:bg-[#f2eadf] disabled:text-[#9f8a77]"
        />
      </label>
    </div>
  );
}
