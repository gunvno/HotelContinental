# Tài Liệu Bảo Mật Hệ Thống

Tài liệu này mô tả cách cơ chế bảo mật hiện tại của Hotel Continental hoạt động trong backend microservice. Trọng tâm gồm API Gateway, Identity Service, JWT, role/permission, bảo vệ service con, gọi nội bộ giữa service và PayOS webhook.

## Tổng Quan

Hệ thống bảo mật hiện tại có các lớp chính:

1. API Gateway kiểm tra token trước khi route request vào service con.
2. Identity Service quản lý đăng nhập, đăng ký, OTP, phát hành JWT, refresh token, logout, role và permission.
3. Các service con kiểm tra request đã authenticated và dùng `@PreAuthorize` để kiểm quyền chi tiết.
4. Một số luồng service-to-service dùng JWT của người dùng hoặc `X-Internal-Secret`.
5. PayOS webhook là endpoint public nhưng được bảo vệ bằng chữ ký webhook.

Luồng tổng quát:

```text
Frontend
   ↓ Authorization: Bearer <token>
API Gateway
   ↓ gọi identity-service /auth/introspect
Identity Service kiểm token
   ↓ token hợp lệ
Gateway route sang service con
   ↓
Service con đọc JWT, lấy quyền từ claim scope
   ↓
Controller/Service kiểm quyền bằng @PreAuthorize
```

## Bảo Mật Và Giao Tiếp Service Nằm Ở Đâu

Phần bảo mật và giao tiếp giữa các service đang được thể hiện ở các nhóm file sau:

| Nhóm | File chính | Thể hiện điều gì |
| --- | --- | --- |
| Gateway authentication | `backend/api-gateway/src/main/java/com/hotelcontinental/api_gateway/configuration/AuthenticationFilter.java` | Chặn request vào gateway, bỏ qua public endpoint, đọc `Authorization: Bearer <token>`, gọi identity-service `/auth/introspect` để kiểm token. |
| Gateway route service | `backend/api-gateway/src/main/resources/application.yaml` | Khai báo route từ `/api/v1/{service}` đến từng service thật như identity, room, booking, billing, catalog. |
| Gateway security shell | `backend/api-gateway/src/main/java/com/hotelcontinental/api_gateway/configuration/SecurityConfig.java` | Tắt CSRF và cho gateway `permitAll`; bảo mật thực tế nằm trong `AuthenticationFilter`. |
| Identity auth/JWT | `backend/identity-service/src/main/java/com/hotelcontinental/identity_service/service/serviceImpl/AuthenticationServiceImpl.java` | Xử lý login, sinh JWT, verify token, introspect, refresh token, logout và blacklist token. |
| Identity security | `backend/identity-service/src/main/java/com/hotelcontinental/identity_service/configuration/SecurityConfig.java` | Khai báo public auth endpoints, cấu hình resource server, JWT decoder HS512 và BCrypt password encoder. |
| Role/permission seed | `backend/identity-service/src/main/java/com/hotelcontinental/identity_service/configuration/DataInitializer.java` | Tạo role mặc định, account demo và đồng bộ permission theo cấu hình. |
| Permission config | `backend/identity-service/src/main/resources/application.yaml` | Danh sách permission gán cho `ADMIN`, `MANAGER`, `RECEPTIONIST`, `CUSTOMER_SUPPORT`, `HOUSEKEEPING`, `CUSTOMER`. |
| Service security | `backend/*-service/src/main/java/.../configuration/SecurityConfig.java` | Mỗi service con khai báo public endpoint riêng, các request còn lại phải authenticated. |
| JWT authority converter | `backend/*-service/src/main/java/.../configuration/CustomAuthoritiesConverter.java` | Đọc claim `scope` trong JWT và chuyển thành authority để dùng với `@PreAuthorize`. |
| Method authorization | Các class service có `@PreAuthorize` | Kiểm quyền chi tiết theo role/permission, ví dụ `BOOKING_VIEW`, `ROLE_RECEPTIONIST`, `SERVICE_ORDER_VIEW`. |
| Service-to-service client | `backend/billing-service/src/main/java/com/hotelcontinental/billing_service/service/serviceImpl/ExternalServiceClient.java` | Billing gọi booking/catalog/room bằng `RestClient`, có thể forward JWT user hoặc dùng internal secret. |
| Internal endpoint | `backend/booking-service/src/main/java/com/hotelcontinental/booking_service/controller/InternalRoomBookingController.java` | Booking nhận request nội bộ từ billing qua `X-Internal-Secret`. |
| Internal secret config | `backend/booking-service/src/main/resources/application.yaml`, `backend/billing-service/src/main/resources/application.yaml` | Cấu hình `app.internal-secret` để xác thực các request nội bộ không có JWT user. |
| PayOS webhook filter | `backend/billing-service/src/main/java/com/hotelcontinental/billing_service/configuration/PayosWebhookFilter.java` | Nhận webhook public từ PayOS trước security chain thông thường, parse body và chuyển vào service xử lý. |
| PayOS signature | `backend/billing-service/src/main/java/com/hotelcontinental/billing_service/service/serviceImpl/PayosClient.java` | Ký request PayOS và verify chữ ký webhook bằng `checksumKey`. |

