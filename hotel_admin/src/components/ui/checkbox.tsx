import React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, error, ...props }) => (
  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      className="form-checkbox text-primary border-border focus:ring-ring/45 h-4 w-4 rounded focus:ring-2"
      {...props}
    />
    {label && <label className="text-foreground text-sm">{label}</label>}
    {error && <span className="ml-2 text-sm text-red-500">{error}</span>}
  </div>
);
