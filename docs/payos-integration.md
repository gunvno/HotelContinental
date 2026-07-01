# Tài Liệu Tích Hợp PayOS

Tài liệu này mô tả cách PayOS đang được tích hợp trong `billing-service` của Hotel Continental. Mục tiêu của PayOS trong dự án là tạo link/QR thanh toán, nhận webhook khi giao dịch thành công và đồng bộ trạng thái thanh toán về booking hoặc đơn dịch vụ.

## Thành Phần Chính

| Thành phần | File | Vai trò |
| --- | --- | --- |
| Cấu hình PayOS | `PayosProperties.java` | Đọc cấu hình `payos.*` từ `application.yaml` hoặc biến môi trường. |
| Client gọi PayOS | `PayosClient.java` | Tạo payment link, lấy trạng thái payment link và verify chữ ký webhook. |
| Nhận webhook | `PayosWebhookFilter.java` | Bắt các request PayOS gửi về, parse body và chuyển cho service xử lý. |
| Xử lý nghiệp vụ | `PaymentRequestServiceImpl.java` | Tạo payment request, gắn link PayOS, xử lý webhook, cập nhật paid/expired/failed. |
| DTO webhook | `PayosWebhookRequest.java` | Đại diện dữ liệu webhook PayOS gửi về. |
| DTO response PayOS | `PayosPaymentLinkResponse.java` | Đại diện dữ liệu payment link PayOS trả về. |

## Cấu Hình

PayOS dùng nhóm cấu hình `payos`:

```yaml
payos:
  enabled: true
  base-url: https://api-merchant.payos.vn
  client-id: ${PAYOS_CLIENT_ID}
  api-key: ${PAYOS_API_KEY}
  checksum-key: ${PAYOS_CHECKSUM_KEY}
  return-url: ${PAYOS_RETURN_URL}
  cancel-url: ${PAYOS_CANCEL_URL}
```

Ý nghĩa:

- `enabled`: bật hoặc tắt tích hợp PayOS.
- `base-url`: API endpoint của PayOS.
- `client-id`: mã client do PayOS cấp.
- `api-key`: API key dùng khi backend gọi PayOS.
- `checksum-key`: khóa dùng để tạo chữ ký request và kiểm tra chữ ký webhook.
- `return-url`: URL frontend nhận redirect sau khi khách thanh toán thành công.
- `cancel-url`: URL frontend nhận redirect khi khách hủy thanh toán.

Trong `.env.example`, các biến tương ứng là:

```env
PAYOS_ENABLED=false
PAYOS_BASE_URL=https://api-merchant.payos.vn
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
PAYOS_RETURN_URL=http://localhost:3000/payment/success
PAYOS_CANCEL_URL=http://localhost:3000/payment
```

Lưu ý: không nên commit `client-id`, `api-key`, `checksum-key` thật vào repository. Các giá trị này nên lấy từ biến môi trường hoặc secret manager.

## Luồng Tạo Thanh Toán

Frontend gọi:

```http
POST /billing/payment-requests
```

Payload có thể là thanh toán booking:

```json
{
  "roomBookingId": "booking-id",
  "purpose": "ROOM_BOOKING",
  "amount": 1200000
}
```

Hoặc thanh toán service order:

```json
{
  "serviceOrderId": "service-order-id",
  "purpose": "SERVICE_ORDER"
}
```

Backend xử lý trong `PaymentRequestServiceImpl.create`:

1. Validate request.
2. Xác định mục đích thanh toán: `ROOM_BOOKING` hoặc `SERVICE_ORDER`.
3. Lấy booking từ booking-service.
4. Nếu là service order, tính số tiền bằng `price * quantity`.
5. Kiểm tra đã có `PaymentRequest` trạng thái `PENDING` chưa.
6. Nếu đã có request pending, dùng lại request đó.
7. Nếu chưa có, tạo request mới với:
   - `status = PENDING`
   - `paymentMethod = BANK_TRANSFER`
   - `providerOrderCode = System.currentTimeMillis()`
   - `transferContent = BK{providerOrderCode}`
   - `expiredTime = now + 24 giờ`
8. Gọi `attachPayosLinkIfNeeded` để gắn link/QR PayOS.

## Gắn Link Và QR PayOS

Hàm `attachPayosLinkIfNeeded` chỉ chạy khi:

- payment request đang `PENDING`;
- PayOS đã được cấu hình đầy đủ;
- payment request chưa có `providerQrCode`.

Luồng xử lý:

1. Lấy `orderCode` từ `providerOrderCode`.
2. Nếu thiếu `orderCode`, thử parse từ `transferContent`.
3. Nếu vẫn thiếu, tạo `orderCode` mới bằng `System.currentTimeMillis()`.
4. Gọi `payosClient.getPaymentLink(orderCode)` để kiểm tra link đã tồn tại trên PayOS chưa.
5. Nếu PayOS chưa có link, gọi `payosClient.createPaymentLink(orderCode, amount, transferContent)`.
6. Lưu dữ liệu PayOS vào `PaymentRequest`:
   - `provider = PAYOS`
   - `providerOrderCode`
   - `providerPaymentLinkId`
   - `providerCheckoutUrl`
   - `providerQrCode`
   - `transferContent`

