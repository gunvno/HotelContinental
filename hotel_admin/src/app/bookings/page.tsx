"use client";

import {
  BadgeDollarSign,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Filter,
  LogOut,
  RefreshCcw,
  Search,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/hooks/use-permission";
import {
  approveRoomBookingCancellation,
  checkInRoomBooking,
  checkOutRoomBooking,
  getRoomBookings,
  type RoomBookingResponse,
} from "@/services/booking-service";
import {
  getLatestPaymentRequestByBooking,
  mockPaymentRequestPaid,
} from "@/services/billing-service";
import { getAllRooms } from "@/services/room-service";

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

export default function BookingsPage() {
  const router = useRouter();
  const permission = usePermission();
  const canViewBookings = permission.has("BOOKING_VIEW");
  const canCheckIn = permission.has("BOOKING_CHECKIN");
  const canCheckOut = permission.has("BOOKING_CHECKOUT");
  const canCancelBooking = permission.has("BOOKING_CANCEL");
  const canConfirmPayment = permission.has("PAYMENT_CONFIRM");

  const [bookings, setBookings] = useState<RoomBookingResponse[]>([]);
  const [roomNames, setRoomNames] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<DisplayStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const isActionBusy = actionId !== null;

  async function loadData() {
    if (isActionBusy) return;
    setLoading(true);
    setMessage(null);
    try {
      const [bookingData, roomData] = await Promise.all([
        getRoomBookings(),
        getAllRooms(0, 200).catch(() => ({ data: [], total: 0 })),
      ]);

      setBookings(bookingData);
      setRoomNames(Object.fromEntries(roomData.data.map((room) => [room.id, room.name])));
    } catch {
      setMessage(
        "Không thể tải danh sách đặt phòng. Kiểm tra booking-service, gateway và quyền BOOKING_VIEW.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return bookings.filter((booking) => {
      const displayStatus = getDisplayStatus(booking);
      const roomName = roomNames[booking.roomId] ?? booking.roomId;
      const matchesQuery =
        shortCode(booking.id).toLowerCase().includes(normalizedQuery) ||
        booking.customerId.toLowerCase().includes(normalizedQuery) ||
        roomName.toLowerCase().includes(normalizedQuery);
      const matchesStatus = status === "ALL" || displayStatus === status;
      return matchesQuery && matchesStatus;
    });
  }, [bookings, query, roomNames, status]);

  const checkedInCount = bookings.filter(
    (booking) => getDisplayStatus(booking) === "CHECKED_IN",
  ).length;
  const checkOutSoonCount = bookings.filter((booking) => {
    if (getDisplayStatus(booking) !== "CHECKED_IN" || !booking.checkout) return false;
    const checkout = new Date(booking.checkout).getTime();
    const now = Date.now();
    return checkout >= now && checkout - now <= 24 * 60 * 60 * 1000;
  }).length;
  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + (booking.totalPrice || 0),
    0,
  );

  async function handleCheckIn(booking: RoomBookingResponse) {
    if (isActionBusy) return;
    setActionId(booking.id);
    setMessage(null);
    try {
      const updated = await checkInRoomBooking(booking.id);
      setBookings((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
      setMessage(`Đã check-in booking ${shortCode(updated.id)}.`);
    } catch {
      setMessage(
        "Không thể check-in booking này. Kiểm tra trạng thái booking và quyền BOOKING_CHECKIN.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleCheckOut(booking: RoomBookingResponse) {
    if (isActionBusy) return;
    setActionId(booking.id);
    setMessage(null);
    try {
      const updated = await checkOutRoomBooking(booking.id);
      setBookings((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
      setMessage(`Đã check-out booking ${shortCode(updated.id)}.`);
    } catch {
      setMessage(
        "Không thể check-out booking này. Chỉ booking đang ở mới được trả phòng.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleMockConfirmPayment(booking: RoomBookingResponse) {
    if (isActionBusy) return;
    setActionId(booking.id);
    setMessage(null);
    try {
      const paymentRequest = await getLatestPaymentRequestByBooking(booking.id);
      await mockPaymentRequestPaid(paymentRequest.id);
      setActionId(null);
      await loadData();
      setMessage(`Đã xác nhận chuyển khoản cho booking ${shortCode(booking.id)}.`);
    } catch {
      setMessage(
        "Không thể xác nhận chuyển khoản. Kiểm tra payment request, billing-service và quyền PAYMENT_CONFIRM.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleApproveCancellation(booking: RoomBookingResponse) {
    if (isActionBusy) return;
    setActionId(booking.id);
    setMessage(null);
    try {
      const updated = await approveRoomBookingCancellation(booking.id);
      setBookings((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
      setMessage(`Đã duyệt hủy booking ${shortCode(updated.id)}. Vui lòng xử lý hoàn tiền thủ công nếu có.`);
    } catch {
      setMessage(
        "Không thể duyệt hủy booking này. Kiểm tra trạng thái booking và quyền BOOKING_CANCEL.",
      );
    } finally {
      setActionId(null);
    }
  }

  if (!canViewBookings) {
    return (
      <PermissionDenied message="Bạn không có quyền BOOKING_VIEW để xem danh sách đặt phòng." />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#decdb9] bg-white/80 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-[#9b5c24] uppercase">
              Quản lý đặt phòng
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17213a]">
              Check-in / Check-out
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#7c6f63]">
              Theo dõi trạng thái đặt phòng và xử lý khách nhận phòng, trả phòng từ dữ
              liệu booking thật.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => void loadData()}
            disabled={loading || isActionBusy}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Tổng booking"
          value={bookings.length.toString()}
          icon={<CalendarDays className="h-4 w-4" />}
          sub="Từ hệ thống booking"
        />
        <MetricCard
          title="Đang ở"
          value={checkedInCount.toString()}
          icon={<BedDouble className="h-4 w-4" />}
          sub={`${checkOutSoonCount} phòng sắp checkout`}
        />
        <MetricCard
          title="Doanh thu booking"
          value={formatCompactMoney(totalRevenue)}
          icon={<BadgeDollarSign className="h-4 w-4" />}
          sub="Tổng giá trị booking"
        />
        <MetricCard
          title="Chờ xử lý"
          value={bookings
            .filter((booking) => getDisplayStatus(booking) === "PENDING")
            .length.toString()}
          icon={<UserRound className="h-4 w-4" />}
          sub="Chưa xác nhận tiền cọc"
        />
      </div>

      {message ? (
        <div className="rounded-xl bg-[#fff6df] p-3 text-sm text-[#8a5724]">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#17213a]">
                Danh sách đặt phòng
              </h3>
              <p className="text-sm text-[#7c6f63]">
                Tìm kiếm, lọc trạng thái và thao tác nhanh.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative w-full md:w-72">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9b5c24]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm theo mã, khách, phòng..."
                  className="pl-9"
                />
              </div>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as DisplayStatus | "ALL")
                }
                className="rounded-md border border-[#decdb9] bg-white px-3 py-2 text-sm text-[#17213a]"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="CANCEL_REQUESTED">Yêu cầu hủy</option>
                <option value="CHECKED_IN">Đang ở</option>
                <option value="CHECKED_OUT">Đã trả phòng</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#decdb9] text-left text-[#7c6f63]">
                  <th className="py-3 pr-4 font-medium">Mã</th>
                  <th className="py-3 pr-4 font-medium">Khách</th>
                  <th className="py-3 pr-4 font-medium">Phòng</th>
                  <th className="py-3 pr-4 font-medium">Nhận / Trả</th>
                  <th className="py-3 pr-4 font-medium">Tổng tiền</th>
                  <th className="py-3 pr-4 font-medium">Trạng thái</th>
                  <th className="py-3 pr-4 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => {
                  const displayStatus = getDisplayStatus(booking);
                  return (
                    <tr
                      key={booking.id}
                      className="border-b border-[#eee3d5] last:border-b-0"
                    >
                      <td className="py-4 pr-4 font-medium text-[#17213a]">
                        {shortCode(booking.id)}
                      </td>
                      <td className="py-4 pr-4 text-[#5f5144]">{booking.customerId}</td>
                      <td className="py-4 pr-4 text-[#5f5144]">
                        {roomNames[booking.roomId] ?? booking.roomId}
                      </td>
                      <td className="py-4 pr-4 text-[#5f5144]">
                        <div>{formatDateTime(booking.checkin)}</div>
                        <div className="text-xs text-[#9f8a77]">
                          → {formatDateTime(booking.checkout)}
                        </div>
                        {booking.checkinReality ? (
                          <div className="mt-1 text-xs text-green-700">
                            Thực nhận: {formatDateTime(booking.checkinReality)}
                          </div>
                        ) : null}
                        {booking.checkoutReality ? (
                          <div className="text-xs text-slate-600">
                            Thực trả: {formatDateTime(booking.checkoutReality)}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-4 pr-4 text-[#5f5144]">
                        {formatMoney(booking.totalPrice)}
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(displayStatus)}`}
                        >
                          {statusLabel[displayStatus]}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        {displayStatus === "PENDING" ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={!canConfirmPayment || isActionBusy}
                            onClick={() => void handleMockConfirmPayment(booking)}
                            className="gap-2"
                          >
                            <CreditCard className="h-4 w-4" />
                            Xác nhận CK
                          </Button>
                        ) : displayStatus === "CONFIRMED" ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={!canCheckIn || isActionBusy}
                            onClick={() => router.push(`/bookings/${booking.id}/checkin`)}
                            className="gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Check-in
                          </Button>
                        ) : displayStatus === "CANCEL_REQUESTED" ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={!canCancelBooking || isActionBusy}
                            onClick={() => void handleApproveCancellation(booking)}
                            className="gap-2 bg-[#8a5724] hover:bg-[#70451c]"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Duyệt hủy
                          </Button>
                        ) : displayStatus === "CHECKED_IN" ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={!canCheckOut || isActionBusy}
                            onClick={() => void handleCheckOut(booking)}
                            className="gap-2 bg-[#5f5144] hover:bg-[#4c4036]"
                          >
                            <LogOut className="h-4 w-4" />
                            Check-out
                          </Button>
                        ) : (
                          <span className="text-xs text-[#9f8a77]">
                            Không có thao tác
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!loading && filtered.length === 0 ? (
              <div className="py-10 text-center text-[#7c6f63]">
                Không tìm thấy booking nào phù hợp.
              </div>
            ) : null}
            {loading ? (
              <div className="py-10 text-center text-[#7c6f63]">Đang tải booking...</div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#17213a]">
              <Filter className="h-4 w-4" /> Bộ lọc nhanh
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {statusButtons.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setStatus(item.value)}
                  className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                    status === item.value
                      ? "border-[#9b5c24] bg-[#fff6df] text-[#8a5724]"
                      : "border-[#decdb9] bg-[#fbf6ed] text-[#5f5144] hover:bg-[#f4eadc]"
                  }`}
                >
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-xs opacity-70">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[#17213a]">Booking đang chú ý</h3>
            <div className="mt-4 space-y-4">
              {bookings.slice(0, 4).map((booking) => {
                const displayStatus = getDisplayStatus(booking);
                return (
                  <div
                    key={booking.id}
                    className="rounded-xl border border-[#eee3d5] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[#17213a]">
                          {shortCode(booking.id)}
                        </div>
                        <div className="text-sm text-[#7c6f63]">
                          {roomNames[booking.roomId] ?? booking.roomId}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(displayStatus)}`}
                      >
                        {statusLabel[displayStatus]}
                      </span>
                    </div>
                    <div className="mt-3 flex justify-between text-sm text-[#7c6f63]">
                      <span>{formatDateTime(booking.checkin)}</span>
                      <span>{formatMoney(booking.totalPrice)}</span>
                    </div>
                  </div>
                );
              })}
              {!loading && bookings.length === 0 ? (
                <p className="text-sm text-[#7c6f63]">Chưa có booking nào.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#7c6f63]">{title}</p>
        <div className="rounded-full bg-[#fff6df] p-2 text-[#9b5c24]">{icon}</div>
      </div>
      <div className="mt-4 text-3xl font-bold text-[#17213a]">{value}</div>
      <p className="mt-1 text-xs text-[#7c6f63]">{sub}</p>
    </div>
  );
}

const statusButtons = [
  { value: "ALL" as const, label: "Tất cả", desc: "Xem toàn bộ booking" },
  { value: "PENDING" as const, label: "Chờ xác nhận", desc: "Chưa ghi nhận cọc" },
  { value: "CONFIRMED" as const, label: "Đã xác nhận", desc: "Sẵn sàng check-in" },
  { value: "CANCEL_REQUESTED" as const, label: "Yêu cầu hủy", desc: "Chờ duyệt hủy" },
  { value: "CHECKED_IN" as const, label: "Đang ở", desc: "Khách đang lưu trú" },
  { value: "CHECKED_OUT" as const, label: "Đã trả phòng", desc: "Hoàn tất" },
  { value: "CANCELLED" as const, label: "Đã hủy", desc: "Booking bị hủy" },
];

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

function formatCompactMoney(value: number) {
  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}M`;
  }
  return formatMoney(value);
}
