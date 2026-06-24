"use client";

import {
  BadgeDollarSign,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  CreditCard,
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
import { MetricCard } from "@/components/ui/metric-card";
import { QuickFilter, type QuickFilterOption } from "@/components/ui/quick-filter";
import { usePermission } from "@/hooks/use-permission";
import { formatMoney } from "@/lib/format";
import {
  getLatestPaymentRequestByBooking,
  mockPaymentRequestPaid,
} from "@/services/billing-service";
import {
  approveRoomBookingCancellation,
  checkOutRoomBooking,
  getRoomBookings,
  type RoomBookingResponse,
} from "@/services/booking-service";
import { getAllRooms } from "@/services/room-service";

type DisplayStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCEL_REQUESTED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED";

const statusLabel: Record<DisplayStatus, string> = {
  PENDING: "Chá» xÃ¡c nháº­n",
  CONFIRMED: "ÄÃ£ xÃ¡c nháº­n",
  CANCEL_REQUESTED: "YÃªu cáº§u há»§y",
  CHECKED_IN: "Äang á»Ÿ",
  CHECKED_OUT: "ÄÃ£ tráº£ phÃ²ng",
  CANCELLED: "ÄÃ£ há»§y",
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
        "KhÃ´ng thá»ƒ táº£i danh sÃ¡ch Ä‘áº·t phÃ²ng. Kiá»ƒm tra booking-service, gateway vÃ  quyá»n BOOKING_VIEW.",
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

  async function handleCheckOut(booking: RoomBookingResponse) {
    if (isActionBusy) return;
    setActionId(booking.id);
    setMessage(null);
    try {
      const updated = await checkOutRoomBooking(booking.id);
      setBookings((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
      setMessage(`ÄÃ£ check-out booking ${shortCode(updated.id)}.`);
    } catch {
      setMessage(
        "KhÃ´ng thá»ƒ check-out booking nÃ y. Chá»‰ booking Ä‘ang á»Ÿ má»›i Ä‘Æ°á»£c tráº£ phÃ²ng.",
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
      setMessage(`ÄÃ£ xÃ¡c nháº­n chuyá»ƒn khoáº£n cho booking ${shortCode(booking.id)}.`);
    } catch {
      setMessage(
        "KhÃ´ng thá»ƒ xÃ¡c nháº­n chuyá»ƒn khoáº£n. Kiá»ƒm tra payment request, billing-service vÃ  quyá»n PAYMENT_CONFIRM.",
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
      setMessage(
        `ÄÃ£ duyá»‡t há»§y booking ${shortCode(updated.id)}. Vui lÃ²ng xá»­ lÃ½ hoÃ n tiá»n thá»§ cÃ´ng náº¿u cÃ³.`,
      );
    } catch {
      setMessage(
        "KhÃ´ng thá»ƒ duyá»‡t há»§y booking nÃ y. Kiá»ƒm tra tráº¡ng thÃ¡i booking vÃ  quyá»n BOOKING_CANCEL.",
      );
    } finally {
      setActionId(null);
    }
  }

  if (!canViewBookings) {
    return (
      <PermissionDenied message="Báº¡n khÃ´ng cÃ³ quyá»n BOOKING_VIEW Ä‘á»ƒ xem danh sÃ¡ch Ä‘áº·t phÃ²ng." />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#decdb9] bg-white/80 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-[#9b5c24] uppercase">
              Quáº£n lÃ½ Ä‘áº·t phÃ²ng
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17213a]">
              Check-in / Check-out
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#7c6f63]">
              Theo dÃµi tráº¡ng thÃ¡i Ä‘áº·t phÃ²ng vÃ  xá»­ lÃ½ khÃ¡ch nháº­n phÃ²ng, tráº£ phÃ²ng tá»« dá»¯
              liá»‡u booking tháº­t.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => void loadData()}
            disabled={loading || isActionBusy}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Táº£i láº¡i
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Tá»•ng booking"
          value={bookings.length.toString()}
          icon={<CalendarDays className="h-4 w-4" />}
          sub="Tá»« há»‡ thá»‘ng booking"
        />
        <MetricCard
          title="Äang á»Ÿ"
          value={checkedInCount.toString()}
          icon={<BedDouble className="h-4 w-4" />}
          sub={`${checkOutSoonCount} phÃ²ng sáº¯p checkout`}
        />
        <MetricCard
          title="Doanh thu booking"
          value={formatCompactMoney(totalRevenue)}
          icon={<BadgeDollarSign className="h-4 w-4" />}
          sub="Tá»•ng giÃ¡ trá»‹ booking"
        />
        <MetricCard
          title="Chá» xá»­ lÃ½"
          value={bookings
            .filter((booking) => getDisplayStatus(booking) === "PENDING")
            .length.toString()}
          icon={<UserRound className="h-4 w-4" />}
          sub="ChÆ°a xÃ¡c nháº­n tiá»n cá»c"
        />
      </div>

      {message ? (
        <div className="rounded-xl bg-[#fff6df] p-3 text-sm text-[#8a5724]">
          {message}
        </div>
      ) : null}

      <QuickFilter value={status} options={statusButtons} onChange={setStatus} />

      <div>
        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#17213a]">
                Danh sÃ¡ch Ä‘áº·t phÃ²ng
              </h3>
              <p className="text-sm text-[#7c6f63]">
                TÃ¬m kiáº¿m, lá»c tráº¡ng thÃ¡i vÃ  thao tÃ¡c nhanh.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative w-full md:w-72">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9b5c24]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="TÃ¬m theo mÃ£, khÃ¡ch, phÃ²ng..."
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#decdb9] text-left text-[#7c6f63]">
                  <th className="py-3 pr-4 font-medium">MÃ£</th>
                  <th className="py-3 pr-4 font-medium">KhÃ¡ch</th>
                  <th className="py-3 pr-4 font-medium">PhÃ²ng</th>
                  <th className="py-3 pr-4 font-medium">Nháº­n / Tráº£</th>
                  <th className="py-3 pr-4 font-medium">Tá»•ng tiá»n</th>
                  <th className="py-3 pr-4 font-medium">Tráº¡ng thÃ¡i</th>
                  <th className="py-3 pr-4 font-medium">HÃ nh Ä‘á»™ng</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => {
                  const displayStatus = getDisplayStatus(booking);
                  return (
                    <tr
                      key={booking.id}
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                      className="cursor-pointer border-b border-[#eee3d5] transition-colors last:border-b-0 hover:bg-[#fff6e8]"
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
                          â†’ {formatDateTime(booking.checkout)}
                        </div>
                        {booking.checkinReality ? (
                          <div className="mt-1 text-xs text-green-700">
                            Thá»±c nháº­n: {formatDateTime(booking.checkinReality)}
                          </div>
                        ) : null}
                        {booking.checkoutReality ? (
                          <div className="text-xs text-slate-600">
                            Thá»±c tráº£: {formatDateTime(booking.checkoutReality)}
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
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleMockConfirmPayment(booking);
                            }}
                            className="gap-2"
                          >
                            <CreditCard className="h-4 w-4" />
                            XÃ¡c nháº­n CK
                          </Button>
                        ) : displayStatus === "CONFIRMED" ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={!canCheckIn || isActionBusy}
                            onClick={(event) => {
                              event.stopPropagation();
                              router.push(`/bookings/${booking.id}/checkin`);
                            }}
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
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleApproveCancellation(booking);
                            }}
                            className="gap-2 bg-[#8a5724] hover:bg-[#70451c]"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Duyá»‡t há»§y
                          </Button>
                        ) : displayStatus === "CHECKED_IN" ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={!canCheckOut || isActionBusy}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleCheckOut(booking);
                            }}
                            className="gap-2 bg-[#5f5144] hover:bg-[#4c4036]"
                          >
                            <LogOut className="h-4 w-4" />
                            Check-out
                          </Button>
                        ) : (
                          <span className="text-xs text-[#9f8a77]">
                            KhÃ´ng cÃ³ thao tÃ¡c
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
                KhÃ´ng tÃ¬m tháº¥y booking nÃ o phÃ¹ há»£p.
              </div>
            ) : null}
            {loading ? (
              <div className="py-10 text-center text-[#7c6f63]">Äang táº£i booking...</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

type StatusFilter = DisplayStatus | "ALL";

const statusButtons: QuickFilterOption<StatusFilter>[] = [
  { value: "ALL", label: "Táº¥t cáº£", desc: "Xem toÃ n bá»™ booking" },
  { value: "PENDING", label: "Chá» xÃ¡c nháº­n", desc: "ChÆ°a ghi nháº­n cá»c" },
  { value: "CONFIRMED", label: "ÄÃ£ xÃ¡c nháº­n", desc: "Sáºµn sÃ ng check-in" },
  { value: "CANCEL_REQUESTED", label: "YÃªu cáº§u há»§y", desc: "Chá» duyá»‡t há»§y" },
  { value: "CHECKED_IN", label: "Äang á»Ÿ", desc: "KhÃ¡ch Ä‘ang lÆ°u trÃº" },
  { value: "CHECKED_OUT", label: "ÄÃ£ tráº£ phÃ²ng", desc: "HoÃ n táº¥t" },
  { value: "CANCELLED", label: "ÄÃ£ há»§y", desc: "Booking bá»‹ há»§y" },
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

function formatCompactMoney(value: number) {
  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}M`;
  }
  return formatMoney(value);
}


