"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useIsClient } from "@/hooks/use-is-client";
import { useTheme } from "@/providers/theme-provider";

// Dùng chung kích thước icon để giữ giao diện đồng nhất.
const ICON_SIZE = 16;

/*
Hướng dẫn custom ThemeToggle

- Dùng variant/size của Button để đổi phong cách, kích thước.
- Thay icon: đổi <Sun/>/<Moon/> hoặc truyền icon khác theo resolvedTheme.
- Thêm tooltip/a11y: thêm title hoặc aria-describedby vào Button.
- className: thêm/bớt lớp Tailwind để đổi hover, gap, màu chữ...

Lưu ý: Nút chỉ hoạt động sau khi client hydrate (isClient). Việc đổi màu toàn app
được áp qua CSS (data-theme) trong ThemeProvider, nên bạn không cần đổi class
thủ công ở đây.
*/

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isClient = useIsClient();

  // Chỉ cho phép toggle sau khi client hydrate xong để tránh lỗi.
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 text-sm font-medium"
      disabled={!isClient}
    >
      {isClient && resolvedTheme === "dark" ? (
        <Moon size={ICON_SIZE} />
      ) : (
        <Sun size={ICON_SIZE} />
      )}
      <span className="sr-only md:not-sr-only">Theme</span>
    </Button>
  );
}
