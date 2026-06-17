# Hotel Continental

Hotel Continental là hệ thống quản lý khách sạn theo kiến trúc microservices. Dự án gồm website khách hàng, trang quản trị nội bộ và nhiều backend service độc lập phục vụ các nghiệp vụ: phòng, đặt phòng, thanh toán, hóa đơn, voucher, check-in/check-out, dịch vụ phát sinh, chat, AI assistant, phản hồi khách hàng và báo cáo doanh thu.

> Lưu ý: hệ thống hiện dùng JWT do `identity-service` tự phát hành. Keycloak và MongoDB không còn là thành phần bắt buộc của luồng hiện tại.

## Cấu Trúc Dự Án

```text
HotelContinental/
├─ backend/
│  ├─ api-gateway/
│  ├─ identity-service/
│  ├─ room-service/
│  ├─ catalog-service/
│  ├─ booking-service/
│  ├─ billing-service/
│  ├─ promotion-service/
│  ├─ feedback-service/
│  ├─ content-service/
│  ├─ report-service/
│  ├─ chat-service/
│  ├─ ai-assistant-service/
│  ├─ notification-service/
│  ├─ mysql/
│  └─ docker-compose.yml
├─ next_learn/       # Website khách hàng
├─ hotel_admin/      # Trang quản trị
├─ scripts/
└─ README.md
```

## Công Nghệ Chính

### Backend

- Java 21
- Spring Boot
- Spring Cloud Gateway
- Spring Security với JWT nội bộ
- Spring Data JPA
- MySQL
- Redis cho OTP
- Kafka cho notification/event
- OpenFeign cho gọi service nội bộ
- Maven Wrapper

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Ky HTTP client
- Zustand
- React Hook Form + Zod
- Lucide icons
- Jest, ESLint, Prettier

## Backend Services

| Service | Port | Context path | Vai trò |
|---|---:|---|---|
| `api-gateway` | `8888` | `/api/v1` | Cổng vào chung cho frontend |
| `identity-service` | `8080` | `/identity` | Đăng nhập, đăng ký, JWT, người dùng, quyền |
| `room-service` | `8081` | `/room` | Phòng, tòa nhà, tầng, ảnh phòng, tiện nghi theo phòng |
| `notification-service` | `8082` | `/notification` | Gửi thông báo, OTP/event |
| `catalog-service` | `8083` | `/catalog` | Danh mục loại phòng, tiện nghi, dịch vụ |
| `booking-service` | `8084` | `/booking` | Đặt phòng, tình trạng phòng, check-in/check-out |
| `billing-service` | `8085` | `/billing` | Mã thanh toán, PayOS, hóa đơn, dịch vụ phát sinh |
| `promotion-service` | `8086` | `/promotion` | Voucher và áp dụng ưu đãi |
| `feedback-service` | `8087` | `/feedback` | Đánh giá sau lưu trú |
| `content-service` | `8088` | `/content` | Chính sách, nội dung hỗ trợ |
| `report-service` | `8089` | `/report` | Doanh thu và thống kê |
| `chat-service` | `8090` | `/chat` | Chat khách hàng với nhân viên |
| `ai-assistant-service` | `8091` | `/ai` | Chat AI gợi ý phòng/dịch vụ |

API public/private đi qua gateway theo dạng:

```text
http://localhost:8888/api/v1/{context-path}/{endpoint}
```

Ví dụ:

```text
http://localhost:8888/api/v1/room/room/customer
http://localhost:8888/api/v1/billing/payment-requests
http://localhost:8888/api/v1/feedback/feedbacks/room/{roomId}
```

## Luồng Nghiệp Vụ Chính

### Website Khách Hàng

1. Khách xem danh sách phòng và chi tiết phòng.
2. Trang chi tiết phòng tải dữ liệu thật từ database: thông tin phòng, ảnh, tiện nghi và đánh giá public của phòng.
3. Khách chọn ngày nhận/trả phòng, số khách và phòng phù hợp.
4. Khi đặt phòng, hệ thống yêu cầu đăng nhập.
5. Trang thanh toán cho phép nhập thông tin khách, áp dụng voucher và chọn dịch vụ phát sinh.
6. Khi bấm thanh toán, hệ thống tạo booking và payment request.
7. Trang QR PayOS hiển thị mã chuyển khoản, số tiền và nội dung chuyển khoản.
8. Khi PayOS gửi webhook thành công, billing cập nhật thanh toán, booking chuyển sang trạng thái đã thanh toán/đã đặt cọc theo logic hiện tại.
9. Hóa đơn được hiển thị trong lịch sử hóa đơn của khách.
10. Sau khi checkout, khách có thể gửi feedback một lần cho kỳ nghỉ đó.

