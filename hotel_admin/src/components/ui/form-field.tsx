"use client";

import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  useCallback,
} from "react";

import { cn } from "@/lib/utils";

import { Input, type InputProps } from "./input";
import { Label } from "./label";

type TextFieldProps = Omit<InputProps, "onChange"> & {
  label?: string;
  hint?: string;
  onChange?: InputProps["onChange"];
  onValueChange?: (value: string) => void;
  labelClassName?: string;
  wrapperClassName?: string;
};

export function TextField({
  label,
  hint,
  onChange,
  onValueChange,
  className,
  labelClassName,
  wrapperClassName,
  ...props
}: TextFieldProps) {
  const handleChange = useCallback<NonNullable<InputHTMLAttributes<HTMLInputElement>["onChange"]>>(
    (event) => {
      onChange?.(event);
      onValueChange?.(event.target.value);
    },
    [onChange, onValueChange],
  );

  return (
    <label className={cn("block", wrapperClassName)}>
      {label ? (
        <Label
          className={cn(
            "text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase",
            labelClassName,
          )}
        >
          {label}
        </Label>
      ) : null}
      <Input className={cn(label ? "mt-2" : undefined, className)} onChange={handleChange} {...props} />
      {hint ? <p className="mt-1 text-sm text-[#7c6f63]">{hint}</p> : null}
    </label>
  );
}

type TextareaFieldProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange"
> & {
  label?: string;
  hint?: string;
  onChange?: TextareaHTMLAttributes<HTMLTextAreaElement>["onChange"];
  onValueChange?: (value: string) => void;
  labelClassName?: string;
  wrapperClassName?: string;
};

export function TextareaField({
  label,
  hint,
  onChange,
  onValueChange,
  className,
  labelClassName,
  wrapperClassName,
  rows = 3,
  ...props
}: TextareaFieldProps) {
  const handleChange = useCallback<NonNullable<TextareaHTMLAttributes<HTMLTextAreaElement>["onChange"]>>(
    (event) => {
      onChange?.(event);
      onValueChange?.(event.target.value);
    },
    [onChange, onValueChange],
  );

  return (
    <label className={cn("block", wrapperClassName)}>
      {label ? (
        <Label
          className={cn(
            "text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase",
            labelClassName,
          )}
        >
          {label}
        </Label>
      ) : null}
      <textarea
        className={cn(
          "mt-2 w-full resize-none rounded-xl border border-[#decdb9] bg-white px-3 py-2 text-sm text-[#17213a] outline-none focus:border-[#9b5c24] focus:ring-2 focus:ring-[#9b5c24]/15 disabled:cursor-not-allowed disabled:opacity-50",
          !label && "mt-0",
          className,
        )}
        onChange={handleChange}
        rows={rows}
        {...props}
      />
      {hint ? <p className="mt-1 text-sm text-[#7c6f63]">{hint}</p> : null}
    </label>
  );
}