Nhìn theo luồng request, các file trên tương ứng như sau:

```text
Frontend
  ↓
api-gateway/AuthenticationFilter.java
  ↓ introspect token
identity-service/AuthenticationServiceImpl.java
  ↓ nếu token hợp lệ
api-gateway/application.yaml route sang service con
  ↓
*-service/SecurityConfig.java
  ↓
*-service/CustomAuthoritiesConverter.java đọc scope
  ↓
@PreAuthorize trong service nghiệp vụ
```

Nhìn theo luồng service-to-service:

```text
User request có JWT
  ↓
Billing service
  ↓ forward Authorization header
ExternalServiceClient.java gọi Booking/Catalog/Room
```

Với luồng không có user JWT, ví dụ PayOS webhook:

```text
PayOS webhook
  ↓
PayosWebhookFilter.java
  ↓ verify signature bằng PayosClient.java
Billing service xử lý thanh toán
  ↓ gọi Booking internal endpoint
ExternalServiceClient.java gửi X-Internal-Secret
  ↓
InternalRoomBookingController.java kiểm secret
```

## API Gateway

Gateway chạy ở port `8888` và route request theo prefix:

```text
/api/v1/{service-context}/...
```

Ví dụ:

```text
/api/v1/identity/auth/token
/api/v1/booking/room-bookings
/api/v1/billing/payment-requests
```

File chính:

- `backend/api-gateway/src/main/java/com/hotelcontinental/api_gateway/configuration/AuthenticationFilter.java`
- `backend/api-gateway/src/main/resources/application.yaml`

Gateway dùng `AuthenticationFilter` để kiểm tra request.

Nếu endpoint là public, gateway cho qua ngay.

Nếu endpoint không public, gateway đọc header:

```http
Authorization: Bearer <token>
```

Sau đó gọi identity-service:

```http
POST /identity/auth/introspect
```

Nếu identity-service trả `valid = true`, request được route sang service con. Nếu token thiếu hoặc không hợp lệ, gateway trả:

```json
{
  "code": 1401,
  "message": "Unauthenticated"
}
```

Lưu ý: `SecurityConfig` của gateway đang `permitAll`; logic bảo vệ thật nằm trong `AuthenticationFilter`.

## Public Endpoint

Một số endpoint được public để khách hoặc hệ thống ngoài gọi được.

Nhóm authentication:

```text
/identity/auth/token
/identity/auth/login
/identity/auth/register
/identity/auth/otp-register
/identity/auth/otp-verify
/identity/auth/introspect
/identity/auth/refresh
/identity/auth/logout
```

Nhóm dữ liệu public cho website khách hàng:

```text
/room/room/customer
/room/room/customer/**
/room/media/download/**
/catalog/roomType
/catalog/service
/catalog/amenity
/booking/availability/busy-room-ids
/feedback/feedbacks/room/**
```

PayOS webhook cũng public:

```text
/billing/payment-requests/payos/**
```

PayOS không gửi JWT người dùng, nên endpoint này phải public ở gateway. Bảo mật của webhook nằm ở chữ ký PayOS.

## Identity Service

Identity Service chịu trách nhiệm:

