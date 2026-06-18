"use client";

import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCcw,
  Trash2,
  UserRound,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/hooks/use-permission";
import {
  checkInRoomBooking,
  getRoomBooking,
  registerResidence,
  type ResidenceGuestPayload,
  type RoomBookingResponse,
} from "@/services/booking-service";
import { getRoom, type RoomResponse } from "@/services/room-service";
import { ensureIncludedServiceOrderDetails } from "@/services/service-order-service";
import { getUserSummary, type UserSummaryResponse } from "@/services/user-service";

type GuestForm = ResidenceGuestPayload;

const emptyGuest: GuestForm = {
  fullName: "",
  identityNumber: "",
  gender: "MALE",
  dateOfBirth: "",
};

const bookingStatusLabel: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  DEPOSITED: "Đã xác nhận thanh toán",
  CANCEL_REQUESTED: "Yêu cầu hủy",
  CHECKED_IN: "Đang lưu trú",
  CANCEL: "Đã hủy",
  DONE: "Đã trả phòng",
};

const detailStatusLabel: Record<string, string> = {
  BOOKED: "Đã giữ phòng",
  CHECKED_IN: "Đã nhận phòng",
  CHECKED_OUT: "Đã trả phòng",
  CANCELED: "Đã hủy",
  NO_SHOW: "Không đến",
};

