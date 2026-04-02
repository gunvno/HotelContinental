import React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, error, ...props }) => (
  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      className="form-checkbox h-4 w-4 text-primary border-border rounded focus:ring-2 focus:ring-ring/45"
      {...props}
    />
    {label && <label className="text-sm text-foreground">{label}</label>}
    {error && <span className="text-sm text-red-500 ml-2">{error}</span>}
  </div>
);
