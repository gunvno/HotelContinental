import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Ghép className theo quy tắc Tailwind để tránh trùng lặp.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