### Trang Quản Trị

1. Admin hoặc staff đăng nhập vào `hotel_admin`.
2. Admin quản lý phòng, loại phòng, tiện nghi, dịch vụ, voucher, chính sách, nhân viên và quyền.
3. Staff xử lý nghiệp vụ lễ tân: xem booking, check-in, checkout, nhập thông tin cư trú, xử lý dịch vụ phát sinh và chat với khách.
4. Admin xem dashboard doanh thu, thống kê và báo cáo.

### Check-in Và Residence Registration

Check-in không chỉ là đổi trạng thái booking. Đây là bước lễ tân kiểm tra thông tin đặt phòng và nhập dữ liệu cư trú của khách vào bảng `residence_registration`, ví dụ thông tin giấy tờ tùy thân/căn cước và thông tin lưu trú. Sau khi lưu đăng ký cư trú thành công, booking detail được chuyển sang trạng thái đang ở.

### Dịch Vụ Theo Phòng Và Dịch Vụ Phát Sinh

Hệ thống tách hai loại dịch vụ:

- Dịch vụ gắn theo loại phòng: là dịch vụ có sẵn đi kèm phòng, không cộng thêm vào tổng bill.
- Dịch vụ phát sinh: là dịch vụ khách gọi thêm trong quá trình lưu trú, được lưu vào `service_order_details` và cộng vào tổng hóa đơn.

## Auth Và Phân Quyền

`identity-service` tự phát hành JWT bằng HMAC. Các service khác đọc JWT và lấy quyền từ claim `scope`.

Phân quyền đang đi theo chức năng/hành động, không chỉ dựa vào role. Danh sách quyền mặc định được khai báo trong:

```text
backend/identity-service/src/main/resources/application.yaml
```

Các nhóm quyền chính:

- `authorization.admin-permission`
- `authorization.staff-permission`
- `authorization.customer-permission`

Khi thêm chức năng mới, cần thêm permission tương ứng vào file YAML này, sau đó gắn `@PreAuthorize` ở service method phù hợp.

Ví dụ quyền:

```text
BOOKING_CHECKIN
BOOKING_CHECKOUT
REVENUE_VIEW
SERVICE_ORDER_CREATE
CHAT_STAFF_VIEW
AI_CHAT
```

## APIResponse Chuẩn

Các controller nên trả về cùng một cấu trúc:

```json
{
  "code": 1000,
  "message": "OK",
  "result": {}
}
```

Khi thêm lỗi mới, nên khai báo trong enum `ErrorCode` của service tương ứng để frontend có thể xử lý thống nhất.

## Chạy Local Thủ Công

### Yêu Cầu

- JDK 21
- Node.js 20+
- MySQL 8
- Redis
- Kafka/Zookeeper nếu chạy đầy đủ notification flow
- Maven Wrapper dùng sẵn trong từng service

### Thứ Tự Khởi Động Gợi Ý

1. MySQL, Redis, Kafka/Zookeeper.
2. `identity-service`.
3. Các service nghiệp vụ: `room-service`, `catalog-service`, `booking-service`, `billing-service`, `promotion-service`, `feedback-service`, `content-service`, `report-service`, `chat-service`, `ai-assistant-service`.
4. `api-gateway`.
5. Frontend khách hàng và admin.

Ví dụ chạy một backend service:

```powershell
cd D:\hoctap\HotelContinental\backend\identity-service
.\mvnw.cmd spring-boot:run
```

Gateway:

```powershell
cd D:\hoctap\HotelContinental\backend\api-gateway
.\mvnw.cmd spring-boot:run
```

Nếu muốn chạy nhanh nhiều service local, có thể xem script hỗ trợ:

```text
D:\hoctap\HotelContinental\scripts\dev-start-all.ps1
```

## Chạy Frontend

### Website Khách Hàng

Tạo file:

```text
next_learn/.env.local
```

Nội dung khuyến nghị:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8888/api/v1
```

Chạy:

```powershell
cd D:\hoctap\HotelContinental\next_learn
npm install
npm run dev
```

Mặc định chạy tại:

```text
http://localhost:3000
```

### Trang Quản Trị

Tạo file:

```text
hotel_admin/.env.local
```

Nội dung khuyến nghị:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8888/api/v1
```

Chạy:

```powershell
cd D:\hoctap\HotelContinental\hotel_admin
npm install
npm run dev
```

Mặc định chạy tại:

```text
http://localhost:3001
```

## Chạy Bằng Docker Compose

Docker compose nằm tại:

```text
D:\hoctap\HotelContinental\backend\docker-compose.yml
```