export default function BookingCheckInPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const permission = usePermission();
  const canCheckIn = permission.has("BOOKING_CHECKIN");
  const bookingId = useMemo(() => String(params.id ?? ""), [params.id]);

  const [booking, setBooking] = useState<RoomBookingResponse | null>(null);
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [customer, setCustomer] = useState<UserSummaryResponse | null>(null);
  const [guests, setGuests] = useState<GuestForm[]>([{ ...emptyGuest }]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadBooking() {
    if (!bookingId || !canCheckIn) return;
    setLoading(true);
    setMessage(null);
    try {
      const bookingData = await getRoomBooking(bookingId);
      setBooking(bookingData);
      const [roomData, customerData] = await Promise.all([
        getRoom(bookingData.roomId).catch(() => null),
        getUserSummary(bookingData.customerId).catch(() => null),
      ]);
      setRoom(roomData);
      setCustomer(customerData);

      const customerName = formatCustomerName(customerData);
      if (customerName) {
        setGuests((items) =>
          items.length === 1 && !items[0].fullName
            ? [{ ...items[0], fullName: customerName }]
            : items,
        );
      }
    } catch {
      setMessage("Không thể tải booking. Kiểm tra booking-service và quyền BOOKING_VIEW.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBooking();
  }, [bookingId, canCheckIn]);

  function updateGuest(index: number, patch: Partial<GuestForm>) {
    setGuests((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function addGuest() {
    setGuests((items) => [...items, { ...emptyGuest }]);
  }

  function removeGuest(index: number) {
    setGuests((items) =>
      items.length === 1 ? items : items.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function validateGuests() {
    return guests.every(
      (guest) =>
        guest.fullName.trim() &&
        guest.identityNumber.trim() &&
        guest.gender.trim() &&
        guest.dateOfBirth.trim(),
    );
  }

  async function confirmCheckIn() {
    if (!booking || submitting) return;
    if (!validateGuests()) {
      setMessage("Vui lòng nhập đủ họ tên, CCCD/CMND, giới tính và ngày sinh của khách lưu trú.");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await registerResidence(
        booking.id,
        guests.map((guest) => ({
          fullName: guest.fullName.trim(),
          identityNumber: guest.identityNumber.trim(),
          gender: guest.gender,
          dateOfBirth: guest.dateOfBirth,
        })),
      );
      const updated = await checkInRoomBooking(booking.id);
      await ensureIncludedServiceOrderDetails(booking.id).catch(() => null);
      setBooking(updated);
      setMessage("Đã lưu đăng ký lưu trú và check-in thành công.");
      window.setTimeout(() => router.push("/bookings"), 700);
    } catch {
      setMessage(
        "Không thể check-in. Kiểm tra trạng thái booking, dữ liệu đăng ký lưu trú và quyền BOOKING_CHECKIN.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!canCheckIn) {
    return (
      <PermissionDenied message="Bạn không có quyền BOOKING_CHECKIN để thực hiện check-in." />
    );
  }

  const readyToCheckIn =
    booking?.status === "DEPOSITED" && booking?.detailStatus === "BOOKED";
  const customerName = formatCustomerName(customer) || "Chưa tải được tên khách";
  const roomName = room?.name || booking?.roomId || "Chưa tải được tên phòng";

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => router.push("/bookings")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#17213a] hover:text-[#9b5c24]"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách đặt phòng
      </button>

      <section className="rounded-2xl border border-[#decdb9] bg-white/85 p-6 shadow-sm">
        <p className="text-sm font-bold tracking-[0.22em] text-[#9b5c24] uppercase">
          Tiếp nhận khách
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17213a]">
          Check-in booking
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-[#7c6f63]">
          Nhập thông tin đăng ký lưu trú trước khi chuyển booking sang trạng thái khách đang ở.
        </p>
      </section>

      {message ? (
        <div className="rounded-xl bg-[#fff6df] p-3 text-sm font-semibold text-[#8a5724]">
          {message}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-10 text-center text-[#7c6f63]">
          Đang tải booking...
        </div>
      ) : booking ? (
        <>
          <section className="rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                icon={<CalendarDays className="h-5 w-5" />}
                label="Mã booking"
                value={shortCode(booking.id)}
                sub={booking.id}
              />
              <InfoCard
                icon={<UserRound className="h-5 w-5" />}
                label="Khách hàng"
                value={customerName}
                sub={customer?.email || customer?.username}
              />
              <InfoCard
                icon={<BedDouble className="h-5 w-5" />}
                label="Phòng"
                value={roomName}
                sub={room?.roomTypes?.name}
              />
              <InfoCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                label="Trạng thái"
                value={`${formatBookingStatus(booking.status)} / ${formatDetailStatus(booking.detailStatus)}`}
              />
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl border border-[#eee3d5] bg-[#fbf6ed] p-5 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
                  Nhận phòng dự kiến
                </p>
                <p className="mt-2 text-lg font-semibold text-[#17213a]">
                  {formatDateTime(booking.checkin)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
                  Trả phòng dự kiến
                </p>
                <p className="mt-2 text-lg font-semibold text-[#17213a]">
                  {formatDateTime(booking.checkout)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#17213a]">
                  Đăng ký lưu trú
                </h3>
                <p className="mt-2 text-sm text-[#7c6f63]">
                  Mỗi khách lưu trú cần có thông tin giấy tờ để lưu vào bảng residence_registration.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addGuest}
                disabled={submitting}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Thêm khách
              </Button>
            </div>

            <div className="mt-5 space-y-4">
              {guests.map((guest, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[#eee3d5] bg-[#fbf6ed] p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="font-semibold text-[#17213a]">
                      Khách lưu trú {index + 1}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeGuest(index)}
                      disabled={guests.length === 1 || submitting}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
                        Họ và tên
                      </span>
                      <Input
                        value={guest.fullName}
                        onChange={(event) =>
                          updateGuest(index, { fullName: event.target.value })
                        }
                        placeholder="Ví dụ: Tạ Văn Long"
                        className="mt-2"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
                        CCCD / CMND
                      </span>
                      <Input
                        value={guest.identityNumber}
                        onChange={(event) =>
                          updateGuest(index, { identityNumber: event.target.value })
                        }
                        placeholder="Nhập số căn cước"
                        className="mt-2"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
                        Giới tính
                      </span>
                      <select
                        value={guest.gender}
                        onChange={(event) =>
                          updateGuest(index, { gender: event.target.value })
                        }
                        className="mt-2 h-11 w-full rounded-md border border-[#decdb9] bg-white px-3 text-sm text-[#17213a]"
                      >
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
                        Ngày sinh
                      </span>
                      <DateOfBirthPicker
                        value={guest.dateOfBirth}
                        onChange={(dateOfBirth) => updateGuest(index, { dateOfBirth })}
                        disabled={submitting}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#17213a]">Xác nhận check-in</h3>
            <div className="mt-5 space-y-3 rounded-2xl bg-[#fbf6ed] p-4 text-sm text-[#5f5144]">
              <div className="flex justify-between gap-4">
                <span>Tổng tiền</span>
                <strong className="text-[#17213a]">{formatMoney(booking.totalPrice)}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Tiền phòng</span>
                <span>{formatMoney(booking.totalRoomPrice)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Dịch vụ phát sinh</span>
                <span>{formatMoney(booking.totalServicePrice)}</span>
              </div>
            </div>

            {!readyToCheckIn ? (
              <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                Booking này chưa sẵn sàng check-in. Cần trạng thái đã xác nhận thanh toán và phòng còn được giữ.
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => void loadBooking()}
                disabled={loading || submitting}
                className="gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Tải lại
              </Button>
              <Button
                type="button"
                onClick={() => void confirmCheckIn()}
                disabled={!readyToCheckIn || submitting}
                className="flex-1 gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Lưu đăng ký và check-in
              </Button>
            </div>
          </section>
        </>
      ) : (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
          Không tìm thấy booking.
        </div>
      )}
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#eee3d5] bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-[#fff6df] p-2 text-[#9b5c24]">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
            {label}
          </p>
          <p className="mt-1 break-words font-semibold text-[#17213a]">{value}</p>
          {sub ? <p className="mt-1 break-all text-xs text-[#9f8a77]">{sub}</p> : null}
        </div>
      </div>
    </div>
  );
}

function formatCustomerName(customer: UserSummaryResponse | null) {
  if (!customer) return "";
  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ");
  return fullName || customer.username || customer.email || "";
}

function formatBookingStatus(status?: string) {
  if (!status) return "-";
  return bookingStatusLabel[status] ?? status;
}

function formatDetailStatus(status?: string) {
  if (!status) return "-";
  return detailStatusLabel[status] ?? status;
}

function shortCode(id: string) {
  return `BK-${id.slice(0, 8).toUpperCase()}`;
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function DateOfBirthPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [year = "", month = "", day = ""] = value ? value.split("-") : [];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 91 }, (_, index) => String(currentYear - 10 - index));
  const days = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0"));
  const months = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));

  function updateDate(part: "day" | "month" | "year", nextValue: string) {
    const nextDay = part === "day" ? nextValue : day;
    const nextMonth = part === "month" ? nextValue : month;
    const nextYear = part === "year" ? nextValue : year;
    onChange(nextDay && nextMonth && nextYear ? `${nextYear}-${nextMonth}-${nextDay}` : "");
  }

  return (
    <div className="mt-2 grid grid-cols-[1fr_1fr_1.2fr] gap-2">
      <select
        aria-label="Ngày sinh"
        value={day}
        onChange={(event) => updateDate("day", event.target.value)}
        disabled={disabled}
        className="h-11 rounded-md border border-[#decdb9] bg-white px-3 text-sm font-medium text-[#17213a] outline-none transition focus:border-[#c47b30] disabled:cursor-not-allowed disabled:bg-[#f2eadf]"
      >
        <option value="">Ngày</option>
        {days.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select
        aria-label="Tháng sinh"
        value={month}
        onChange={(event) => updateDate("month", event.target.value)}
        disabled={disabled}
        className="h-11 rounded-md border border-[#decdb9] bg-white px-3 text-sm font-medium text-[#17213a] outline-none transition focus:border-[#c47b30] disabled:cursor-not-allowed disabled:bg-[#f2eadf]"
      >
        <option value="">Tháng</option>
        {months.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select
        aria-label="Năm sinh"
        value={year}
        onChange={(event) => updateDate("year", event.target.value)}
        disabled={disabled}
        className="h-11 rounded-md border border-[#decdb9] bg-white px-3 text-sm font-medium text-[#17213a] outline-none transition focus:border-[#c47b30] disabled:cursor-not-allowed disabled:bg-[#f2eadf]"
      >
        <option value="">Năm</option>
        {years.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
