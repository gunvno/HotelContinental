import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

/*
Hướng dẫn custom FeatureCard

Ví dụ dùng nhanh:

  <FeatureCard
    title="Hồ bơi vô cực"
    description="View toàn cảnh, mở cửa 6h–22h."
    icon={<YourIcon className="h-5 w-5" />}
    className="hover:-translate-y-2 bg-gradient-to-br from-background to-background/80"
  />

Bạn có thể tùy biến thông qua:
- className: thêm/bớt lớp Tailwind để đổi nền, viền, bóng, hover, spacing...
- icon: truyền bất kỳ ReactNode (icon, số thứ tự, hình nhỏ...) để hiển thị đầu thẻ.
- ...rest: truyền HTML attributes (onClick, id, role, aria-*, data-*, tabIndex...).

Gợi ý biến thể (không đổi API):
- Thẻ phẳng:    className="shadow-none hover:shadow-none"
- Nổi bật hơn:  className="border-ring/50 bg-ring/5 hover:shadow-lg"
- Nền đặc:      className="bg-background"
- Bo góc khác:  className="rounded-xl"
- Padding khác: className="p-4 md:p-6"
*/

// FeatureCard trình bày một điểm nổi bật trong layout.
export type FeatureCardProps = HTMLAttributes<HTMLDivElement> & {
  // Tiêu đề hiển thị nổi bật
  title: string;
  // Mô tả nội dung ngắn gọn dưới tiêu đề
  description: string;
  // Khu vực icon tùy chọn ở phần đầu thẻ (có thể là bất kỳ ReactNode)
  icon?: ReactNode;
};

export function FeatureCard({
  title,
  description,
  icon,
  className,
  ...rest
}: FeatureCardProps) {
  return (
    <div
      // Container chính: có thể override/layer thêm Tailwind qua className
      className={cn(
        "border-border/40 from-background/96 via-background/90 to-background/75 relative flex h-full flex-col gap-5 overflow-hidden rounded-3xl border bg-gradient-to-br p-7 shadow-[0_22px_55px_-32px_rgba(196,122,52,0.55)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl",
        className,
      )}
      // Forward mọi HTML attributes (onClick, role, aria-*, id, data-*, ...)
      {...rest}
    >
      {/* Hiệu ứng highlight mờ phía trên; có thể ẩn bằng "hidden" qua className cha */}
      <span
        className="from-ring/25 pointer-events-none absolute inset-x-10 top-0 h-28 rounded-full bg-gradient-to-br via-transparent to-transparent opacity-70 blur-2xl"
        aria-hidden="true"
      />
      {icon ? (
        // Nền tròn nhẹ cho vùng icon; đổi màu bằng class của icon truyền vào
        <div className="bg-ring/12 text-ring flex h-12 w-12 items-center justify-center rounded-full">
          {icon}
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-3">
        {/* Tiêu đề và mô tả; có thể điều chỉnh typography bằng className cha */}
        <h3 className="text-foreground text-lg font-semibold tracking-tight">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
      {/* Nhãn thương hiệu cuối thẻ; có thể thay/ẩn bằng CSS utility qua className cha */}
      <span className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
        Continental
      </span>
    </div>
  );
}
