"use client";

import {
  Activity,
  BedDouble,
  CalendarCheck,
  CircleDollarSign,
  ClipboardCheck,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { usePermission } from "@/hooks/use-permission";
import {
  getRoomBookings,
  type RoomBookingResponse,
} from "@/services/booking-service";
import {
  getRevenueSummary,
  type RevenueSummaryResponse,
} from "@/services/report-service";
import { getAllRooms } from "@/services/room-service";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatCurrency(value = 0) {
  return currencyFormatter.format(value);
}

function formatCompactCurrency(value = 0) {
  if (value === 0) return "0đ";
  return `${compactNumberFormatter.format(value)}đ`;
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDefaultRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - 6);
  return {
    from: toDateInputValue(from),
    to: toDateInputValue(to),
  };
}

function getDatePart(value?: string) {
  return value?.slice(0, 10) ?? "";
}

function getTimePart(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isSameDay(value: string | undefined, dateValue: string) {
  return getDatePart(value) === dateValue;
}

function bookingStatusLabel(status: RoomBookingResponse["status"]) {
  const labels: Record<RoomBookingResponse["status"], string> = {
    PENDING: "Chờ xác nhận",
    DEPOSITED: "Đã thanh toán",
    CANCEL_REQUESTED: "Yêu cầu hủy",
    CHECKED_IN: "Đang lưu trú",
    CANCEL: "Đã hủy",
    DONE: "Hoàn tất",
  };
  return labels[status] ?? status;
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <div className="group overflow-hidden rounded-[1.5rem] border border-[#decdb9] bg-white/72 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl dark:border-[#3a2e24] dark:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#75695d] dark:text-[#b7a99a]">
            {label}
          </p>
          <p className="mt-3 text-4xl font-black tracking-tight">{value}</p>
        </div>
        <div className={`rounded-2xl bg-gradient-to-br ${tone} p-3 text-white shadow-lg`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#5f7f24] dark:text-[#a8d86b]">
        <TrendingUp className="h-3.5 w-3.5" />
        {detail}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { has } = usePermission();
  const { from: defaultFrom, to: defaultTo } = useMemo(getDefaultRange, []);

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [summary, setSummary] = useState<RevenueSummaryResponse | null>(null);
  const [bookings, setBookings] = useState<RoomBookingResponse[]>([]);
  const [roomTotal, setRoomTotal] = useState(0);
  const [roomNames, setRoomNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const canViewRevenue = has("REVENUE_VIEW");

  const loadDashboard = useCallback(async () => {
    if (!canViewRevenue) return;

    setIsLoading(true);
    setErrorMessage("");
    try {
      const [revenueData, bookingData, roomData] = await Promise.all([
        getRevenueSummary(fromDate, toDate),
        getRoomBookings(),
        getAllRooms(0, 500).catch(() => ({ data: [], total: 0 })),
      ]);

      setSummary(revenueData);
      setBookings(bookingData);
      setRoomTotal(roomData.total);
      setRoomNames(
        Object.fromEntries(
          roomData.data
            .filter((room) => room.id)
            .map((room) => [room.id as string, room.name]),
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [canViewRevenue, fromDate, toDate]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const today = toDateInputValue(new Date());
  const pendingBookings = bookings.filter((booking) => booking.status === "PENDING");
  const activeBookings = bookings.filter(
    (booking) => booking.status === "PENDING" || booking.status === "DEPOSITED" || booking.status === "CHECKED_IN",
  );
  const occupiedRoomIds = new Set(activeBookings.map((booking) => booking.roomId));
  const availableRooms = Math.max(roomTotal - occupiedRoomIds.size, 0);
  const occupancyRate =
    roomTotal > 0 ? Math.round((occupiedRoomIds.size / roomTotal) * 100) : 0;
  const checkoutTodayCount = bookings.filter(
    (booking) =>
      booking.status === "DONE" &&
      (isSameDay(booking.checkoutReality, today) || isSameDay(booking.checkout, today)),
  ).length;
  const urgentTaskCount =
    pendingBookings.length +
    (summary?.checkedInBookingCount ?? 0) +
    checkoutTodayCount;

  const dailyRevenue = summary?.dailyRevenue ?? [];
  const maxDailyRevenue = Math.max(...dailyRevenue.map((item) => item.amount), 1);

  const recentBookings = [...bookings]
    .sort((a, b) => {
      const aTime = new Date(a.checkinReality ?? a.checkin ?? "").getTime();
      const bTime = new Date(b.checkinReality ?? b.checkin ?? "").getTime();
      return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    })
    .slice(0, 4);

  const metrics = [
    {
      label: "Doanh thu hôm nay",
      value: formatCompactCurrency(summary?.todayCollected ?? 0),
      detail: `Tổng kỳ này ${formatCurrency(summary?.totalCollected ?? 0)}`,
      icon: <CircleDollarSign className="h-5 w-5" />,
      tone: "from-[#9b5c24] to-[#d9a25f]",
    },
    {
      label: "Phòng còn trống",
      value: availableRooms,
      detail: `${occupiedRoomIds.size}/${roomTotal} phòng đang có booking hiệu lực`,
      icon: <BedDouble className="h-5 w-5" />,
      tone: "from-[#164e63] to-[#22d3ee]",
    },
    {
      label: "Booking trong kỳ",
      value: summary?.bookingCount ?? bookings.length,
      detail: `${pendingBookings.length} booking chờ xác nhận`,
      icon: <CalendarCheck className="h-5 w-5" />,
      tone: "from-[#365314] to-[#84cc16]",
    },
    {
      label: "Khách đang lưu trú",
      value: summary?.checkedInBookingCount ?? 0,
      detail: `${checkoutTodayCount} booking checkout hôm nay`,
      icon: <Users className="h-5 w-5" />,
      tone: "from-[#7c2d12] to-[#fb923c]",
    },
  ];

  const operations = [
    {
      label: "Xác nhận booking",
      value: pendingBookings.length,
      status: "Các booking đang chờ xác nhận thanh toán.",
    },
    {
      label: "Khách đang lưu trú",
      value: summary?.checkedInBookingCount ?? 0,
      status: "Theo trạng thái check-in thực tế.",
    },
    {
      label: "Checkout hôm nay",
      value: checkoutTodayCount,
      status: "Cần rà soát phòng và hóa đơn khi trả phòng.",
    },
    {
      label: "Doanh thu dịch vụ",
      value: formatCompactCurrency(summary?.serviceRevenue ?? 0),
      status: "Tổng dịch vụ trong kỳ lọc hiện tại.",
    },
  ];

  if (!canViewRevenue) {
    return <PermissionDenied message="Bạn không có quyền REVENUE_VIEW để xem dashboard doanh thu." />;
  }

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#decdb9] bg-[#23170f] p-6 text-white shadow-[0_30px_80px_-50px_rgba(35,23,15,0.9)] lg:p-8 dark:border-[#3a2e24]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(232,201,144,0.35),transparent_28%),radial-gradient(circle_at_88%_0%,rgba(255,255,255,0.14),transparent_24%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.32em] text-[#e8c990] uppercase">
              Daily command center
            </p>
            <h2 className="mt-3 max-w-3xl font-serif text-5xl leading-[0.95] font-bold tracking-tight lg:text-7xl">
              Điều hành khách sạn trong một màn hình.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-[#eadbc4]">
              Dashboard ưu tiên nghiệp vụ vận hành: doanh thu, booking cần xử lý,
              phòng đang giữ chỗ, khách đang lưu trú và checkout trong ngày.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#e8c990] p-3 text-[#23170f]">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Tình trạng hôm nay</p>
                <p className="text-xs text-[#d9bf9a]">
                  Dữ liệu tổng hợp từ booking, room và report service.
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/[0.08] p-3">
                <p className="text-2xl font-bold">{occupancyRate}%</p>
                <p className="text-[11px] text-[#d9bf9a]">Công suất</p>
              </div>
              <div className="rounded-2xl bg-white/[0.08] p-3">
                <p className="text-2xl font-bold">{summary?.paymentCount ?? 0}</p>
                <p className="text-[11px] text-[#d9bf9a]">Thanh toán</p>
              </div>
              <div className="rounded-2xl bg-white/[0.08] p-3">
                <p className="text-2xl font-bold">{urgentTaskCount}</p>
                <p className="text-[11px] text-[#d9bf9a]">Việc cần xử lý</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[#decdb9] bg-white/72 p-4 shadow-sm backdrop-blur dark:border-[#3a2e24] dark:bg-white/[0.05]">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="space-y-2 text-xs font-bold tracking-[0.18em] text-[#75695d] uppercase dark:text-[#b7a99a]">
            Từ ngày
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="h-11 w-full rounded-xl border border-[#decdb9] bg-white px-3 text-sm normal-case tracking-normal text-[#111827] outline-none focus:border-[#9b5c24] dark:border-[#3a2e24] dark:bg-[#17130f] dark:text-white"
            />
          </label>
          <label className="space-y-2 text-xs font-bold tracking-[0.18em] text-[#75695d] uppercase dark:text-[#b7a99a]">
            Đến ngày
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="h-11 w-full rounded-xl border border-[#decdb9] bg-white px-3 text-sm normal-case tracking-normal text-[#111827] outline-none focus:border-[#9b5c24] dark:border-[#3a2e24] dark:bg-[#17130f] dark:text-white"
            />
          </label>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#9b5c24] px-5 text-sm font-black tracking-[0.12em] text-white uppercase shadow-lg transition hover:bg-[#7f4619] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Tải lại
          </button>
        </div>
        {errorMessage ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-[#decdb9] bg-white/72 p-6 shadow-sm backdrop-blur dark:border-[#3a2e24] dark:bg-white/[0.05]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-3xl font-bold">Việc cần làm</h3>
              <p className="text-sm text-[#75695d] dark:text-[#b7a99a]">
                Các tác vụ ảnh hưởng trực tiếp tới vận hành.
              </p>
            </div>
            <ClipboardCheck className="h-6 w-6 text-[#9b5c24] dark:text-[#d7a25f]" />
          </div>
          <div className="mt-5 space-y-3">
            {operations.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[#eadfcd] bg-[#fbf7ef] p-4 dark:border-[#3a2e24] dark:bg-[#17130f]"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold">{item.label}</p>
                  <span className="rounded-full bg-[#23170f] px-3 py-1 text-sm font-black text-white dark:bg-[#e8c990] dark:text-[#23170f]">
                    {item.value}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#75695d] dark:text-[#b7a99a]">
                  {item.status}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[#decdb9] bg-white/72 p-6 shadow-sm backdrop-blur dark:border-[#3a2e24] dark:bg-white/[0.05]">
          <div>
            <h3 className="font-serif text-3xl font-bold">Doanh thu 7 ngày</h3>
            <p className="text-sm text-[#75695d] dark:text-[#b7a99a]">
              Dựa trên lịch sử thanh toán đã ghi nhận trong billing-service.
            </p>
          </div>
          <div className="mt-8 flex h-72 items-end gap-3 rounded-[1.5rem] border border-[#eadfcd] bg-[#fbf7ef] p-5 dark:border-[#3a2e24] dark:bg-[#17130f]">
            {dailyRevenue.length > 0 ? (
              dailyRevenue.map((item) => (
                <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-3">
                  <div
                    title={`${item.date}: ${formatCurrency(item.amount)}`}
                    className="w-full rounded-t-2xl bg-gradient-to-t from-[#9b5c24] to-[#e8c990] shadow-[0_18px_35px_-28px_rgba(155,92,36,0.9)]"
                    style={{ height: `${Math.max((item.amount / maxDailyRevenue) * 100, 4)}%` }}
                  />
                  <span className="truncate text-xs font-bold text-[#75695d] dark:text-[#b7a99a]">
                    {item.date.slice(5)}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#75695d] dark:text-[#b7a99a]">
                Chưa có doanh thu trong khoảng ngày này.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[#decdb9] bg-white/72 p-6 shadow-sm backdrop-blur dark:border-[#3a2e24] dark:bg-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#eadfcd] p-3 text-[#9b5c24] dark:bg-[#2a211a] dark:text-[#d7a25f]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-3xl font-bold">Hoạt động mới</h3>
              <p className="text-sm text-[#75695d] dark:text-[#b7a99a]">
                Booking gần nhất theo dữ liệu hiện có.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border-b border-[#eadfcd] pb-4 last:border-b-0 dark:border-[#3a2e24]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">
                        {roomNames[booking.roomId] ?? `Phòng ${booking.roomId.slice(0, 8)}`}
                      </p>
                      <p className="text-sm text-[#75695d] dark:text-[#b7a99a]">
                        {bookingStatusLabel(booking.status)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#9b5c24] dark:text-[#d7a25f]">
                      {getTimePart(booking.checkinReality ?? booking.checkin) || getDatePart(booking.checkin)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-black">
                    {formatCurrency(booking.totalPrice)}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-[#eadfcd] bg-[#fbf7ef] p-4 text-sm font-semibold text-[#75695d] dark:border-[#3a2e24] dark:bg-[#17130f] dark:text-[#b7a99a]">
                Chưa có booking để hiển thị.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