- đăng ký tài khoản khách hàng;
- đăng nhập;
- gửi và xác thực OTP;
- tạo access token và refresh token;
- introspect token;
- logout;
- quản lý role và permission;
- quản lý lịch sử hoạt động nhân viên.

File chính:

- `backend/identity-service/src/main/java/com/hotelcontinental/identity_service/service/serviceImpl/AuthenticationServiceImpl.java`
- `backend/identity-service/src/main/java/com/hotelcontinental/identity_service/configuration/SecurityConfig.java`
- `backend/identity-service/src/main/resources/application.yaml`

## Đăng Nhập

Khi user đăng nhập, hệ thống:

1. Tìm account theo username hoặc email.
2. Kiểm tra account và user còn active.
3. So sánh password bằng BCrypt.
4. Nếu hợp lệ, tạo access token và refresh token.
5. Ghi nhận lịch sử login cho nhân viên nếu có.

Password dùng:

```java
BCryptPasswordEncoder(10)
```

Điều này nghĩa là password trong database không lưu plaintext mà lưu dạng hash BCrypt.

## JWT

Token được ký bằng thuật toán:

```text
HS512
```

Cấu hình hiện tại:

```yaml
jwt:
  signerKey: ...
  valid-duration: 3600
  refreshable-duration: 36000
```

Ý nghĩa:

- `valid-duration`: thời gian sống của access token, hiện là 3600 giây.
- `refreshable-duration`: thời gian sống của refresh token, hiện là 36000 giây.
- `signerKey`: khóa bí mật dùng để ký JWT.

JWT chứa các claim chính:

| Claim | Ý nghĩa |
| --- | --- |
| `sub` | ID người dùng. |
| `iss` | Nguồn phát token, hiện là `hotelcontinental.identity`. |
| `iat` | Thời điểm phát hành token. |
| `exp` | Thời điểm token hết hạn. |
| `jti` | ID duy nhất của token, dùng khi logout/invalidate. |
| `username` | Username của account. |
| `email` | Email của user. |
| `scope` | Danh sách role và permission. |

Ví dụ claim `scope`:

```text
ROLE_MANAGER ADMIN_PORTAL_ACCESS BOOKING_VIEW SERVICE_ORDER_VIEW
```

## Role Và Permission

Các role chính:

```text
ADMIN
MANAGER
RECEPTIONIST
CUSTOMER_SUPPORT
HOUSEKEEPING
CUSTOMER
```

File seed role/permission:

- `backend/identity-service/src/main/java/com/hotelcontinental/identity_service/configuration/DataInitializer.java`
- `backend/identity-service/src/main/java/com/hotelcontinental/identity_service/configuration/RolePermissionProperties.java`
- `backend/identity-service/src/main/resources/application.yaml`

Khi application start, `DataInitializer` đảm bảo các role tồn tại và đồng bộ permission từ `application.yaml`.

Khi tạo token, hệ thống gom quyền từ:

1. Role của account.
2. Permission thuộc role.
3. Permission gán trực tiếp cho account.

Role được đưa vào `scope` theo dạng:

```text
ROLE_ADMIN
ROLE_MANAGER
ROLE_RECEPTIONIST
```

Permission được đưa vào `scope` theo tên trực tiếp:

```text
BOOKING_VIEW
SERVICE_ORDER_VIEW
PERMISSION_MANAGE
```

## Service Con Kiểm JWT

Mỗi service con có `SecurityConfig` riêng. Pattern chung:

```java
.anyRequest().authenticated()
```

Điều này nghĩa là request không thuộc public endpoint thì phải có JWT.

Service con dùng `CustomAuthoritiesConverter` để đọc claim `scope` từ JWT và chuyển thành authority của Spring Security.

Ví dụ token có:

```text
ROLE_RECEPTIONIST BOOKING_VIEW BOOKING_CHECKIN
```

Spring Security sẽ hiểu user có các authority:

```text
ROLE_RECEPTIONIST
BOOKING_VIEW
BOOKING_CHECKIN
```

## Kiểm Quyền Bằng `@PreAuthorize`

Sau khi request đã authenticated, service kiểm quyền chi tiết bằng `@PreAuthorize`.

Ví dụ:

```java
@PreAuthorize("hasAuthority('BOOKING_VIEW')")
```

Chỉ user có permission `BOOKING_VIEW` được gọi.

