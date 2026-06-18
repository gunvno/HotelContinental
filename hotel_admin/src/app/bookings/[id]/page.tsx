"use client";

import {
  ArrowLeft,
  BadgeDollarSign,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  RefreshCcw,
  UserRound,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/use-permission";
import {
  getLatestPaymentRequestByBooking,
  mockPaymentRequestPaid,
} from "@/services/billing-service";
import { getRoomBooking, type RoomBookingResponse } from "@/services/booking-service";
import { getRoom, type RoomResponse } from "@/services/room-service";
import { getUserSummary, type UserSummaryResponse } from "@/services/user-service";

type DisplayStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCEL_REQUESTED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED";

const statusLabel: Record<DisplayStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCEL_REQUESTED: "Yêu cầu hủy",
  CHECKED_IN: "Đang ở",
  CHECKED_OUT: "Đã trả phòng",
  CANCELLED: "Đã hủy",
};

const bookingStatusLabel: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  DEPOSITED: "Đã xác nhận thanh toán",
  CANCEL_REQUESTED: "Yêu cầu hủy",
  CHECKED_IN: "Đang lưu trú",
  CANCEL: "Đã hủy",
  DONE: "Đã hoàn tất",
};

const detailStatusLabel: Record<string, string> = {
  BOOKED: "Đã giữ phòng",
  CHECKED_IN: "Đã nhận phòng",
  CHECKED_OUT: "Đã trả phòng",
  CANCELED: "Đã hủy phòng",
  NO_SHOW: "Không đến",
};

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const permission = usePermission();
  const canViewBookings = permission.has("BOOKING_VIEW");
  const canCheckIn = permission.has("BOOKING_CHECKIN");
  const canConfirmPayment = permission.has("PAYMENT_CONFIRM");
  const bookingId = useMemo(() => String(params.id ?? ""), [params.id]);

  const [booking, setBooking] = useState<RoomBookingResponse | null>(null);
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [customer, setCustomer] = useState<UserSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadBooking() {
    if (!bookingId || !canViewBookings) return;
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
    } catch {
      setMessage(
        "Không thể tải chi tiết booking. Kiểm tra booking-service và quyền BOOKING_VIEW.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBooking();
  }, [bookingId, canViewBookings]);

  async function handleMockConfirmPayment() {
    if (!booking || actionLoading) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const paymentRequest = await getLatestPaymentRequestByBooking(booking.id);
      await mockPaymentRequestPaid(paymentRequest.id);
      await loadBooking();
      setMessage(`Đã xác nhận chuyển khoản cho booking ${shortCode(booking.id)}.`);
    } catch {
      setMessage(
        "Không thể xác nhận chuyển khoản. Kiểm tra payment request và billing-service.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (!canViewBookings) {
    return (
      <PermissionDenied message="Bạn không có quyền BOOKING_VIEW để xem chi tiết booking." />
    );
  }

  const displayStatus = booking ? getDisplayStatus(booking) : "PENDING";
  const customerName = formatCustomerName(customer) || booking?.customerId || "-";
  const roomName = room?.name || booking?.roomId || "-";
  const readyToCheckIn =
    booking?.status === "DEPOSITED" && booking?.detailStatus === "BOOKED";

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

      {message ? (
        <div className="rounded-xl bg-[#fff6df] p-3 text-sm font-semibold text-[#8a5724]">
          {message}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-10 text-center text-[#7c6f63]">
          Đang tải chi tiết booking...
        </div>
      ) : booking ? (
        <>
          <section className="rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.22em] text-[#9b5c24] uppercase">
                  Chi tiết booking
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <h2 className="text-4xl font-bold tracking-tight text-[#17213a]">
                    {shortCode(booking.id)}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(displayStatus)}`}
                  >
                    {statusLabel[displayStatus]}
                  </span>
                </div>
                <p className="mt-3 max-w-3xl text-sm break-all text-[#7c6f63]">
                  Mã đầy đủ: {booking.id}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void loadBooking()}
                  disabled={loading || actionLoading}
                  className="gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Tải lại
                </Button>
                {displayStatus === "PENDING" ? (
                  <Button
                    type="button"
                    disabled={!canConfirmPayment || actionLoading}
                    onClick={() => void handleMockConfirmPayment()}
                    className="gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Xác nhận CK
                  </Button>
                ) : null}
                {readyToCheckIn ? (
                  <Button
                    type="button"
                    disabled={!canCheckIn || actionLoading}
                    onClick={() => router.push(`/bookings/${booking.id}/checkin`)}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Check-in
                  </Button>
                ) : null}
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={<UserRound className="h-5 w-5" />}
              label="Khách hàng"
              value={customerName}
              sub={customer?.email || customer?.username || booking.customerId}
            />
            <SummaryCard
              icon={<BedDouble className="h-5 w-5" />}
              label="Phòng"
              value={roomName}
              sub={room?.roomTypes?.name || booking.roomId}
            />
            <SummaryCard
              icon={<Clock3 className="h-5 w-5" />}
              label="Thời lượng"
              value={getDurationLabel(booking.checkin, booking.checkout)}
              sub={booking.bookingType}
            />
            <SummaryCard
              icon={<BadgeDollarSign className="h-5 w-5" />}
              label="Tổng tiền"
              value={formatMoney(booking.totalPrice)}
              sub={`Đặt cọc ${formatMoney(booking.deposit)}`}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#17213a]">Thời gian lưu trú</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <LargeInfo
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Nhận phòng dự kiến"
                  value={formatDateTime(booking.checkin)}
                />
                <LargeInfo
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Trả phòng dự kiến"
                  value={formatDateTime(booking.checkout)}
                />
                <LargeInfo
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="Thực nhận"
                  value={
                    booking.checkinReality ? formatDateTime(booking.checkinReality) : "-"
                  }
                />
                <LargeInfo
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="Thực trả"
                  value={
                    booking.checkoutReality
                      ? formatDateTime(booking.checkoutReality)
                      : "-"
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#17213a]">Trạng thái</h3>
              <div className="mt-5 space-y-4">
                <DetailLine
                  label="Trạng thái booking"
                  value={formatBookingStatus(booking.status)}
                />
                <DetailLine
                  label="Trạng thái phòng"
                  value={formatDetailStatus(booking.detailStatus)}
                />
                <DetailLine label="Loại booking" value={booking.bookingType} />
                <DetailLine label="Mã khách" value={booking.customerId} />
                <DetailLine label="Mã phòng" value={booking.roomId} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-[#17213a]">Chi phí</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MoneyCard label="Giá phòng" value={formatMoney(booking.roomPrice)} />
              <MoneyCard label="Tiền phòng" value={formatMoney(booking.totalRoomPrice)} />
              <MoneyCard label="Dịch vụ" value={formatMoney(booking.totalServicePrice)} />
              <MoneyCard label="Phụ thu" value={formatMoney(booking.totalExtraPrice)} />
              <MoneyCard label="Đặt cọc" value={formatMoney(booking.deposit)} />
              <MoneyCard
                label="Tổng tiền"
                value={formatMoney(booking.totalPrice)}
                strong
              />
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

function SummaryCard({
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
    <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-[#fff6df] p-2 text-[#9b5c24]">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
            {label}
          </p>
          <p className="mt-2 text-lg font-bold break-words text-[#17213a]">{value}</p>
          {sub ? <p className="mt-1 text-xs break-all text-[#9f8a77]">{sub}</p> : null}
        </div>
      </div>
    </div>
  );
}

function LargeInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#eee3d5] bg-[#fbf6ed] p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-white p-2 text-[#9b5c24]">{icon}</div>
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
            {label}
          </p>
          <p className="mt-2 text-xl font-bold text-[#17213a]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#eee3d5] bg-[#fbf6ed] p-4">
      <p className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
        {label}
      </p>
      <p className="mt-2 font-semibold break-words text-[#17213a]">{value}</p>
    </div>
  );
}

function MoneyCard({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#eee3d5] bg-[#fbf6ed] p-5">
      <p className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
        {label}
      </p>
      <p
        className={`mt-2 text-xl ${strong ? "font-black text-[#17213a]" : "font-bold text-[#8a5724]"}`}
      >
        {value}
      </p>
    </div>
  );
}

function getDisplayStatus(booking: RoomBookingResponse): DisplayStatus {
  if (booking.status === "CANCEL_REQUESTED") {
    return "CANCEL_REQUESTED";
  }
  if (
    booking.status === "CANCEL" ||
    booking.detailStatus === "CANCELED" ||
    booking.detailStatus === "NO_SHOW"
  ) {
    return "CANCELLED";
  }
  if (booking.status === "DONE" || booking.detailStatus === "CHECKED_OUT") {
    return "CHECKED_OUT";
  }
  if (booking.status === "CHECKED_IN" || booking.detailStatus === "CHECKED_IN") {
    return "CHECKED_IN";
  }
  if (booking.status === "DEPOSITED") {
    return "CONFIRMED";
  }
  return "PENDING";
}

function badgeClass(status: DisplayStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "CONFIRMED":
      return "bg-sky-100 text-sky-700";
    case "CANCEL_REQUESTED":
      return "bg-orange-100 text-orange-700";
    case "CHECKED_IN":
      return "bg-green-100 text-green-700";
    case "CHECKED_OUT":
      return "bg-gray-100 text-gray-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
  }
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

function getDurationLabel(start?: string, end?: string) {
  if (!start || !end) return "-";
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) {
    return "-";
  }

  const totalMinutes = Math.round((endTime - startTime) / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days} ngày${hours > 0 ? ` ${hours} giờ` : ""}`;
  }
  if (hours > 0) {
    return `${hours} giờ${minutes > 0 ? ` ${minutes} phút` : ""}`;
  }
  return `${minutes} phút`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}
