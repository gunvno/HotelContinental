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
import { DatePicker } from "@/components/ui/date-picker";
import { TextField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { usePermission } from "@/hooks/use-permission";
import { formatMoney } from "@/lib/format";
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
  PENDING: "Chá» thanh toÃ¡n",
  DEPOSITED: "ÄÃ£ xÃ¡c nháº­n thanh toÃ¡n",
  CANCEL_REQUESTED: "YÃªu cáº§u há»§y",
  CHECKED_IN: "Äang lÆ°u trÃº",
  CANCEL: "ÄÃ£ há»§y",
  DONE: "ÄÃ£ tráº£ phÃ²ng",
};

const detailStatusLabel: Record<string, string> = {
  BOOKED: "ÄÃ£ giá»¯ phÃ²ng",
  CHECKED_IN: "ÄÃ£ nháº­n phÃ²ng",
  CHECKED_OUT: "ÄÃ£ tráº£ phÃ²ng",
  CANCELED: "ÄÃ£ há»§y",
  NO_SHOW: "KhÃ´ng Ä‘áº¿n",
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
      setMessage(
        "KhÃ´ng thá»ƒ táº£i booking. Kiá»ƒm tra booking-service vÃ  quyá»n BOOKING_VIEW.",
      );
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
      setMessage(
        "Vui lÃ²ng nháº­p Ä‘á»§ há» tÃªn, CCCD/CMND, giá»›i tÃ­nh vÃ  ngÃ y sinh cá»§a khÃ¡ch lÆ°u trÃº.",
      );
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
      setMessage("ÄÃ£ lÆ°u Ä‘Äƒng kÃ½ lÆ°u trÃº vÃ  check-in thÃ nh cÃ´ng.");
      window.setTimeout(() => router.push("/bookings"), 700);
    } catch {
      setMessage(
        "KhÃ´ng thá»ƒ check-in. Kiá»ƒm tra tráº¡ng thÃ¡i booking, dá»¯ liá»‡u Ä‘Äƒng kÃ½ lÆ°u trÃº vÃ  quyá»n BOOKING_CHECKIN.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!canCheckIn) {
    return (
      <PermissionDenied message="Báº¡n khÃ´ng cÃ³ quyá»n BOOKING_CHECKIN Ä‘á»ƒ thá»±c hiá»‡n check-in." />
    );
  }

  const readyToCheckIn =
    booking?.status === "DEPOSITED" && booking?.detailStatus === "BOOKED";
  const customerName = formatCustomerName(customer) || "ChÆ°a táº£i Ä‘Æ°á»£c tÃªn khÃ¡ch";
  const roomName = room?.name || booking?.roomId || "ChÆ°a táº£i Ä‘Æ°á»£c tÃªn phÃ²ng";

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => router.push("/bookings")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#17213a] hover:text-[#9b5c24]"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay láº¡i danh sÃ¡ch Ä‘áº·t phÃ²ng
      </button>

      <section className="rounded-2xl border border-[#decdb9] bg-white/85 p-6 shadow-sm">
        <p className="text-sm font-bold tracking-[0.22em] text-[#9b5c24] uppercase">
          Tiáº¿p nháº­n khÃ¡ch
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17213a]">
          Check-in booking
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-[#7c6f63]">
          Nháº­p thÃ´ng tin Ä‘Äƒng kÃ½ lÆ°u trÃº trÆ°á»›c khi chuyá»ƒn booking sang tráº¡ng thÃ¡i khÃ¡ch
          Ä‘ang á»Ÿ.
        </p>
      </section>

      {message ? (
        <div className="rounded-xl bg-[#fff6df] p-3 text-sm font-semibold text-[#8a5724]">
          {message}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-10 text-center text-[#7c6f63]">
          Äang táº£i booking...
        </div>
      ) : booking ? (
        <>
          <section className="rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                icon={<CalendarDays className="h-5 w-5" />}
                label="MÃ£ booking"
                value={shortCode(booking.id)}
                sub={booking.id}
              />
              <InfoCard
                icon={<UserRound className="h-5 w-5" />}
                label="KhÃ¡ch hÃ ng"
                value={customerName}
                sub={customer?.email || customer?.username}
              />
              <InfoCard
                icon={<BedDouble className="h-5 w-5" />}
                label="PhÃ²ng"
                value={roomName}
                sub={room?.roomTypes?.name}
              />
              <InfoCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                label="Tráº¡ng thÃ¡i"
                value={`${formatBookingStatus(booking.status)} / ${formatDetailStatus(booking.detailStatus)}`}
              />
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl border border-[#eee3d5] bg-[#fbf6ed] p-5 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
                  Nháº­n phÃ²ng dá»± kiáº¿n
                </p>
                <p className="mt-2 text-lg font-semibold text-[#17213a]">
                  {formatDateTime(booking.checkin)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
                  Tráº£ phÃ²ng dá»± kiáº¿n
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
                <h3 className="text-xl font-semibold text-[#17213a]">ÄÄƒng kÃ½ lÆ°u trÃº</h3>
                <p className="mt-2 text-sm text-[#7c6f63]">
                  Má»—i khÃ¡ch lÆ°u trÃº cáº§n cÃ³ thÃ´ng tin giáº¥y tá» Ä‘á»ƒ lÆ°u vÃ o báº£ng
                  residence_registration.
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
                ThÃªm khÃ¡ch
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
                      KhÃ¡ch lÆ°u trÃº {index + 1}
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
                      XÃ³a
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField
                      label="Há» vÃ  tÃªn"
                      value={guest.fullName}
                      onValueChange={(fullName) => updateGuest(index, { fullName })}
                      placeholder="VÃ­ dá»¥: Táº¡ VÄƒn Long"
                    />
                    <TextField
                      label="CCCD / CMND"
                      value={guest.identityNumber}
                      onValueChange={(identityNumber) =>
                        updateGuest(index, { identityNumber })
                      }
                      placeholder="Nháº­p sá»‘ cÄƒn cÆ°á»›c"
                    />
                    <label className="block">
                      <span className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
                        Giá»›i tÃ­nh
                      </span>
                      <Select
                        value={guest.gender}
                        onValueChange={(gender) => updateGuest(index, { gender })}
                        className="mt-2"
                        options={[
                          { value: "MALE", label: "Nam" },
                          { value: "FEMALE", label: "Ná»¯" },
                          { value: "OTHER", label: "KhÃ¡c" },
                        ]}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
                        NgÃ y sinh
                      </span>
                      <DatePicker
                        value={guest.dateOfBirth}
                        onChange={(dateOfBirth) => updateGuest(index, { dateOfBirth })}
                        disabled={submitting}
                        className="mt-2"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#17213a]">XÃ¡c nháº­n check-in</h3>
            <div className="mt-5 space-y-3 rounded-2xl bg-[#fbf6ed] p-4 text-sm text-[#5f5144]">
              <div className="flex justify-between gap-4">
                <span>Tá»•ng tiá»n</span>
                <strong className="text-[#17213a]">
                  {formatMoney(booking.totalPrice)}
                </strong>
              </div>
              <div className="flex justify-between gap-4">
                <span>Tiá»n phÃ²ng</span>
                <span>{formatMoney(booking.totalRoomPrice)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Dá»‹ch vá»¥ phÃ¡t sinh</span>
                <span>{formatMoney(booking.totalServicePrice)}</span>
              </div>
            </div>

            {!readyToCheckIn ? (
              <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                Booking nÃ y chÆ°a sáºµn sÃ ng check-in. Cáº§n tráº¡ng thÃ¡i Ä‘Ã£ xÃ¡c nháº­n thanh toÃ¡n
                vÃ  phÃ²ng cÃ²n Ä‘Æ°á»£c giá»¯.
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
                Táº£i láº¡i
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
                LÆ°u Ä‘Äƒng kÃ½ vÃ  check-in
              </Button>
            </div>
          </section>
        </>
      ) : (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
          KhÃ´ng tÃ¬m tháº¥y booking.
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
          <p className="mt-1 font-semibold break-words text-[#17213a]">{value}</p>
          {sub ? <p className="mt-1 text-xs break-all text-[#9f8a77]">{sub}</p> : null}
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