Ví dụ khác:

```java
@PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_RECEPTIONIST')")
```

Chỉ manager hoặc receptionist được gọi.

Một số nhóm quyền thường gặp:

| Nhóm | Ví dụ quyền |
| --- | --- |
| Booking | `BOOKING_VIEW`, `BOOKING_CREATE`, `BOOKING_UPDATE`, `BOOKING_CANCEL`, `BOOKING_CHECKIN`, `BOOKING_CHECKOUT` |
| Room | `ROOM_VIEW`, `ROOM_CREATE`, `ROOM_UPDATE`, `ROOM_DELETE`, `ROOM_HOUSEKEEPING_UPDATE` |
| Catalog | `SERVICE_VIEW`, `SERVICE_CREATE`, `ROOM_TYPE_VIEW`, `AMENITY_VIEW` |
| Billing | `PAYMENT_CONFIRM`, `SERVICE_ORDER_VIEW`, `SERVICE_ORDER_CREATE` |
| Admin | `ADMIN_PORTAL_ACCESS`, `PERMISSION_MANAGE`, `GET_ALL_USER` |
| Chat/AI | `CHAT_CUSTOMER_SEND`, `CHAT_STAFF_REPLY`, `AI_CHAT_VIEW`, `AI_CHAT_SEND` |

## CORS Và CSRF

CORS được xử lý ở API Gateway.

Gateway cho phép frontend local:

```yaml
allowedOrigins:
  - "http://localhost:3000"
  - "http://localhost:3001"
```

Các method được phép:

```text
GET, POST, PUT, DELETE, PATCH, OPTIONS
```

Service con tắt CORS để gateway xử lý tập trung.

CSRF cũng bị tắt ở gateway và service con. Điều này phù hợp với API stateless dùng JWT trong header, không dùng session form truyền thống.

## Logout Và Token Invalidation

Khi logout, identity-service:

1. Verify token.
2. Lấy claim `jti`.
3. Lưu `jti` vào bảng `InvalidatedToken`.

Khi gateway introspect token, identity-service kiểm tra:

- token có verify được không;
- token hết hạn chưa;
- `jti` có nằm trong danh sách invalidated token không.

Nếu token đã logout hoặc refresh rồi, introspect trả `valid = false`.

## Refresh Token

Khi refresh token:

1. Identity-service verify refresh token.
2. Invalidate token cũ.
3. Tìm account theo `sub`.
4. Nếu account còn active, tạo access token và refresh token mới.

Luồng này giúp token cũ không bị dùng lại sau khi refresh.

## Service-To-Service Security

Hệ thống có hai kiểu gọi giữa service.

### Forward JWT Người Dùng

Ví dụ billing-service gọi booking-service và truyền tiếp JWT hiện tại:

```java
.header("Authorization", bearerHeader())
```

Luồng:

```text
User gọi billing kèm JWT
Billing xử lý nghiệp vụ
Billing gọi booking kèm chính JWT đó
Booking kiểm quyền dựa trên JWT
```

Cách này giữ được ngữ cảnh người dùng ban đầu.

### Internal Secret

Một số luồng không có JWT người dùng, ví dụ PayOS webhook gọi billing-service. Khi billing cần báo booking đã thanh toán, billing gọi endpoint nội bộ của booking bằng header:

```http
X-Internal-Secret: <secret>
```

Booking-service kiểm header này trong `InternalRoomBookingController`.

Nếu thiếu hoặc sai secret, booking-service trả lỗi unauthorized.

Cấu hình:

```yaml
app:
  internal-secret: ${APP_INTERNAL_SECRET:dev-internal-secret}
```

Production nên dùng secret mạnh và không dùng default `dev-internal-secret`.

## PayOS Webhook Security

PayOS webhook là public endpoint:

```http
POST /billing/payment-requests/payos/webhook
```

Vì PayOS không gửi JWT user, hệ thống bảo vệ webhook bằng chữ ký.

Trong `PayosClient.verifyWebhook`, backend:

1. Lấy `data` từ webhook.
2. Tự ký lại `data` bằng `checksumKey`.
3. So sánh chữ ký tự tính với `signature` PayOS gửi.

Nếu chữ ký không khớp, webhook bị từ chối.

