import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const inputType = type === "number" ? "text" : type;

    return (
      <input
        type={inputType}
        inputMode={type === "number" ? "decimal" : props.inputMode}
        className={cn(
          "border-border ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-950 dark:placeholder:text-gray-500",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
