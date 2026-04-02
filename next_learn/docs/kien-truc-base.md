# Continental Hotel – Ghi chú kiến trúc

Tài liệu này mô tả cấu trúc dự án landing page đặt phòng khách sạn Continental và vai trò từng phần.

## Cây thư mục chính trong `src`

- **app**: App Router, `layout.tsx` khai báo metadata Continental và bọc AppProviders; `page.tsx` là trang giới thiệu khách sạn.
- **components/layout**: Header cố định, Footer, ThemeToggle tạo khung chung cho landing.
- **components/ui**: Button, Container, FeatureCard, StatsHighlight tái sử dụng ở nhiều section.
- **hooks**: Hook client như `use-is-client`, `use-media-query` hỗ trợ interaction.
- **lib**: `env`, `http`, `utils` gom các helper trung tâm.
- **providers**: AppProviders, ThemeProvider quản lý theme light/dark.
- **services**: `example-service` mô phỏng API lấy tài nguyên và health check.
- **store**: `ui-store` dùng Zustand lưu trạng thái UI, theme mặc định là light.
- **tests**: `setup-tests` và `theme-provider.test.tsx` là bộ test mẫu.

## Luồng hoạt động tổng quát

1. **RootLayout** bọc ứng dụng bằng AppProviders, chèn Header sticky và Footer để mọi trang đồng nhất.
2. **ThemeProvider** đọc trạng thái theme trong store (mặc định light), kết hợp media query để suy ra theme thực, sau đó gán `data-theme` cho document.
3. **Trang home** (server component) song song gọi `fetchLearningResources` và `fetchHealthStatus` để hiển thị nội dung động.
4. **Tầng services** sử dụng http client dựa trên `ky`, fallback dữ liệu tĩnh khi API lỗi nhằm tránh UI trống.
5. **Tầng UI** cung cấp primitives như Button, FeatureCard, StatsHighlight để xây dựng section mang phong cách khách sạn sang trọng.

## Script làm việc cần nhớ

- `npm run dev`: chạy dev server.
- `npm run lint`, `npm run test`, `npm run check`: kiểm tra chất lượng trước khi commit.
- `npm run build`: build production.

## Thư viện và công cụ chính

- **Next.js 16**: framework React dùng App Router; phát triển bằng `npm run dev`, build bằng `npm run build`.
- **Tailwind CSS 4 + prettier-plugin-tailwindcss**: hệ thống utility cho giao diện, plugin giữ thứ tự class khi chạy `npm run format`.
- **Zustand**: quản lý state nhẹ; xem ví dụ trong `src/store/ui-store.ts`.
- **Ky**: HTTP client cho tầng service; `fetchLearningResources` và `fetchHealthStatus` dùng ky kèm fallback.
- **Zod**: validate biến môi trường trong `src/lib/env.ts` để tránh cấu hình sai.
- **TypeScript**: đảm bảo type, kiểm tra nhanh bằng `npm run type-check`.
- **ESLint**: lint rule theo chuẩn Next + import sort; chạy bằng `npm run lint` hoặc `npm run lint:fix`.
- **Prettier**: định dạng code thống nhất; dùng `npm run format` hoặc `npm run format:check` khi CI.
- **Jest + Testing Library**: kiểm thử component ở `src/tests`; chạy nhanh với `npm run test`.
- **Husky + lint-staged**: hook `pre-commit` tự động chạy `lint-staged` để lint/format file đang staged trước khi commit.

## Nguyên tắc thiết kế

- Tách rõ UI, hook, service, store để dễ bảo trì.
- Biến môi trường được validate bằng Zod, thông báo rõ ràng trong dev nếu thiếu.
- ThemeToggle sử dụng `use-is-client` để tránh hydration mismatch.
- Service luôn có fallback để UI không bị vỡ khi API gặp lỗi.
- Hook chung đặt trong `hooks/` để dùng lại cho nhiều component.

## Hướng đi tiếp

- Khi tạo component mới, ưu tiên tái sử dụng primitives trước khi viết mới.
- Nếu cần chia sẻ state, bổ sung vào `ui-store` hoặc tạo store mới rõ ràng.
- Mỗi API mới nên tạo service riêng, định nghĩa type và xử lý lỗi giống `example-service`.
- Thêm test ở `src/tests` cho các hành vi quan trọng.
