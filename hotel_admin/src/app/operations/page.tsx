"use client";

import {
  AlertTriangle,
  BedDouble,
  CalendarCheck,
  ClipboardList,
  Clock3,
  DoorOpen,
  RefreshCcw,
  UserCheck,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ToastBridge } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import { getRoomBookings, type RoomBookingResponse } from "@/services/booking-service";
import {
  getAllRooms,
  type HousekeepingStatus,
  type RoomResponse,
} from "@/services/room-service";
import {
  getServiceOrderDetails,
  type ServiceOrderDetailResponse,
} from "@/services/service-order-service";
import {
  getStaffActivitySessions,
  type StaffActivitySessionResponse,
} from "@/services/staff-activity-service";

type OperationTab = "ALL" | "ROOM" | "SERVICE" | "BOOKING" | "LATE";

type OperationItem = {
  id: string;
  type: "ROOM" | "SERVICE" | "BOOKING";
  title: string;
  subtitle: string;
  status: string;
  owner: string;
  timeLabel: string;
  lateMinutes: number;
  href: string;
  tone: string;
};

const moneyFormatter = new Intl.NumberFormat("vi-VN");

function formatMoney(value?: number | null) {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${moneyFormatter.format(value)} đ`;
}

function dateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDatePart(value?: string) {
  return value?.slice(0, 10) ?? "";
}

function getTimePart(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "-";
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function minutesSince(value?: string, now = new Date()) {
  if (!value) return 0;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 0;
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60000));
}

function minutesLateFromDue(value?: string, now = new Date()) {
  if (!value) return 0;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 0;
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60000));
}

function lateLabel(minutes: number) {
  if (minutes <= 0) return "Đúng hạn";
  if (minutes < 60) return `Trễ ${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `Trễ ${hours} giờ${mins ? ` ${mins} phút` : ""}`;
}

function bookingCode(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function isCheckedIn(booking: RoomBookingResponse) {
  return booking.status === "CHECKED_IN" || booking.detailStatus === "CHECKED_IN";
}

function isReadyToCheckIn(booking: RoomBookingResponse) {
  return booking.status === "DEPOSITED" && booking.detailStatus === "BOOKED";
}

function isReadyToCheckOut(booking: RoomBookingResponse) {
  return isCheckedIn(booking);
}

function roomDisplayName(roomId: string | undefined, roomsById: Map<string, RoomResponse>) {
  if (!roomId) return "Chưa rõ phòng";
  return roomsById.get(roomId)?.name ?? `Phòng ${roomId.slice(0, 8)}`;
}

function housekeepingLabel(status?: HousekeepingStatus) {
  const labels: Record<HousekeepingStatus, string> = {
    CLEAN: "Đã sạch",
    DIRTY: "Cần dọn",
    CLEANING: "Đang dọn",
    INSPECTION: "Cần kiểm tra",
    MAINTENANCE: "Bảo trì",
  };
  return labels[status ?? "CLEAN"] ?? status ?? "Không rõ";
}

function activeStaffName(session: StaffActivitySessionResponse) {
  return session.fullName || session.username;
}

export default function OperationsPage() {
  const permission = usePermission();
  const canOpen = permission.has("ROLE_MANAGER");
  const today = useMemo(() => dateInputValue(new Date()), []);

  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [bookings, setBookings] = useState<RoomBookingResponse[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrderDetailResponse[]>([]);
  const [staffSessions, setStaffSessions] = useState<StaffActivitySessionResponse[]>([]);
  const [tab, setTab] = useState<OperationTab>("ALL");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadOperations = useCallback(async () => {
    if (!canOpen) return;
    setLoading(true);
    setMessage("");
    try {
      const [roomData, bookingData, serviceData, staffData] = await Promise.all([
        getAllRooms(0, 500),
        getRoomBookings(),
        getServiceOrderDetails(undefined),
        getStaffActivitySessions(),
      ]);

      setRooms(roomData.data);
      setBookings(bookingData);
      setServiceOrders(serviceData);
      setStaffSessions(staffData);
    } catch {
      setMessage(
        "Không tải được bảng công việc vận hành. Kiểm tra room-service, booking-service, billing-service, identity-service và quyền manager.",
      );
    } finally {
      setLoading(false);
    }
  }, [canOpen]);

  useEffect(() => {
    void loadOperations();
  }, [loadOperations]);

  const now = useMemo(() => new Date(), [rooms, bookings, serviceOrders, staffSessions]);
  const roomsById = useMemo(
    () => new Map(rooms.filter((room) => room.id).map((room) => [room.id as string, room])),
    [rooms],
  );
  const activeSessions = staffSessions.filter((item) => item.status === "ACTIVE");
  const activeHousekeepers = activeSessions.filter((item) =>
    item.primaryRole?.toUpperCase().includes("HOUSEKEEPING"),
  );

  const roomTasks: OperationItem[] = rooms
    .filter((room) => (room.housekeepingStatus ?? "CLEAN") !== "CLEAN")
    .map((room) => {
      const status = room.housekeepingStatus ?? "CLEAN";
      const lateMinutes =
        status === "DIRTY" || status === "CLEANING" || status === "INSPECTION"
          ? Math.max(0, minutesSince(room.housekeepingUpdatedTime, now) - 240)
          : minutesSince(room.housekeepingUpdatedTime, now);
      return {
        id: `room-${room.id ?? room.name}`,
        type: "ROOM",
        title: `Phòng ${room.name}`,
        subtitle: room.roomTypes?.name || room.description || "Công việc dọn phòng",
        status: housekeepingLabel(status),
        owner: room.housekeepingAssignedTo || "Chưa phân công",
        timeLabel: room.housekeepingUpdatedTime
          ? `Cập nhật ${formatDateTime(room.housekeepingUpdatedTime)}`
          : "Chưa có thời gian cập nhật",
        lateMinutes,
        href: "/housekeeping",
        tone: "bg-amber-50 text-amber-700 border-amber-200",
      };
    });

  const serviceTasks: OperationItem[] = serviceOrders
    .filter((item) => item.status === "WAITING")
    .filter((item) => item.approvalStatus !== "REJECTED")
    .filter((item) => item.paymentStatus !== "PENDING_PAYMENT")
    .map((item) => {
      const createdTime = item.createdTime || item.assignedTime;
      return {
        id: `service-${item.id}`,
        type: "SERVICE",
        title: item.serviceName || "Dịch vụ phát sinh",
        subtitle: `${item.roomName || roomDisplayName(item.roomId, roomsById)} - SL ${item.quantity}`,
        status: item.approvalStatus === "PENDING" ? "Chờ duyệt" : "Chưa phục vụ",
        owner: item.assignedTo || "Chưa phân công",
        timeLabel: createdTime ? `Tạo lúc ${formatDateTime(createdTime)}` : "Chưa có giờ tạo",
        lateMinutes: Math.max(0, minutesSince(createdTime, now) - 30),
        href: "/service-orders",
        tone: "bg-sky-50 text-sky-700 border-sky-200",
      };
    });

  const checkInTasks: OperationItem[] = bookings
    .filter((booking) => isReadyToCheckIn(booking))
    .filter((booking) => getDatePart(booking.checkin) === today || minutesLateFromDue(booking.checkin, now) > 0)
    .map((booking) => ({
      id: `checkin-${booking.id}`,
      type: "BOOKING",
      title: `Check-in ${bookingCode(booking.id)}`,
      subtitle: roomDisplayName(booking.roomId, roomsById),
      status: "Sắp nhận phòng",
      owner: "Lễ tân",
      timeLabel: `Dự kiến ${getTimePart(booking.checkin)} - ${formatMoney(booking.totalPrice)}`,
      lateMinutes: minutesLateFromDue(booking.checkin, now),
      href: `/bookings/${booking.id}`,
      tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    }));

  const checkOutTasks: OperationItem[] = bookings
    .filter((booking) => isReadyToCheckOut(booking))
    .filter((booking) => getDatePart(booking.checkout) === today || minutesLateFromDue(booking.checkout, now) > 0)
    .map((booking) => ({
      id: `checkout-${booking.id}`,
      type: "BOOKING",
      title: `Check-out ${bookingCode(booking.id)}`,
      subtitle: roomDisplayName(booking.roomId, roomsById),
      status: "Sắp trả phòng",
      owner: "Lễ tân",
      timeLabel: `Dự kiến ${getTimePart(booking.checkout)} - ${formatMoney(booking.totalPrice)}`,
      lateMinutes: minutesLateFromDue(booking.checkout, now),
      href: `/bookings/${booking.id}`,
      tone: "bg-purple-50 text-purple-700 border-purple-200",
    }));

  const operationItems = [...roomTasks, ...serviceTasks, ...checkInTasks, ...checkOutTasks].sort(
    (a, b) => b.lateMinutes - a.lateMinutes,
  );
  const lateItems = operationItems.filter((item) => item.lateMinutes > 0);
  const filteredItems = operationItems.filter((item) => {
    if (tab === "ALL") return true;
    if (tab === "LATE") return item.lateMinutes > 0;
    return item.type === tab;
  });

  const metrics = [
    {
      label: "Phòng cần dọn",
      value: roomTasks.length,
      icon: <BedDouble className="h-5 w-5" />,
      detail: `${roomTasks.filter((item) => item.owner === "Chưa phân công").length} phòng chưa phân công`,
    },
    {
      label: "Dịch vụ cần phục vụ",
      value: serviceTasks.length,
      icon: <Utensils className="h-5 w-5" />,
      detail: `${serviceTasks.filter((item) => item.owner === "Chưa phân công").length} dịch vụ chưa có người nhận`,
    },
    {
      label: "Check-in / check-out",
      value: checkInTasks.length + checkOutTasks.length,
      icon: <CalendarCheck className="h-5 w-5" />,
      detail: `${checkInTasks.length} nhận phòng, ${checkOutTasks.length} trả phòng`,
    },
    {
      label: "Việc đang trễ",
      value: lateItems.length,
      icon: <AlertTriangle className="h-5 w-5" />,
      detail: lateItems[0] ? lateItems[0].title : "Chưa có việc trễ",
    },
  ];

  if (!canOpen) {
    return <PermissionDenied message="Chỉ manager được mở bảng công việc vận hành." />;
  }

  return (
    <div className="space-y-6">
      {message ? (
        <ToastBridge error={message} onClearError={() => setMessage("")} />
      ) : null}

      <section className="rounded-3xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-[#9b5c24] uppercase">
              Điều phối vận hành
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#17213a]">
              Bảng công việc hôm nay
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-[#6f5f50]">
              Manager theo dõi phòng cần dọn, dịch vụ cần phục vụ, booking sắp check-in/check-out,
              việc đang trễ và người đang phụ trách trong một màn chung.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => void loadOperations()}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Tải lại
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-3xl border border-[#decdb9] bg-white/90 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#6f5f50]">{metric.label}</p>
                <p className="mt-2 text-4xl font-black text-[#06153a]">{metric.value}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff6df] text-[#9b5c24]">
                {metric.icon}
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold text-[#7c6f63]">{metric.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-black text-[#17213a]">Danh sách công việc</h3>
              <p className="text-sm text-[#7c6f63]">
                Sắp xếp theo việc trễ trước để manager xử lý nhanh.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm sm:flex">
              {[
                ["ALL", "Tất cả"],
                ["ROOM", "Phòng"],
                ["SERVICE", "Dịch vụ"],
                ["BOOKING", "Booking"],
                ["LATE", "Đang trễ"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value as OperationTab)}
                  className={`rounded-full border px-4 py-2 font-bold transition ${
                    tab === value
                      ? "border-[#9b5c24] bg-[#fff6df] text-[#8a5724]"
                      : "border-[#decdb9] bg-[#fbf6ed] text-[#6f5f50] hover:bg-[#f4eadc]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <EmptyState text="Đang tải bảng công việc vận hành..." />
            ) : filteredItems.length === 0 ? (
              <EmptyState text="Không có công việc phù hợp với bộ lọc hiện tại." />
            ) : (
              filteredItems.map((item) => <OperationRow key={item.id} item={item} />)
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[#9b5c24]" />
              <h3 className="text-lg font-black text-[#17213a]">Nhân sự đang trong ca</h3>
            </div>
            <div className="mt-4 space-y-3">
              {activeSessions.length === 0 ? (
                <EmptyState text="Chưa có nhân viên đang mở ca." className="p-4" />
              ) : (
                activeSessions.slice(0, 8).map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ed] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-black text-[#17213a]">{activeStaffName(session)}</p>
                        <p className="text-xs font-semibold text-[#7c6f63]">
                          {session.primaryRole || "Chưa rõ vai trò"}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                        Online
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#7c6f63]">
                      Vào ca: {formatDateTime(session.workCheckInTime || session.loginTime)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[#9b5c24]" />
              <h3 className="text-lg font-black text-[#17213a]">Gợi ý điều phối</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm font-semibold text-[#6f5f50]">
              <HintLine
                icon={<AlertTriangle className="h-4 w-4" />}
                text={
                  lateItems.length
                    ? `Ưu tiên xử lý ${lateItems.length} việc đang trễ.`
                    : "Hiện chưa có việc trễ."
                }
              />
              <HintLine
                icon={<UserCheck className="h-4 w-4" />}
                text={
                  activeHousekeepers.length
                    ? `${activeHousekeepers.length} nhân viên dọn phòng đang online.`
                    : "Chưa thấy nhân viên dọn phòng online."
                }
              />
              <HintLine
                icon={<Clock3 className="h-4 w-4" />}
                text="Dịch vụ chờ quá 30 phút và phòng cần dọn quá 4 giờ sẽ bị đánh dấu trễ."
              />
              <HintLine
                icon={<DoorOpen className="h-4 w-4" />}
                text="Bấm vào từng việc để mở đúng màn xử lý chi tiết."
              />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function OperationRow({ item }: { item: OperationItem }) {
  return (
    <Link
      href={item.href}
      className="grid gap-3 rounded-2xl border border-[#eadfcd] bg-[#fbf6ed] p-4 transition hover:border-[#c8792a] hover:bg-[#fff6df] lg:grid-cols-[1.2fr_0.9fr_0.8fr_0.7fr]"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-black ${item.tone}`}>
            {item.status}
          </span>
          {item.lateMinutes > 0 ? (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
              {lateLabel(item.lateMinutes)}
            </span>
          ) : null}
        </div>
        <h4 className="mt-2 text-lg font-black text-[#17213a]">{item.title}</h4>
        <p className="text-sm text-[#7c6f63]">{item.subtitle}</p>
      </div>
      <InfoBlock label="Thời gian" value={item.timeLabel} />
      <InfoBlock label="Phụ trách" value={item.owner} />
      <div className="flex items-center justify-start lg:justify-end">
        <span className="rounded-full border border-[#decdb9] bg-white px-4 py-2 text-sm font-black text-[#8a5724]">
          Mở xử lý
        </span>
      </div>
    </Link>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold tracking-[0.14em] text-[#8a7a69] uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-[#17213a]">{value}</p>
    </div>
  );
}

function HintLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-[#fbf6ed] p-3">
      <span className="mt-0.5 text-[#9b5c24]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
