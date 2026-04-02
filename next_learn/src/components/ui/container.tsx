import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/*
Hướng dẫn custom Container

- Mục đích: canh giữa nội dung và giới hạn chiều rộng tối đa của trang.
- className: thêm/bớt lớp Tailwind để đổi max-width, padding, background...
  Ví dụ:
    - Toàn màn hình: className="max-w-none"
    - Rộng hơn:       className="max-w-7xl"
    - Padding khác:   className="px-4 sm:px-6 lg:px-8"
- ...rest: truyền các HTML attributes (id, role, aria-*, data-*, onClick...).
*/

// Container giữ layout nội dung nằm trong khung trung tâm.
export type ContainerProps = HTMLAttributes<HTMLDivElement>;

export function Container({ className, ...rest }: ContainerProps) {
  return (
    <div
      // Mặc định: căn giữa, giới hạn max-w, padding responsive
      className={cn("mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-12", className)}
      // Forward mọi HTML attributes (id, role, aria-*, data-*, ...)
      {...rest}
    />
  );
}