Frontend dùng `providerCheckoutUrl` hoặc `providerQrCode` để hiển thị cho khách thanh toán.

## Cách Backend Gọi PayOS

### Tạo Payment Link

`PayosClient.createPaymentLink` gửi request:

```http
POST {PAYOS_BASE_URL}/v2/payment-requests
```

Header:

```http
x-client-id: {PAYOS_CLIENT_ID}
x-api-key: {PAYOS_API_KEY}
```

Body:

```json
{
  "amount": 1200000,
  "cancelUrl": "http://localhost:3000/payment",
  "description": "BK1782929123123",
  "orderCode": 1782929123123,
  "returnUrl": "http://localhost:3000/payment/success",
  "signature": "..."
}
```

Nếu PayOS trả `code = "00"` và có `data`, backend nhận các trường quan trọng:

- `paymentLinkId`
- `orderCode`
- `amount`
- `description`
- `checkoutUrl`
- `qrCode`
- `status`

### Lấy Trạng Thái Payment Link

`PayosClient.getPaymentLink` gọi:

```http
GET {PAYOS_BASE_URL}/v2/payment-requests/{orderCode}
```

API này được dùng để:

- tránh tạo trùng link nếu PayOS đã có link cho `orderCode`;
- refresh trạng thái nếu webhook bị trễ hoặc bị mất.

## Chữ Ký Và Bảo Mật Webhook

PayOS dùng chữ ký HMAC SHA-256. Trong code, chữ ký được tạo bởi `PayosClient.sign`.

Cách ký:

1. Sắp xếp các field theo tên key bằng `TreeMap`.
2. Bỏ qua field `signature`.
3. Bỏ qua field có value `null`.
4. Nối dữ liệu theo dạng:

```text
amount=1200000&orderCode=1782929123123&reference=...
```

5. Dùng `checksumKey` để ký bằng thuật toán `HmacSHA256`.
6. Encode kết quả thành chuỗi hex lowercase.

Khi nhận webhook, backend gọi:

```java
payosClient.verifyWebhook(request)
```

Hàm này tự ký lại `request.data` và so sánh với `request.signature`. Nếu chữ ký không khớp, webhook bị từ chối.

## Luồng Webhook

PayOS gửi webhook về các endpoint public:

```http
POST /billing/payment-requests/payos
POST /billing/payment-requests/payos/webhook
```

Trong dự án, webhook được xử lý sớm bởi `PayosWebhookFilter` với `@Order(Ordered.HIGHEST_PRECEDENCE)`.

Luồng filter:

1. Chỉ xử lý path `/payment-requests/payos` và `/payment-requests/payos/**`.
2. Với `GET`, `HEAD`, `OPTIONS`: trả `PayOS webhook is ready`.
3. Với method khác `POST`: vẫn trả OK.
4. Với `POST`: đọc raw body từ request.
5. Parse JSON thành `PayosWebhookRequest`.
6. Nếu thiếu `data` hoặc `signature`: trả OK.
7. Nếu hợp lệ: gọi `paymentRequestService.handlePayosWebhook`.
8. Nếu xử lý lỗi: log warning nhưng vẫn trả HTTP 200.

Việc trả HTTP 200 giúp PayOS không retry liên tục khi endpoint nhận được request nhưng dữ liệu không áp dụng được.

## Xử Lý Webhook Thành Công

`PaymentRequestServiceImpl.handlePayosWebhook` xử lý như sau:

1. Verify chữ ký bằng `payosClient.verifyWebhook`.
2. Lấy `orderCode` từ `request.data`.
3. Tìm `PaymentRequest` theo `providerOrderCode`.
4. Nếu payment request đã `PAID`, trả về luôn để tránh xử lý trùng.
5. Lấy `amount` từ webhook và so sánh với `paymentRequest.amount`.
6. Nếu số tiền lệch, ném lỗi `INVALID_PAYOS_WEBHOOK`.
7. Lấy mã giao dịch từ `reference`, nếu không có thì dùng `paymentLinkId`, nếu vẫn không có thì dùng `PAYOS-{orderCode}`.
8. Gọi `markAsPaid`.

`markAsPaid` sẽ:

- tạo `PaymentHistory`;
- nếu là `ROOM_BOOKING`, gọi booking-service để đánh dấu booking đã đặt cọc/đã thanh toán;
- nếu là `SERVICE_ORDER`, cập nhật service order thành `PAID` và sync lại tổng tiền booking;
- cập nhật `PaymentRequest`:
  - `status = PAID`
  - `paidTime = now`
  - `providerTransactionId = reference`

## Refresh Trạng Thái PayOS

Ngoài webhook, backend còn chủ động hỏi lại PayOS trong `refreshPayosStatus`.

Hàm này chạy khi đọc payment request qua các luồng get/list, với điều kiện:

