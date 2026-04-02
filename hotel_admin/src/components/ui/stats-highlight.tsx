import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/*
Hướng dẫn custom StatsHighlight

- items: mảng { label, value } để hiển thị các chỉ số.
- className: thêm lớp Tailwind để đổi nền, viền, khoảng cách, grid...
  Ví dụ:
    - 4 cột trên desktop: className="sm:grid-cols-2 lg:grid-cols-4"
    - Hover mạnh hơn:      className="hover:shadow-2xl"
    - Nền tối nhẹ:         className="bg-background/80"
- ...rest: các HTML attributes (id, role, aria-*, data-*...).

Tùy biến mỗi card bên trong:
- Điều chỉnh typography qua các lớp trong <p> (value/label) hoặc override từ className cha.
- Thay hiệu ứng hover bằng lớp ở div con (hover:-translate-y-1, hover:shadow-lg...).
*/

// Stat mô tả một chỉ số có ý nghĩa trên giao diện.
export type Stat = {
  label: string;
  value: string;
};

export type StatsHighlightProps = HTMLAttributes<HTMLDivElement> & {
  items: Stat[];
};

export function StatsHighlight({ items, className, ...rest }: StatsHighlightProps) {
  return (
    <div
      className={cn(
        "border-border/40 from-background/97 via-background/92 to-background/70 grid gap-4 rounded-3xl border bg-gradient-to-br p-6 shadow-[0_18px_50px_-30px_rgba(196,122,52,0.55)] sm:grid-cols-3",
        className,
      )}
      {...rest}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="border-border/40 bg-background/85 rounded-2xl border p-4 text-center shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg sm:text-left"
        >
          <p className="text-foreground text-3xl font-semibold">{item.value}</p>
          <p className="text-muted-foreground mt-1 text-sm">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
