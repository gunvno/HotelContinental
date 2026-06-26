# Chạy backend Hotel Continental bằng Docker

Compose ở thư mục gốc chỉ chạy backend + hạ tầng. Frontend bạn chạy local riêng.

## Chuẩn bị MySQL local

Đảm bảo MySQL trên máy đang chạy ở `localhost:3306`, user `root` dùng password trong `.env`.

Tạo database lần đầu bằng file:

```powershell
mysql -uroot -p < backend/mysql/init.sql
```

Nếu máy không có lệnh `mysql` trong PATH, mở MySQL Workbench rồi chạy nội dung file [init.sql](D:/hoctap/HotelContinental/backend/mysql/init.sql).

## Chạy backend

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Nếu lần đầu build bị lỗi Maven tải dependency giữa chừng, chạy lại lệnh trên là được. Có thể build tuần tự để nhẹ mạng hơn:

```powershell
$env:COMPOSE_PARALLEL_LIMIT=1
docker compose up --build
```

Địa chỉ chính:

- API gateway: http://localhost:8888/api/v1
- MySQL local: localhost:3306
- Redis container: localhost:6379

## Chạy frontend local

Admin:

```powershell
cd hotel_admin
npm run dev
```

Web khách:

```powershell
cd next_learn
npm run dev
```

Frontend cần trỏ API về:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8888/api/v1
```

## Chạy nền backend

```powershell
docker compose up --build -d
```

## Xem log

```powershell
docker compose logs -f api-gateway
docker compose logs -f identity-service
docker compose logs -f room-service
```

## Dừng backend

```powershell
docker compose down
```

## Reset dữ liệu local

Vì MySQL nằm trên máy, `docker compose down -v` không xóa database MySQL của bạn. Muốn reset, drop các database hotel trong MySQL rồi chạy lại `backend/mysql/init.sql`.

## Ghi chú cấu hình

- Container backend kết nối MySQL host qua `MYSQL_HOST=host.docker.internal`.
- Kafka chỉ mở trong Docker network với địa chỉ `kafka:29092`.
- Nếu đổi password/port MySQL local, sửa `.env`.
