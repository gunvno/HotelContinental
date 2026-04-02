import Link from "next/link";

import { Container } from "@/components/ui/container";

/*
Hướng dẫn custom Footer

- footerLinks: chỉnh sửa danh sách liên kết (label, href), thêm target, rel.
- Bố cục: đổi flex/grid và khoảng cách trong Container để phù hợp thiết kế.
- Màu nền/viền: thay lớp trên <footer> (bg-*, border-*, text-*...).
- Typography: đổi lớp text trong khối thông tin hoặc link.
- ...rest: nếu cần props thêm, mở rộng qua className/props mới.
*/

const footerLinks = [
  {
    label: "Ưu đãi mùa lễ hội",
    href: "https://www.booking.com",
  },
  {
    label: "Spa & Wellness",
    href: "https://www.marriott.com/spa",
  },
  {
    label: "Hướng dẫn di chuyển",
    href: "https://maps.app.goo.gl/",
  },
];

// Footer tạo khối thông tin ngắn gọn ở cuối trang.
export function Footer() {
  return (
    <footer className="border-border/60 bg-muted/20 border-t text-sm">
      <Container className="flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
        <div className="text-muted-foreground space-y-1">
          <p>
            Continental Hotel © {new Date().getFullYear()} — Nơi nghỉ dưỡng thanh lịch
            giữa lòng thành phố.
          </p>
          <p className="text-xs tracking-wide uppercase">
            52 Đại Lộ Hòa Bình, Quận Biển Xanh · +84 236 1234 888 ·
            reservations@continental.com
          </p>
        </div>
        <nav className="text-muted-foreground flex flex-wrap items-center gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
