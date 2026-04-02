import React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({ label, error, options, ...props }) => (
  <div className="space-y-2">
    {label && <label className="text-sm font-medium text-foreground">{label}</label>}
    <select
      className="bg-background text-foreground border-border w-full rounded-md border px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/45"
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <span className="text-sm text-red-500">{error}</span>}
  </div>
);
