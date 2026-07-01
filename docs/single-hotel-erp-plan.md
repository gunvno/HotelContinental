# Định Hướng ERP Cho Một Khách Sạn

Hotel Continental hiện được định hướng là hệ thống quản trị cho một khách sạn, gồm website đặt phòng dành cho khách hàng và cổng quản trị nội bộ theo mô hình ERP.

## Phạm Vi

- Giữ website khách hàng cho các chức năng đặt phòng, thanh toán toàn bộ tiền phòng ban đầu, xem hóa đơn, gửi yêu cầu hủy, đổi ngày lưu trú và gọi thêm dịch vụ tùy chọn.
- Sử dụng cổng quản trị như hệ thống ERP vận hành nội bộ cho nhân viên.
- Không bổ sung luồng chuyển đổi nhiều khách sạn hoặc chọn khách sạn.
- Tòa nhà, tầng, phòng, loại phòng, dịch vụ, booking, hóa đơn, thanh toán, nhân viên và báo cáo đều thuộc về một khách sạn duy nhất.

## Vai Trò

- `ADMIN`: toàn quyền quản trị hệ thống.
- `MANAGER`: quản lý vận hành, báo cáo, giám sát booking, dịch vụ và thanh toán.
- `RECEPTIONIST`: vận hành booking, check-in/check-out, thêm dịch vụ, thu tiền khi checkout.
- `CUSTOMER_SUPPORT`: xử lý chat và các luồng hỗ trợ khách hàng.
- `HOUSEKEEPING`: thực hiện công việc phòng/dịch vụ, xem các bản ghi vận hành được giao, đánh dấu đơn dịch vụ đã phục vụ, check-in/check-out ca làm việc.
- `CUSTOMER`: tài khoản web dành cho khách hàng.

## Vận Hành Đơn Dịch Vụ

Dịch vụ phát sinh được quản lý như các công việc ERP:

- Khách hàng có thể yêu cầu hoặc thanh toán các dịch vụ được phép từ website khách hàng.
- Lễ tân hoặc quản lý có thể thêm dịch vụ cho một booking từ cổng quản trị.
- Nhân viên buồng phòng có thể xem các đơn dịch vụ đang chờ và đánh dấu đã phục vụ.
- Quản lý hoặc lễ tân có thể duyệt hoặc từ chối các dịch vụ cần nhân viên phê duyệt.
- Bộ lọc đơn dịch vụ nên hỗ trợ tối thiểu các tiêu chí: trạng thái phục vụ, nguồn tạo, trạng thái phê duyệt và trạng thái thanh toán.

## Hoạt Động Nhân Viên

Identity service quản lý lịch sử hoạt động của nhân viên:

- thời điểm đăng nhập
- thời điểm đăng xuất
- thời điểm check-in ca làm việc
- thời điểm check-out ca làm việc
- trạng thái phiên làm việc đang hoạt động hoặc đã hoàn tất

Dữ liệu này là nền tảng cho các báo cáo về lương, ca làm việc và hiệu suất nhân viên sau này.

## Quy Tắc Thanh Toán

- Booking phòng ban đầu vẫn áp dụng thanh toán toàn bộ trước.
- Dịch vụ phát sinh sau khi check-in có thể được thanh toán ngay bằng PayOS hoặc ghi vào hóa đơn checkout.
- Khi checkout chỉ thu các đơn dịch vụ chưa thanh toán và các khoản phát sinh bổ sung.