- `status = PENDING`;
- `provider = PAYOS`;
- có `providerOrderCode`.

Backend gọi `payosClient.getPaymentLink(providerOrderCode)` rồi đọc `status`:

| Trạng thái PayOS | Hành động trong hệ thống |
| --- | --- |
| `PAID` | Gọi `markAsPaid`. |
| `EXPIRED` | Cập nhật `PaymentRequest.status = EXPIRED`. |
| `CANCELLED` hoặc `CANCELED` | Cập nhật `PaymentRequest.status = FAILED`. |
| Trạng thái khác | Giữ nguyên. |

Cơ chế này là lớp dự phòng nếu webhook bị miss, đến chậm hoặc môi trường local không nhận được webhook từ internet.

## Hết Hạn Payment Request

Payment request pending được đặt hạn 24 giờ:

```java
private static final int PENDING_PAYMENT_EXPIRATION_HOURS = 24;
```

Scheduler `expirePendingPaymentRequests` chạy định kỳ:

- mặc định delay ban đầu: `60000ms`;
- mặc định fixed delay: `600000ms`;
- tìm các request `PENDING` có `expiredTime` trước thời điểm hiện tại;
- cập nhật `status = EXPIRED`.

## Trạng Thái Quan Trọng

| Field | Ý nghĩa |
| --- | --- |
| `status` | Trạng thái payment request: `PENDING`, `PAID`, `EXPIRED`, `FAILED`. |
| `provider` | Nhà cung cấp thanh toán, hiện dùng `PAYOS`. |
| `providerOrderCode` | Mã đơn gửi sang PayOS, cũng dùng để map webhook về payment request. |
| `providerPaymentLinkId` | ID payment link do PayOS trả về. |
| `providerCheckoutUrl` | URL checkout PayOS cho frontend redirect hoặc mở thanh toán. |
| `providerQrCode` | QR thanh toán do PayOS trả về. |
| `providerTransactionId` | Mã giao dịch/reference sau khi thanh toán thành công. |
| `transferContent` | Nội dung chuyển khoản, thường là `BK{orderCode}`. |

## Endpoint Liên Quan

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| `POST` | `/billing/payment-requests` | Tạo payment request và gắn PayOS link/QR nếu có cấu hình. |
| `GET` | `/billing/payment-requests/{id}` | Lấy chi tiết payment request, đồng thời có thể refresh trạng thái PayOS. |
| `GET` | `/billing/payment-requests/booking/{roomBookingId}` | Lấy payment request mới nhất của booking. |
| `GET` | `/billing/payment-requests/my` | Lấy danh sách payment request của user hiện tại. |
| `POST` | `/billing/payment-requests/{id}/mock-paid` | Mock thanh toán thành công cho lễ tân. |
| `POST` | `/billing/payment-requests/payos/webhook` | Endpoint webhook PayOS. |
| `GET` | `/billing/payment-requests/payos/webhook` | Kiểm tra endpoint webhook đã sẵn sàng. |

## Lưu Ý Khi Chạy Local

- `return-url` và `cancel-url` trỏ về frontend local, ví dụ `http://localhost:3000/payment/success`.
- Webhook từ PayOS cần gọi được vào backend. Nếu backend chạy local sau NAT, PayOS thường không gọi được trực tiếp.
- Khi test local, có thể dùng tunnel như ngrok hoặc dùng chức năng refresh status/mock paid.
- Nếu PayOS chưa cấu hình đủ, hệ thống vẫn tạo `PaymentRequest`, nhưng sẽ không có `providerCheckoutUrl` hoặc `providerQrCode`.
- Khi webhook lỗi signature, sai amount hoặc không tìm thấy order, backend log warning và vẫn trả HTTP 200.

## Checklist Production

- Chuyển toàn bộ PayOS key sang biến môi trường hoặc secret manager.
- Không commit `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` thật.
- Cấu hình webhook URL public trỏ đến:

```text
https://{domain}/billing/payment-requests/payos/webhook
```

- Đảm bảo gateway/proxy cho phép PayOS gọi endpoint webhook không cần JWT.
- Đảm bảo `return-url` và `cancel-url` dùng domain frontend production.
- Theo dõi log `PayOS webhook received but was not applied` để phát hiện lỗi signature, orderCode hoặc amount.
- Cân nhắc lưu raw webhook/audit log nếu cần đối soát tài chính về sau.

## Tóm Tắt Luồng

```text
Frontend tạo payment request
        ↓
Billing service tạo PaymentRequest PENDING
        ↓
Billing service gọi PayOS tạo payment link/QR
        ↓
Frontend hiển thị QR hoặc checkout URL
        ↓
Khách thanh toán qua PayOS
        ↓
PayOS gửi webhook về billing-service
        ↓
Backend verify signature, orderCode và amount
        ↓
Backend tạo PaymentHistory
        ↓
Backend cập nhật PaymentRequest = PAID
        ↓
Backend cập nhật booking đã thanh toán hoặc service order đã paid
```
