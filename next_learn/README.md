## Continental Hotel Landing Page

Landing page đặt phòng khách sạn Continental xây dựng bằng Next.js 16 (App Router) với giao diện sang trọng, tối ưu cho cả light mode và dark mode.

### Tính năng chính

- Hero section giới thiệu khách sạn, danh sách ưu đãi và CTA đặt phòng rõ ràng.
- Bộ component dùng chung (Header, Footer, Button, FeatureCard, StatsHighlight...) giúp tái sử dụng xuyên suốt.
- Theme switcher giữa light/dark kèm bảng màu tuỳ biến cho thương hiệu Continental.
- Dịch vụ lấy dữ liệu tài nguyên du lịch kèm fallback nội bộ, dễ thay thế bằng API thực tế.
- Tooling sẵn sàng cho sản xuất: TypeScript, ESLint, Prettier, Jest, Husky, lint-staged.

### Bắt đầu nhanh

```bash
npm install
npm run dev
```

Trang sẽ chạy tại http://localhost:3000. Nếu cần kết nối API thật, tạo file `.env.local` từ `.env.example` và cập nhật URL.

### Script hữu ích

- `npm run dev` – chạy dev server Next.js.
- `npm run build` – build sản phẩm.
- `npm run start` – khởi chạy build production.
- `npm run lint`, `npm run lint:fix` – kiểm tra/ tự sửa lint.
- `npm run test` – chạy unit test với Jest.
- `npm run check` – lint + test trong 1 lệnh.

### Cấu trúc chính

- `src/app` – khai báo layout và trang chủ đặt phòng.
- `src/components/layout` – shell trang với Header, Footer, ThemeToggle.
- `src/components/ui` – các UI primitives tái sử dụng.
- `src/hooks` – hook client chung như `useMediaQuery`.
- `src/lib` – cấu hình env, HTTP client, util `cn`.
- `src/services` – dịch vụ dữ liệu ví dụ (`example-service.ts`).
- `src/store` – Zustand store quản lý theme và trạng thái UI.

### Tài liệu chi tiết

- Tìm hiểu kiến trúc và luồng hoạt động: [docs/kien-truc-base.md](docs/kien-truc-base.md)

### Chất lượng & triển khai

- Husky + lint-staged đảm bảo lint/format trước khi commit.
- Jest + Testing Library sẵn cấu hình trong `src/tests` để bổ sung test UI.
- Đóng gói bằng `npm run build`, deploy lên Vercel hoặc hạ tầng Next.js hỗ trợ.
