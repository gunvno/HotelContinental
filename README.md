# 🏨 Hotel Continental

Hệ thống quản lý khách sạn **Hotel Continental** được xây dựng theo kiến trúc **Microservices**, bao gồm backend Spring Boot và frontend Next.js.

## 📐 Kiến trúc tổng quan

```
HotelContinental/
├── backend/                  # Microservices (Spring Boot + Java 21)
│   ├── api-gateway           # API Gateway
│   ├── identity-service      # Xác thực & phân quyền (Keycloak)
│   ├── room-service          # Quản lý phòng & tòa nhà
│   ├── booking-service       # Đặt phòng
│   ├── billing-service       # Thanh toán & hóa đơn
│   ├── catalog-service       # Danh mục dịch vụ
│   ├── content-service       # Nội dung
│   ├── feedback-service      # Đánh giá & phản hồi
│   ├── notification-service  # Thông báo
│   ├── profile-service       # Hồ sơ người dùng
│   ├── promotion-service     # Khuyến mãi
│   └── report-service        # Báo cáo & thống kê
├── hotel_admin/              # Admin Dashboard (Next.js 16)
└── next_learn/               # Client Website (Next.js 16)
```

## 🛠️ Công nghệ sử dụng

### Backend
| Công nghệ | Phiên bản |
|---|---|
| Java | 21 |
| Spring Boot | 3.4.2 |
| Spring Cloud | 2024.0.0 |
| Spring Security + OAuth2 | Resource Server |
| Spring Data JPA | — |
| MySQL | — |
| Keycloak | IDP |
| OpenFeign | Inter-service communication |
| Lombok | — |
| Maven | Build tool |

### Frontend
| Công nghệ | Phiên bản |
|---|---|
| Next.js | 16.0.10 |
| React | 19.2.1 |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| Zustand | 5.x (State management) |
| React Hook Form + Zod | Form & validation |
| Ky | HTTP client |
| Keycloak JS | Authentication |
| Jest | Testing |
| ESLint + Prettier + Husky | Code quality |

## 🚀 Bắt đầu

### Yêu cầu
- **Java** 21+
- **Maven** 3.9+
- **Node.js** 20+
- **MySQL** 8.0+
- **Keycloak** (chạy trên port `8180`)

### Chạy Backend

```bash
# Di chuyển vào thư mục service cần chạy
cd backend/room-service

# Build & chạy
mvn spring-boot:run
```

> ⚠️ Cần cấu hình database MySQL và Keycloak trước khi chạy. Xem file `application.yaml` trong mỗi service.

### Chạy Frontend

```bash
# Admin Dashboard (port 3001)
cd hotel_admin
npm install
npm run dev

# Client Website (port 3000)
cd next_learn
npm install
npm run dev
```

## 📌 Cổng mặc định

| Service | Port |
|---|---|
| API Gateway | `8080` |
| Room Service | `8081` |
| Keycloak | `8180` |
| Admin Dashboard | `3001` |
| Client Website | `3000` |

## 📄 License

Dự án phục vụ mục đích học tập.