Ngoài chữ ký, billing-service còn kiểm:

- `orderCode` có tồn tại không;
- tìm được `PaymentRequest` không;
- số tiền webhook có khớp payment request không;
- nếu request đã `PAID`, không xử lý trùng.

## Bảo Vệ Theo Chủ Sở Hữu Dữ Liệu

Một số nghiệp vụ không chỉ kiểm quyền mà còn kiểm user có phải chủ dữ liệu không.

Ví dụ billing-service khi lấy payment request theo booking:

- nếu user có `ADMIN_PORTAL_ACCESS`, cho phép truy cập;
- nếu không, chỉ customer sở hữu booking đó được truy cập.

Cơ chế này tránh việc customer đoán ID booking/payment của người khác.

## Rủi Ro Hiện Tại

### Service con parse JWT nhưng chưa verify chữ ký

Một số service con dùng `CustomJwtDecoder` chỉ parse JWT:

```java
SignedJWT signedJWT = SignedJWT.parse(token);
```

Decoder này lấy claim từ token nhưng không tự verify chữ ký HS512.

Nếu request đi qua gateway, gateway đã gọi identity-service introspect nên token được kiểm thật. Tuy nhiên, nếu service con bị expose trực tiếp qua port `808x`, attacker có thể tự tạo token chứa `scope` giả để vượt qua `@PreAuthorize`.

Khuyến nghị:

- Không expose service con ra internet, chỉ expose gateway.
- Hoặc đổi `CustomJwtDecoder` ở service con sang `NimbusJwtDecoder` dùng cùng `jwt.signerKey` để verify chữ ký.

### Service con không biết token đã logout nếu gọi trực tiếp

Token logout bị chặn ở gateway nhờ `/auth/introspect`. Nếu gọi trực tiếp service con, service con không kiểm bảng `InvalidatedToken`, nên không biết token đã bị logout.

Khuyến nghị:

- Chặn network direct access tới service con.
- Hoặc để service con introspect token với identity-service cho các route nhạy cảm.

### Default account/password

`DataInitializer` tạo account mặc định như:

```text
admin/admin
manager/manager
receptionist/receptionist
support/support
housekeeping/housekeeping
customer/customer
```

Các account này rất tiện cho local dev nhưng nguy hiểm nếu lên production.

Khuyến nghị:

- Tắt seed account mặc định ở production.
- Hoặc bắt buộc đổi password ngay sau khi deploy.

### Secret hard-code/default yếu

Các giá trị cần đưa ra environment/secret manager:

- `jwt.signerKey`
- `APP_INTERNAL_SECRET`
- database password
- PayOS client id/api key/checksum key

Không nên dùng default như:

```text
dev-internal-secret
```

### Chưa thấy rate limit cho auth/OTP

Các endpoint login và OTP là public nên cần rate limit để tránh brute force hoặc spam OTP.

Khuyến nghị:

- Rate limit theo IP.
- Rate limit theo username/email.
- Lock tạm thời sau nhiều lần login sai.

## Checklist Production

- Chỉ expose API Gateway ra ngoài.
- Service con chỉ chạy trong private network.
- Đổi toàn bộ default password.
- Đưa `jwt.signerKey` vào secret manager.
- Đưa `APP_INTERNAL_SECRET` vào secret manager.
- Không commit PayOS key thật.
- Thêm verify chữ ký JWT ở service con hoặc đảm bảo network cô lập tuyệt đối.
- Thêm rate limit cho login, OTP, refresh token.
- Bật HTTPS ở gateway/proxy.
- Kiểm tra lại danh sách public endpoint trước khi deploy.
- Theo dõi log unauthorized, invalid webhook, failed login.

## Tóm Tắt

Hệ thống hiện dùng mô hình:

```text
JWT + Gateway Introspection + Role/Permission + Method Security + Internal Secret + PayOS Signature
```

Gateway là lớp kiểm token chính. Identity-service phát hành và xác thực token. Các service con đọc claim `scope` để kiểm quyền bằng `@PreAuthorize`. PayOS webhook public nhưng được bảo vệ bằng chữ ký `checksumKey`. Điểm cần gia cố nhất là không expose service con trực tiếp hoặc phải để service con verify chữ ký JWT thật sự.