Chạy toàn bộ backend, hạ tầng và frontend:

```powershell
cd D:\hoctap\HotelContinental\backend
docker compose up --build
```

Các URL chính:

```text
Gateway:        http://localhost:8888
Customer web:   http://localhost:3000
Admin web:      http://localhost:3001
```

### Biến Môi Trường PayOS

Không commit secret thật lên Git. Khi chạy local hoặc Docker, cấu hình qua biến môi trường:

```env
PAYOS_ENABLED=true
PAYOS_BASE_URL=https://api-merchant.payos.vn
PAYOS_CLIENT_ID=your-client-id
PAYOS_API_KEY=your-api-key
PAYOS_CHECKSUM_KEY=your-checksum-key
PAYOS_RETURN_URL=http://localhost:3000/payment/success
PAYOS_CANCEL_URL=http://localhost:3000/payment
```

Khi test webhook PayOS ở local, có thể expose gateway hoặc billing service bằng ngrok. Nếu expose gateway port `8888`, webhook thường có dạng:

```text
https://your-ngrok-domain.ngrok-free.dev/api/v1/billing/payment-requests/payos/webhook
```

Nếu expose trực tiếp billing service port `8085`, webhook thường có dạng:

```text
https://your-ngrok-domain.ngrok-free.dev/billing/payment-requests/payos/webhook
```

## Kiểm Tra Chất Lượng

Frontend:

```powershell
cd D:\hoctap\HotelContinental\next_learn
npm run check
```

```powershell
cd D:\hoctap\HotelContinental\hotel_admin
npm run check
```

Backend:

```powershell
cd D:\hoctap\HotelContinental\backend\identity-service
.\mvnw.cmd test
```

Hoặc build nhanh một service:

```powershell
.\mvnw.cmd clean package -DskipTests
```

## Ghi Chú Phát Triển

- API public nên được cấu hình rõ ở gateway/security, ví dụ xem phòng, catalog public, chính sách public và đánh giá theo phòng public.
- API tạo booking, thanh toán, lịch sử hóa đơn, chat cá nhân, feedback sau checkout cần token.
- Khi thêm chức năng admin/staff mới, thêm permission vào `identity-service` YAML trước, rồi gắn kiểm tra quyền ở service.
- Tránh hiển thị ID kỹ thuật trên giao diện khi có thể hiển thị tên khách, tên phòng, mã booking rút gọn hoặc trạng thái đã Việt hóa.
- Các trang khách hàng cần responsive cho mobile vì khách có thể đặt phòng bằng điện thoại.
- Dữ liệu mẫu cứng chỉ nên dùng cho fallback hiển thị; luồng chính nên lấy từ database qua API.

## Một Số Lỗi Thường Gặp

### Port đã được sử dụng

Nếu service báo port đang bận, kiểm tra PID:

```powershell
netstat -ano | findstr :8888
```

Sau đó tắt tiến trình hoặc đổi port.

### PayOS webhook 401/404

- Nếu expose gateway, URL phải có `/api/v1/billing/...`.
- Nếu expose billing service trực tiếp, URL phải có `/billing/...`.
- Kiểm tra service đã restart sau khi sửa security config.
- GET webhook chỉ dùng kiểm tra readiness; POST thật từ PayOS phải được permit public và verify bằng checksum.

### Frontend báo lỗi font tiếng Việt

Thường do file bị lưu sai encoding hoặc text bị mojibake khi sửa. Nên lưu file TypeScript/TSX/Markdown bằng UTF-8.

### Hóa đơn chưa hiển thị

Kiểm tra `payment_requests` đã chuyển `PAID` chưa, `payment_history` đã được tạo chưa và API lịch sử hóa đơn có lọc theo đúng user đang đăng nhập không.

## Trạng Thái Dự Án

Dự án đã có các luồng cốt lõi để vận hành demo khách sạn:

- Khách xem phòng, đặt phòng và thanh toán PayOS.
- Admin/staff quản lý phòng, booking, check-in/check-out.
- Hóa đơn, voucher, dịch vụ phát sinh, feedback, chat và AI assistant đã có nền tảng.
- Dashboard doanh thu và báo cáo đã được tách service riêng.

Các phần nên tiếp tục hoàn thiện:

- Tăng test tự động cho booking, billing, PayOS webhook và phân quyền.
- Bổ sung audit log cho các thao tác admin/staff quan trọng.
- Hoàn thiện xử lý hết hạn payment request và đồng bộ trạng thái booking.
- Tối ưu truy vấn dashboard và danh sách lớn.
- Kiểm tra responsive toàn bộ website khách hàng và admin dashboard.
