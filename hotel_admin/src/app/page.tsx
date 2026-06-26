"use client";

import {
  AlertTriangle,
  BedDouble,
  CalendarCheck,
  CalendarClock,
  CircleDollarSign,
  ClipboardCheck,
  DoorOpen,
  LogOut,
  ReceiptText,
  RefreshCcw,
  Users,
  Utensils,
} from "lucide-react";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { DatePicker } from "@/components/ui/date-picker";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { ToastBridge } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { getRoomBookings, type RoomBookingResponse } from "@/services/booking-service";
import {
  getRevenueSummary,
  type RevenueSummaryResponse,
} from "@/services/report-service";
import { getAllRooms } from "@/services/room-service";
import {
  getServiceOrderDetails,
  type ServiceOrderDetailResponse,
} from "@/services/service-order-service";
import {
  getStaffActivitySessions,
  type StaffActivitySessionResponse,
} from "@/services/staff-activity-service";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

function getMonthStartValue(date = new Date()) {
  return toDateInputValue(new Date(date.getFullYear(), date.getMonth(), 1));
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

function isCheckedIn(booking: RoomBookingResponse) {
  return booking.status === "CHECKED_IN" || booking.detailStatus === "CHECKED_IN";
}

function isReadyToCheckInToday(booking: RoomBookingResponse, today: string) {
  return (
    booking.status === "DEPOSITED" &&
    booking.detailStatus === "BOOKED" &&
    isSameDay(booking.checkin, today)
  );
}

function isReadyToCheckOutToday(booking: RoomBookingResponse, today: string) {
  return isCheckedIn(booking) && isSameDay(booking.checkout, today);
}

function bookingStatusLabel(status: RoomBookingResponse["status"]) {
  const labels: Record<RoomBookingResponse["status"], string> = {
    PENDING: "Chờ thanh toán",
    DEPOSITED: "Đã xác nhận",
    CANCEL_REQUESTED: "Yêu cầu hủy",
    CHECKED_IN: "Đang ở",
    CANCEL: "Đã hủy",
    DONE: "Hoàn tất",
  };
  return labels[status] ?? status;
}

export default function DashboardPage() {
  const { has } = usePermission();
  const { from: defaultFrom, to: defaultTo } = useMemo(getDefaultRange, []);
  const today = useMemo(() => toDateInputValue(new Date()), []);
  const monthStart = useMemo(() => getMonthStartValue(new Date()), []);

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [summary, setSummary] = useState<RevenueSummaryResponse | null>(null);
  const [todaySummary, setTodaySummary] = useState<RevenueSummaryResponse | null>(null);
  const [monthSummary, setMonthSummary] = useState<RevenueSummaryResponse | null>(null);
  const [bookings, setBookings] = useState<RoomBookingResponse[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrderDetailResponse[]>([]);
  const [staffSessions, setStaffSessions] = useState<StaffActivitySessionResponse[]>([]);
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
      const [
        rangeRevenue,
        todayRevenue,
        monthRevenue,
        bookingData,
        roomData,
        serviceOrderData,
        staffSessionData,
      ] =
        await Promise.all([
          getRevenueSummary(fromDate, toDate),
          getRevenueSummary(today, today),
          getRevenueSummary(monthStart, today),
          getRoomBookings(),
          getAllRooms(0, 500).catch(() => ({ data: [], total: 0 })),
          getServiceOrderDetails(undefined).catch(() => []),
          getStaffActivitySessions().catch(() => []),
        ]);

      setSummary(rangeRevenue);
      setTodaySummary(todayRevenue);
      setMonthSummary(monthRevenue);
      setBookings(bookingData);
      setServiceOrders(serviceOrderData);
      setStaffSessions(staffSessionData);
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
        error instanceof Error ? error.message : "Không thể tải dữ liệu dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [canViewRevenue, fromDate, monthStart, today, toDate]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const checkedInBookings = bookings.filter(isCheckedIn);
  const checkedInRoomIds = new Set(checkedInBookings.map((booking) => booking.roomId));
  const checkInTodayBookings = bookings.filter((booking) =>
    isReadyToCheckInToday(booking, today),
  );
  const checkOutTodayBookings = bookings.filter((booking) =>
    isReadyToCheckOutToday(booking, today),
  );
  const cancelRequestedBookings = bookings.filter(
    (booking) => booking.status === "CANCEL_REQUESTED",
  );
  const pendingPaymentBookings = bookings.filter((booking) => booking.status === "PENDING");
  const pendingServiceOrders = serviceOrders.filter(
    (item) =>
      item.status === "WAITING" &&
      item.approvalStatus !== "REJECTED" &&
      item.source !== "INCLUDED",
  );
  const pendingServiceApprovals = serviceOrders.filter(
    (item) => item.approvalStatus === "PENDING",
  );
  const activeStaffSessions = staffSessions.filter((item) => item.status === "ACTIVE");
  const occupancyRate =
    roomTotal > 0 ? Math.round((checkedInRoomIds.size / roomTotal) * 100) : 0;
  const todayRevenue = todaySummary?.totalCollected ?? todaySummary?.todayCollected ?? 0;
  const monthRevenue = monthSummary?.totalCollected ?? 0;

  const dailyRevenue = summary?.dailyRevenue ?? [];
  const maxDailyRevenue = Math.max(...dailyRevenue.map((item) => item.amount), 1);

  const upcomingOperations = [
    ...checkInTodayBookings.map((booking) => ({
      id: `checkin-${booking.id}`,
      time: getTimePart(booking.checkin),
      title: "Sắp check-in",
      room: roomNames[booking.roomId] ?? `Phòng ${booking.roomId.slice(0, 8)}`,
      status: bookingStatusLabel(booking.status),
      amount: booking.totalPrice,
      tone: "bg-sky-100 text-sky-700",
    })),
    ...checkOutTodayBookings.map((booking) => ({
      id: `checkout-${booking.id}`,
      time: getTimePart(booking.checkout),
      title: "Sắp check-out",
      room: roomNames[booking.roomId] ?? `Phòng ${booking.roomId.slice(0, 8)}`,
      status: bookingStatusLabel(booking.status),
      amount: booking.totalPrice,
      tone: "bg-emerald-100 text-emerald-700",
    })),
    ...cancelRequestedBookings.map((booking) => ({
      id: `cancel-${booking.id}`,
      time: getTimePart(booking.checkin) || getDatePart(booking.checkin),
      title: "Chờ duyệt hủy",
      room: roomNames[booking.roomId] ?? `Phòng ${booking.roomId.slice(0, 8)}`,
      status: bookingStatusLabel(booking.status),
      amount: booking.totalPrice,
      tone: "bg-orange-100 text-orange-700",
    })),
  ].slice(0, 8);

  const metrics = [
    {
      label: "Phòng đang ở",
      value: checkedInRoomIds.size,
      detail: `${checkedInBookings.length} booking đang lưu trú`,
      icon: <Users className="h-5 w-5" />,
      tone: "bg-[#2563eb]",
    },
    {
      label: "Sắp check-in hôm nay",
      value: checkInTodayBookings.length,
      detail: "Booking đã xác nhận, còn chờ nhận phòng",
      icon: <DoorOpen className="h-5 w-5" />,
      tone: "bg-[#0f766e]",
    },
    {
      label: "Sắp check-out hôm nay",
      value: checkOutTodayBookings.length,
      detail: "Phòng đang ở có lịch trả trong ngày",
      icon: <LogOut className="h-5 w-5" />,
      tone: "bg-[#7c3aed]",
    },
    {
      label: "Booking chờ duyệt hủy",
      value: cancelRequestedBookings.length,
      detail: "Cần admin hoặc quản lý xử lý",
      icon: <AlertTriangle className="h-5 w-5" />,
      tone: "bg-[#ea580c]",
    },
    {
      label: "Dịch vụ chờ phục vụ",
      value: pendingServiceOrders.length,
      detail: `${pendingServiceApprovals.length} yêu cầu đang chờ duyệt`,
      icon: <Utensils className="h-5 w-5" />,
      tone: "bg-[#b45309]",
    },
    {
      label: "Nhân viên trong ca",
      value: activeStaffSessions.length,
      detail: "Phiên đăng nhập/chấm công đang mở",
      icon: <Users className="h-5 w-5" />,
      tone: "bg-[#155e75]",
    },
    {
      label: "Doanh thu hôm nay",
      value: formatCompactCurrency(todayRevenue),
      detail: `${todaySummary?.paymentCount ?? 0} thanh toán đã ghi nhận`,
      icon: <CircleDollarSign className="h-5 w-5" />,
      tone: "bg-[#9b5c24]",
    },
    {
      label: "Doanh thu tháng này",
      value: formatCompactCurrency(monthRevenue),
      detail: `Từ ${monthStart} đến ${today}`,
      icon: <ReceiptText className="h-5 w-5" />,
      tone: "bg-[#365314]",
    },
  ];

  if (!canViewRevenue) {
    return (
      <PermissionDenied message="Bạn không có quyền REVENUE_VIEW để xem dashboard vận hành." />
    );
  }

  return (
    <div className="space-y-7">
      <section className="rounded-2xl border border-[#decdb9] bg-white/86 p-6 shadow-sm dark:border-[#3a2e24] dark:bg-white/[0.05]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-[#9b5c24] uppercase">
              Dashboard vận hành
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#17213a] dark:text-white">
              Theo dõi tình trạng khách sạn hôm nay
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#75695d] dark:text-[#b7a99a]">
              Các chỉ số tập trung vào ca trực: phòng đang ở, lịch nhận/trả phòng,
              booking chờ duyệt hủy và doanh thu đã ghi nhận.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatusPill label="Công suất" value={`${occupancyRate}%`} />
            <StatusPill label="Phòng đang ở" value={`${checkedInRoomIds.size}/${roomTotal}`} />
            <StatusPill label="Chờ thanh toán" value={pendingPaymentBookings.length} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#decdb9] bg-white/82 p-4 shadow-sm dark:border-[#3a2e24] dark:bg-white/[0.05]">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <DatePicker label="Từ ngày" value={fromDate} onChange={setFromDate} />
          <DatePicker label="Đến ngày" value={toDate} onChange={setToDate} />
          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#9b5c24] px-5 text-sm font-black tracking-[0.12em] text-white uppercase shadow-sm transition hover:bg-[#7f4619] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Tải lại
          </button>
        </div>
        {errorMessage ? (
          <ToastBridge error={errorMessage} onClearError={() => setErrorMessage("")} />
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-2xl border border-[#decdb9] bg-white/82 p-6 shadow-sm dark:border-[#3a2e24] dark:bg-white/[0.05]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-[#17213a] dark:text-white">
                Lịch vận hành hôm nay
              </h3>
              <p className="mt-1 text-sm text-[#75695d] dark:text-[#b7a99a]">
                Check-in, check-out và yêu cầu hủy cần xử lý trong ca.
              </p>
            </div>
            <ClipboardCheck className="h-6 w-6 text-[#9b5c24] dark:text-[#d7a25f]" />
          </div>

          <div className="mt-5 space-y-3">
            {upcomingOperations.length > 0 ? (
              upcomingOperations.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#eadfcd] bg-[#fbf7ef] p-4 dark:border-[#3a2e24] dark:bg-[#17130f]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${item.tone}`}
                      >
                        {item.title}
                      </span>
                      <p className="mt-3 font-black text-[#17213a] dark:text-white">
                        {item.room}
                      </p>
                      <p className="mt-1 text-xs text-[#75695d] dark:text-[#b7a99a]">
                        {item.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#9b5c24] dark:text-[#d7a25f]">
                        {item.time || "-"}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-[#75695d] dark:text-[#b7a99a]">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="Hôm nay chưa có lịch check-in, check-out hoặc yêu cầu hủy cần xử lý." />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#decdb9] bg-white/82 p-6 shadow-sm dark:border-[#3a2e24] dark:bg-white/[0.05]">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-2xl font-black text-[#17213a] dark:text-white">
                Doanh thu theo bộ lọc
              </h3>
              <p className="mt-1 text-sm text-[#75695d] dark:text-[#b7a99a]">
                Dùng để nhìn xu hướng trong khoảng ngày đang chọn.
              </p>
            </div>
            <div className="rounded-2xl bg-[#fbf7ef] px-4 py-3 text-right dark:bg-[#17130f]">
              <p className="text-xs font-bold text-[#75695d] dark:text-[#b7a99a]">
                Tổng kỳ lọc
              </p>
              <p className="text-lg font-black text-[#17213a] dark:text-white">
                {formatCurrency(summary?.totalCollected ?? 0)}
              </p>
            </div>
          </div>

          <div className="mt-8 flex h-72 items-end gap-3 rounded-2xl border border-[#eadfcd] bg-[#fbf7ef] p-5 dark:border-[#3a2e24] dark:bg-[#17130f]">
            {dailyRevenue.length > 0 ? (
              dailyRevenue.map((item) => (
                <div
                  key={item.date}
                  className="flex min-w-0 flex-1 flex-col items-center gap-3"
                >
                  <div
                    title={`${item.date}: ${formatCurrency(item.amount)}`}
                    className="w-full rounded-t-2xl bg-[#9b5c24] shadow-sm"
                    style={{
                      height: `${Math.max((item.amount / maxDailyRevenue) * 100, 4)}%`,
                    }}
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
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <OperationCard
          icon={<CalendarCheck className="h-5 w-5" />}
          label="Check-in hôm nay"
          value={checkInTodayBookings.length}
          detail="Booking đã thanh toán, cần lễ tân đón khách."
        />
        <OperationCard
          icon={<CalendarClock className="h-5 w-5" />}
          label="Check-out hôm nay"
          value={checkOutTodayBookings.length}
          detail="Cần rà soát dịch vụ phát sinh và hóa đơn."
        />
        <OperationCard
          icon={<BedDouble className="h-5 w-5" />}
          label="Phòng còn trống"
          value={Math.max(roomTotal - checkedInRoomIds.size, 0)}
          detail="Tính theo phòng đang có khách ở thực tế."
        />
      </section>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf7ef] px-4 py-3 dark:border-[#3a2e24] dark:bg-[#17130f]">
      <p className="text-xs font-bold text-[#75695d] dark:text-[#b7a99a]">{label}</p>
      <p className="mt-1 text-xl font-black text-[#17213a] dark:text-white">{value}</p>
    </div>
  );
}

function OperationCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-[#decdb9] bg-white/82 p-5 shadow-sm dark:border-[#3a2e24] dark:bg-white/[0.05]">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-[#fff6df] p-3 text-[#9b5c24] dark:bg-[#2a211a] dark:text-[#d7a25f]">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-[#75695d] dark:text-[#b7a99a]">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-[#17213a] dark:text-white">
            {value}
          </p>
          <p className="mt-2 text-xs font-semibold text-[#75695d] dark:text-[#b7a99a]">
            {detail}
          </p>
        </div>
      </div>
    </div>
  );
}


