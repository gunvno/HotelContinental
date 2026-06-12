# Hotel Continental Backend Deployment

Tài liệu này mô tả cách chạy toàn bộ backend bằng Docker Compose sau khi loại bỏ Keycloak/MongoDB khỏi cấu hình runtime.

## 1. Yêu cầu

- Docker Desktop hoặc Docker Engine + Docker Compose v2.
- Khi deploy thật, chỉ cần expose các port public:
  - `3000`: website khách
  - `3001`: admin web
  - `8888`: API Gateway
- MySQL, Redis, Kafka, Zookeeper và các service con chỉ chạy trong Docker network, không publish ra host.
- Nếu dùng Nginx/Caddy ở phía trước, bạn có thể chỉ expose `80/443` ở reverse proxy và không cần public trực tiếp `3000/3001/8888`.

## 2. Kiến trúc container

`docker-compose.yml` chạy:

- `mysql`: một MySQL dùng chung, mỗi service dùng một database riêng.
- `redis`: OTP/cache cho identity-service.
- `zookeeper` + `kafka`: event đăng ký OTP/email.
- `web`: frontend khách hàng Next.js.
- `admin-web`: frontend quản trị Next.js.
- 12 service backend:
  - `api-gateway`
  - `identity-service`
  - `room-service`
  - `notification-service`
  - `catalog-service`
  - `booking-service`
  - `billing-service`
  - `promotion-service`
  - `feedback-service`
  - `content-service`
  - `report-service`
  - `chat-service`

## 3. Chạy local

Từ thư mục `backend`:

```powershell
docker compose up --build
```

Mặc định frontend build với:

```env
PUBLIC_API_BASE_URL=http://localhost:8888/api/v1
```

Trên máy local, browser truy cập `localhost:3000` hoặc `localhost:3001`, nên URL API `localhost:8888` là đúng.

Chạy nền:

```powershell
docker compose up --build -d
```

Xem log:

```powershell
docker compose logs -f api-gateway
docker compose logs -f identity-service
```

Dừng hệ thống:

```powershell
docker compose down
```

Dừng và xóa volume MySQL:

```powershell
docker compose down -v
```

## 4. Kiểm tra health

Sau khi các container lên xong:

```powershell
curl http://localhost:8888/api/v1/identity/health
curl http://localhost:8888/api/v1/room/health
curl http://localhost:8888/api/v1/catalog/health
curl http://localhost:8888/api/v1/booking/health
curl http://localhost:8888/api/v1/billing/health
curl http://localhost:8888/api/v1/chat/health
```

Trên compose deploy mặc định, service con không publish port ra host. Nếu cần debug trực tiếp một service, dùng:

```powershell
docker compose exec identity-service wget -qO- http://localhost:8080/identity/health
docker compose exec billing-service wget -qO- http://localhost:8085/billing/health
```

## 5. Frontend local

Frontend trỏ API qua gateway:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8888/api/v1
```

Keycloak env đã bị xóa vì hệ thống đang dùng JWT do `identity-service` tự phát hành.

## 6. Deploy VPS/Cloud

1. Cài Docker Engine và Docker Compose plugin.
2. Copy thư mục `backend` lên server.
3. Copy cả `next_learn` và `hotel_admin` lên cùng cấp với `backend`, vì compose build frontend từ `../next_learn` và `../hotel_admin`.
4. Tạo file `backend/.env` production. Ví dụ:

```env
MYSQL_ROOT_PASSWORD=change_me
GATEWAY_PORT=8888
WEB_PORT=3000
ADMIN_WEB_PORT=3001
PUBLIC_API_BASE_URL=https://api.your-domain.com/api/v1
```

`PUBLIC_API_BASE_URL` là URL mà trình duyệt người dùng truy cập được. Không dùng `localhost` trên VPS public, vì `localhost` lúc đó là máy người dùng.

5. Chỉnh thêm JWT signer key, mail credentials trong cấu hình production nếu cần.
6. Chạy:

```bash
docker compose up --build -d
```

7. Đặt reverse proxy Nginx/Caddy:

- `hotel.your-domain.com` -> `web:3000`
- `admin.your-domain.com` -> `admin-web:3001`
- `api.your-domain.com` -> `api-gateway:8888`

Nếu reverse proxy chạy ngoài Docker, trỏ tới host ports `3000`, `3001`, `8888`.

Nếu reverse proxy chạy chung Docker network, có thể bỏ publish `3000/3001/8888` và proxy trực tiếp tới service names.

## 7. Lưu ý vận hành

- Nếu thêm permission mới trong `identity-service/src/main/resources/application.yaml`, restart `identity-service` và đăng nhập lại để token mới có permission.
- Nếu đổi route service, kiểm tra env `*_SERVICE_URI` của `api-gateway`.
- Nếu MySQL init không tạo lại database do volume cũ đã tồn tại, chạy `docker compose down -v` rồi chạy lại.
- Kafka chỉ cần cho luồng notification OTP/email; nếu Kafka chưa sẵn sàng, notification có thể retry sau khi broker lên.
- Next.js frontend đọc `NEXT_PUBLIC_API_BASE_URL` khi build image. Nếu đổi domain API, cần `docker compose build web admin-web` lại.
