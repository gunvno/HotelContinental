"use client";

import {
  ArrowLeft,
  BadgeDollarSign,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  LogOut,
  ReceiptText,
  RefreshCcw,
  ScrollText,
  ShieldCheck,
  UserRound,
  UsersRound,
  Utensils,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TextField } from "@/components/ui/form-field";
import {
  DetailInfoCard,
  LargeInfoCard,
  MoneyInfoCard,
  SummaryInfoCard,
} from "@/components/ui/info-card";
import { SectionPanel } from "@/components/ui/section-panel";
import { Select } from "@/components/ui/select";
import { usePermission } from "@/hooks/use-permission";
import { formatDateTime, formatMoney, formatPlainDate } from "@/lib/format";
import {
  getInvoiceByBooking,
  getLatestPaymentRequestByBooking,
  type InvoiceResponse,
  mockPaymentRequestPaid,
  type PaymentRequestResponse,
} from "@/services/billing-service";
import {
  approveRoomBookingCancellation,
  cancelRoomBooking,
  checkOutRoomBooking,
  type EditHistoryResponse,
  getResidenceRegistrations,
  getRoomBooking,
  getRoomBookingEditHistory,
  type ResidenceRegistrationResponse,
  type RoomBookingResponse,
  updateRoomBookingTotals,
} from "@/services/booking-service";
import { getRoom, type RoomResponse } from "@/services/room-service";
import {
  getServiceOrderDetails,
  type ServiceOrderDetailResponse,
} from "@/services/service-order-service";
import { getUserSummary, type UserSummaryResponse } from "@/services/user-service";

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

const bookingStatusLabel: Record<string, string> = {
  PENDING: "Chá» thanh toÃ¡n",
  DEPOSITED: "ÄÃ£ xÃ¡c nháº­n thanh toÃ¡n",
  CANCEL_REQUESTED: "YÃªu cáº§u há»§y",
  CHECKED_IN: "Äang lÆ°u trÃº",
  CANCEL: "ÄÃ£ há»§y",
  DONE: "ÄÃ£ hoÃ n táº¥t",
};

const detailStatusLabel: Record<string, string> = {
  BOOKED: "ÄÃ£ giá»¯ phÃ²ng",
  CHECKED_IN: "ÄÃ£ nháº­n phÃ²ng",
  CHECKED_OUT: "ÄÃ£ tráº£ phÃ²ng",
  CANCELED: "ÄÃ£ há»§y phÃ²ng",
  NO_SHOW: "KhÃ´ng Ä‘áº¿n",
};

const paymentStatusLabel: Record<string, string> = {
  PENDING: "Chá» thanh toÃ¡n",
  PAID: "ÄÃ£ thanh toÃ¡n",
  EXPIRED: "Háº¿t háº¡n",
  FAILED: "Tháº¥t báº¡i",
};

const serviceStatusLabel: Record<string, string> = {
  WAITING: "Chá» phá»¥c vá»¥",
  SERVED: "ÄÃ£ phá»¥c vá»¥",
};

const historyFieldLabel: Record<string, string> = {
  checkin: "NgÃ y nháº­n phÃ²ng",
  checkout: "NgÃ y tráº£ phÃ²ng",
  checkin_reality: "Giá» thá»±c nháº­n",
  checkout_reality: "Giá» thá»±c tráº£",
  booking_status: "Tráº¡ng thÃ¡i booking",
  detail_status: "Tráº¡ng thÃ¡i phÃ²ng",
  total_room_price: "Tiá»n phÃ²ng",
  total_service_price: "Tiá»n dá»‹ch vá»¥",
  total_extra_price: "Phá»¥ thu",
  total_price: "Tá»•ng tiá»n",
  voucher_code: "MÃ£ voucher",
  discount_amount: "Tiá»n giáº£m giÃ¡",
  refund_status: "Tráº¡ng thÃ¡i hoÃ n tiá»n",
  refund_amount: "Tiá»n hoÃ n",
};

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const permission = usePermission();
  const canViewBookings = permission.has("BOOKING_VIEW");
  const canCheckIn = permission.has("BOOKING_CHECKIN");
  const canCheckOut = permission.has("BOOKING_CHECKOUT");
  const canCancelBooking = permission.has("BOOKING_CANCEL");
  const canConfirmPayment = permission.has("PAYMENT_CONFIRM");
  const canUpdateTotals = permission.has("BOOKING_UPDATE_TOTALS");
  const bookingId = useMemo(() => String(params.id ?? ""), [params.id]);

  const [booking, setBooking] = useState<RoomBookingResponse | null>(null);
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [customer, setCustomer] = useState<UserSummaryResponse | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequestResponse | null>(
    null,
  );
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [guests, setGuests] = useState<ResidenceRegistrationResponse[]>([]);
  const [services, setServices] = useState<ServiceOrderDetailResponse[]>([]);
  const [editHistory, setEditHistory] = useState<EditHistoryResponse[]>([]);
  const [financeForm, setFinanceForm] = useState({
    voucherCode: "",
    discountAmount: 0,
    refundStatus: "NONE",
    refundAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadBooking() {
    if (!bookingId || !canViewBookings) return;
    setLoading(true);
    setMessage(null);
    try {
      const bookingData = await getRoomBooking(bookingId);
      setBooking(bookingData);
      setFinanceForm({
        voucherCode: bookingData.voucherCode ?? "",
        discountAmount: bookingData.discountAmount ?? 0,
        refundStatus: bookingData.refundStatus ?? "NONE",
        refundAmount: bookingData.refundAmount ?? 0,
      });

      const [
        roomData,
        customerData,
        historyData,
        guestData,
        serviceData,
        paymentData,
        invoiceData,
      ] = await Promise.all([
          getRoom(bookingData.roomId).catch(() => null),
          getUserSummary(bookingData.customerId).catch(() => null),
          getRoomBookingEditHistory(bookingId).catch(() => []),
          getResidenceRegistrations(bookingId).catch(() => []),
          getServiceOrderDetails(bookingId).catch(() => []),
          getLatestPaymentRequestByBooking(bookingId).catch(() => null),
          getInvoiceByBooking(bookingId).catch(() => null),
        ]);

      setRoom(roomData);
      setCustomer(customerData);
      setEditHistory(historyData);
      setGuests(guestData);
      setServices(serviceData);
      setPaymentRequest(paymentData);
      setInvoice(invoiceData);
    } catch {
      setMessage(
        "KhÃ´ng thá»ƒ táº£i chi tiáº¿t booking. Kiá»ƒm tra booking-service vÃ  quyá»n BOOKING_VIEW.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBooking();
  }, [bookingId, canViewBookings]);

  async function runBookingAction(
    actionKey: string,
    successMessage: string,
    action: () => Promise<unknown>,
  ) {
    if (!booking || actionLoading) return;
    setActionLoading(actionKey);
    setMessage(null);
    try {
      await action();
      await loadBooking();
      setMessage(successMessage);
    } catch {
      setMessage("KhÃ´ng thá»ƒ thá»±c hiá»‡n thao tÃ¡c nÃ y. Kiá»ƒm tra tráº¡ng thÃ¡i booking vÃ  quyá»n tÃ i khoáº£n.");
    } finally {
      setActionLoading(null);
    }
  }

  function handleCancelBooking() {
    if (!booking) return;
    const ok = window.confirm(
      "Báº¡n cháº¯c cháº¯n muá»‘n há»§y booking nÃ y? Booking Ä‘Ã£ thanh toÃ¡n sáº½ chuyá»ƒn sang yÃªu cáº§u há»§y Ä‘á»ƒ quáº£n lÃ½ duyá»‡t.",
    );
    if (!ok) return;
    void runBookingAction("cancel", `ÄÃ£ gá»­i thao tÃ¡c há»§y booking ${shortCode(booking.id)}.`, () =>
      cancelRoomBooking(booking.id),
    );
  }

  async function handleSaveFinance() {
    if (!booking || actionLoading) return;
    const discountAmount = Math.max(0, Number(financeForm.discountAmount) || 0);
    const refundAmount = Math.max(0, Number(financeForm.refundAmount) || 0);
    const totalPrice = Math.max(
      0,
      booking.totalRoomPrice + booking.totalServicePrice + booking.totalExtraPrice - discountAmount,
    );

    await runBookingAction(
      "finance",
      `ÄÃ£ cáº­p nháº­t thanh toÃ¡n cho booking ${shortCode(booking.id)}.`,
      () =>
        updateRoomBookingTotals(booking.id, {
          totalRoomPrice: booking.totalRoomPrice,
          totalServicePrice: booking.totalServicePrice,
          totalExtraPrice: booking.totalExtraPrice,
          totalPrice,
          voucherCode: financeForm.voucherCode.trim(),
          discountAmount,
          refundStatus: financeForm.refundStatus,
          refundAmount,
        }),
    );
  }

  if (!canViewBookings) {
    return (
      <PermissionDenied message="Báº¡n khÃ´ng cÃ³ quyá»n BOOKING_VIEW Ä‘á»ƒ xem chi tiáº¿t booking." />
    );
  }

  const displayStatus = booking ? getDisplayStatus(booking) : "PENDING";
  const customerName = formatCustomerName(customer) || booking?.customerId || "-";
  const roomName = room?.name || booking?.roomId || "-";
  const readyToCheckIn =
    booking?.status === "DEPOSITED" && booking?.detailStatus === "BOOKED";
  const readyToCheckOut =
    booking?.status === "CHECKED_IN" && booking?.detailStatus === "CHECKED_IN";
  const canCancelThisBooking =
    booking &&
    (booking.status === "PENDING" || booking.status === "DEPOSITED") &&
    booking.detailStatus === "BOOKED";
  const canApproveThisCancellation = booking?.status === "CANCEL_REQUESTED";
  const invoiceRoomTotal = invoice?.totalRoomPrice ?? booking?.totalRoomPrice ?? 0;
  const invoiceServiceTotal =
    invoice?.totalServicePrice ?? booking?.totalServicePrice ?? 0;
  const invoiceExtraTotal = invoice?.totalExtraPrice ?? booking?.totalExtraPrice ?? 0;
  const invoiceGrandTotal = invoice?.totalPrice ?? booking?.totalPrice ?? 0;
  const voucherCode = invoice?.voucherCode ?? booking?.voucherCode ?? "";
  const discountAmount = invoice?.discountAmount ?? booking?.discountAmount ?? 0;
  const paidAmount =
    invoice?.paidAmount ??
    (paymentRequest?.status === "PAID" ? paymentRequest.amount : booking?.deposit) ??
    0;
  const remainingAmount =
    invoice?.remainingAmount ?? Math.max(invoiceGrandTotal - paidAmount, 0);
  const refundStatus = getRefundStatus(
    displayStatus,
    paidAmount,
    invoice?.refundStatus ?? booking?.refundStatus,
    invoice?.refundAmount ?? booking?.refundAmount ?? 0,
  );

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

      {message ? (
        <div className="rounded-xl bg-[#fff6df] p-3 text-sm font-semibold text-[#8a5724]">
          {message}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-10 text-center text-[#7c6f63]">
          Äang táº£i chi tiáº¿t booking...
        </div>
      ) : booking ? (
        <>
          <section className="rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold tracking-[0.22em] text-[#9b5c24] uppercase">
                  Trung tÃ¢m váº­n hÃ nh booking
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-black tracking-tight break-all text-[#17213a] md:text-4xl">
                    {shortCode(booking.id)}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass(displayStatus)}`}
                  >
                    {statusLabel[displayStatus]}
                  </span>
                </div>
                <p className="mt-3 text-sm break-all text-[#7c6f63]">
                  MÃ£ Ä‘áº§y Ä‘á»§: {booking.id}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void loadBooking()}
                  disabled={loading || Boolean(actionLoading)}
                  className="gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Táº£i láº¡i
                </Button>
                {displayStatus === "PENDING" ? (
                  <Button
                    type="button"
                    disabled={!canConfirmPayment || Boolean(actionLoading)}
                    onClick={() =>
                      void runBookingAction(
                        "payment",
                        `ÄÃ£ xÃ¡c nháº­n chuyá»ƒn khoáº£n cho booking ${shortCode(booking.id)}.`,
                        async () => {
                          const latestPayment = await getLatestPaymentRequestByBooking(
                            booking.id,
                          );
                          await mockPaymentRequestPaid(latestPayment.id);
                        },
                      )
                    }
                    className="gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    XÃ¡c nháº­n CK
                  </Button>
                ) : null}
                {readyToCheckIn ? (
                  <Button
                    type="button"
                    disabled={!canCheckIn || Boolean(actionLoading)}
                    onClick={() => router.push(`/bookings/${booking.id}/checkin`)}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Check-in
                  </Button>
                ) : null}
                {readyToCheckOut ? (
                  <Button
                    type="button"
                    disabled={!canCheckOut || Boolean(actionLoading)}
                    onClick={() =>
                      void runBookingAction(
                        "checkout",
                        `ÄÃ£ check-out booking ${shortCode(booking.id)}.`,
                        () => checkOutRoomBooking(booking.id),
                      )
                    }
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Check-out
                  </Button>
                ) : null}
                {canCancelThisBooking ? (
                  <Button
                    type="button"
                    disabled={!canCancelBooking || Boolean(actionLoading)}
                    onClick={handleCancelBooking}
                    className="gap-2 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    <XCircle className="h-4 w-4" />
                    Há»§y booking
                  </Button>
                ) : null}
                {canApproveThisCancellation ? (
                  <Button
                    type="button"
                    disabled={!canCancelBooking || Boolean(actionLoading)}
                    onClick={() =>
                      void runBookingAction(
                        "approve-cancel",
                        `ÄÃ£ duyá»‡t há»§y booking ${shortCode(booking.id)}.`,
                        () => approveRoomBookingCancellation(booking.id),
                      )
                    }
                    className="gap-2"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Duyá»‡t há»§y
                  </Button>
                ) : null}
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryInfoCard
              icon={<UserRound className="h-5 w-5" />}
              label="KhÃ¡ch Ä‘áº·t"
              value={customerName}
              sub={customer?.email || customer?.username || booking.customerId}
            />
            <SummaryInfoCard
              icon={<BedDouble className="h-5 w-5" />}
              label="PhÃ²ng"
              value={roomName}
              sub={room?.roomTypes?.name || booking.roomId}
            />
            <SummaryInfoCard
              icon={<Clock3 className="h-5 w-5" />}
              label="Thá»i lÆ°á»£ng"
              value={getDurationLabel(booking.checkin, booking.checkout)}
              sub={booking.bookingType}
            />
            <SummaryInfoCard
              icon={<BadgeDollarSign className="h-5 w-5" />}
              label="Tá»•ng tiá»n"
              value={formatMoney(booking.totalPrice)}
              sub={`Äáº·t cá»c ${formatMoney(booking.deposit)}`}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <SectionPanel
              eyebrow="Booking"
              title="ThÃ´ng tin booking"
              icon={<FileText className="h-5 w-5" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <LargeInfoCard
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Nháº­n phÃ²ng dá»± kiáº¿n"
                  value={formatDateTime(booking.checkin)}
                />
                <LargeInfoCard
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Tráº£ phÃ²ng dá»± kiáº¿n"
                  value={formatDateTime(booking.checkout)}
                />
                <LargeInfoCard
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="Thá»±c nháº­n"
                  value={booking.checkinReality ? formatDateTime(booking.checkinReality) : "-"}
                />
                <LargeInfoCard
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="Thá»±c tráº£"
                  value={booking.checkoutReality ? formatDateTime(booking.checkoutReality) : "-"}
                />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <DetailInfoCard label="Tráº¡ng thÃ¡i booking" value={formatBookingStatus(booking.status)} />
                <DetailInfoCard label="Tráº¡ng thÃ¡i phÃ²ng" value={formatDetailStatus(booking.detailStatus)} />
                <DetailInfoCard label="Loáº¡i booking" value={booking.bookingType} />
                <DetailInfoCard label="MÃ£ khÃ¡ch" value={booking.customerId} />
              </div>
            </SectionPanel>

            <SectionPanel
              eyebrow="PhÃ²ng"
              title="PhÃ²ng Ä‘ang xá»­ lÃ½"
              icon={<BedDouble className="h-5 w-5" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <DetailInfoCard label="TÃªn phÃ²ng" value={roomName} />
                <DetailInfoCard label="Loáº¡i phÃ²ng" value={room?.roomTypes?.name || "-"} />
                <DetailInfoCard label="Diá»‡n tÃ­ch" value={room?.roomSize || "-"} />
                <DetailInfoCard label="Tráº¡ng thÃ¡i phÃ²ng" value={room?.status || "-"} />
                <DetailInfoCard label="GiÃ¡ theo ngÃ y" value={formatMoney(room?.pricePerDay)} />
                <DetailInfoCard label="GiÃ¡ theo giá»" value={formatMoney(room?.pricePerHour)} />
              </div>
            </SectionPanel>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <SectionPanel
              eyebrow="KhÃ¡ch lÆ°u trÃº"
              title="Danh sÃ¡ch ngÆ°á»i á»Ÿ"
              icon={<UsersRound className="h-5 w-5" />}
              right={
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canCheckIn || displayStatus === "CHECKED_OUT" || displayStatus === "CANCELLED"}
                  onClick={() => router.push(`/bookings/${booking.id}/checkin`)}
                >
                  Cáº­p nháº­t
                </Button>
              }
            >
              {guests.length === 0 ? (
                <EmptyState text="ChÆ°a cÃ³ khÃ¡ch lÆ°u trÃº. Khi check-in, lá»… tÃ¢n nháº­p danh sÃ¡ch ngÆ°á»i á»Ÿ táº¡i Ä‘Ã¢y." />
              ) : (
                <div className="space-y-3">
                  {guests.map((guest, index) => (
                    <div
                      key={guest.id}
                      className="rounded-2xl border border-[#eee3d5] bg-[#fbf6ed] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold tracking-[0.14em] text-[#9b5c24] uppercase">
                            KhÃ¡ch {index + 1}
                          </p>
                          <p className="mt-1 text-base font-black text-[#17213a]">
                            {guest.fullName}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#8a5724]">
                          {guest.gender || "-"}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-[#7c6f63] sm:grid-cols-2">
                        <span>Giáº¥y tá»: {guest.identityNumber}</span>
                        <span>NgÃ y sinh: {formatPlainDate(guest.dateOfBirth)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionPanel>

            <SectionPanel
              eyebrow="Dá»‹ch vá»¥ phÃ¡t sinh"
              title="Dá»‹ch vá»¥ cá»§a booking"
              icon={<Utensils className="h-5 w-5" />}
            >
              {services.length === 0 ? (
                <EmptyState text="ChÆ°a cÃ³ dá»‹ch vá»¥ phÃ¡t sinh hoáº·c dá»‹ch vá»¥ Ä‘i kÃ¨m nÃ o Ä‘Æ°á»£c ghi nháº­n." />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-[#eee3d5]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#fbf6ed] text-xs font-bold tracking-[0.12em] text-[#7c6f63] uppercase">
                      <tr>
                        <th className="px-4 py-3">Dá»‹ch vá»¥</th>
                        <th className="px-4 py-3">SL</th>
                        <th className="px-4 py-3">Tiá»n</th>
                        <th className="px-4 py-3">Tráº¡ng thÃ¡i</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eee3d5] bg-white">
                      {services.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <p className="font-bold text-[#17213a]">
                              {item.serviceName || item.serviceId}
                            </p>
                            <p className="text-xs text-[#9f8a77]">
                              {item.source === "INCLUDED" ? "Äi kÃ¨m" : "PhÃ¡t sinh"}
                            </p>
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#17213a]">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 font-bold text-[#8a5724]">
                            {formatMoney(item.totalPrice || item.amount || item.price)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                item.status === "SERVED"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {serviceStatusLabel[item.status] ?? item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionPanel>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <SectionPanel
              eyebrow="HÃ³a Ä‘Æ¡n / thanh toÃ¡n"
              title="Invoice & thanh toÃ¡n"
              icon={<ReceiptText className="h-5 w-5" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <MoneyInfoCard label="Tiá»n phÃ²ng" value={formatMoney(invoiceRoomTotal)} />
                <MoneyInfoCard label="Tiá»n dá»‹ch vá»¥" value={formatMoney(invoiceServiceTotal)} />
                <MoneyInfoCard label="Phá»¥ thu" value={formatMoney(invoiceExtraTotal)} />
                <MoneyInfoCard
                  label="Voucher"
                  value={
                    discountAmount > 0
                      ? `-${formatMoney(discountAmount)}${voucherCode ? ` (${voucherCode})` : ""}`
                      : "ChÆ°a Ã¡p dá»¥ng"
                  }
                />
                <MoneyInfoCard label="Äáº·t cá»c / Ä‘Ã£ tráº£" value={formatMoney(paidAmount)} />
                <MoneyInfoCard label="CÃ²n pháº£i tráº£" value={formatMoney(remainingAmount)} strong />
              </div>
              <div className="mt-4 rounded-2xl border border-[#eee3d5] bg-[#fbf6ed] p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
                      Tráº¡ng thÃ¡i thanh toÃ¡n
                    </p>
                    <p className="mt-1 font-black text-[#17213a]">
                      {paymentRequest
                        ? paymentStatusLabel[paymentRequest.status] ?? paymentRequest.status
                        : "ChÆ°a cÃ³ yÃªu cáº§u thanh toÃ¡n"}
                    </p>
                    <p className="mt-1 text-xs break-all text-[#9f8a77]">
                      {paymentRequest?.transferContent ||
                        invoice?.invoiceNo ||
                        "ChÆ°a phÃ¡t sinh mÃ£ thanh toÃ¡n/hÃ³a Ä‘Æ¡n."}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
                      Tráº¡ng thÃ¡i hoÃ n tiá»n
                    </p>
                    <p className="mt-1 font-black text-[#17213a]">{refundStatus.label}</p>
                    <p className="mt-1 text-xs text-[#9f8a77]">{refundStatus.description}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 border-t border-[#eadfcd] pt-4 text-sm md:grid-cols-2">
                  <DetailMini label="Tá»•ng trÆ°á»›c voucher" value={formatMoney(invoiceGrandTotal)} />
                  <DetailMini label="Sá»‘ tiá»n request" value={formatMoney(paymentRequest?.amount)} />
                  <DetailMini
                    label="Thá»i gian thanh toÃ¡n"
                    value={
                      paymentRequest?.paidTime
                        ? formatDateTime(paymentRequest.paidTime)
                        : invoice?.paymentTime || "-"
                    }
                  />
                  <DetailMini
                    label="MÃ£ invoice"
                    value={invoice?.invoiceNo || "ChÆ°a cÃ³ invoice Ä‘Ã£ thanh toÃ¡n"}
                  />
                  <DetailMini
                    label="PhÆ°Æ¡ng thá»©c"
                    value={invoice?.paymentMethod || paymentRequest?.provider || "-"}
                  />
                  <DetailMini
                    label="Háº¿t háº¡n thanh toÃ¡n"
                    value={
                      paymentRequest?.expiredTime
                        ? formatDateTime(paymentRequest.expiredTime)
                        : "-"
                    }
                  />
                </div>
                <div className="mt-4 rounded-xl bg-white p-3 text-xs font-semibold text-[#7c6f63]">
                  Voucher vÃ  hoÃ n tiá»n Ä‘ang láº¥y tá»« booking/invoice. Náº¿u chÆ°a cÃ³ giao dá»‹ch
                  hoÃ n tiá»n tháº­t, tráº¡ng thÃ¡i sáº½ hiá»ƒn thá»‹ theo dá»¯ liá»‡u refund hiá»‡n cÃ³.
                </div>
                {canUpdateTotals ? (
                  <div className="mt-4 rounded-2xl border border-[#eadfcd] bg-white p-4">
                    <p className="text-sm font-black text-[#17213a]">
                      Cáº­p nháº­t voucher / hoÃ n tiá»n
                    </p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <TextField
                        value={financeForm.voucherCode}
                        onValueChange={(voucherCode) =>
                          setFinanceForm({
                            ...financeForm,
                            voucherCode,
                          })
                        }
                        placeholder="MÃ£ voucher"
                      />
                      <TextField
                        type="number"
                        min="0"
                        value={financeForm.discountAmount}
                        onValueChange={(discountAmount) =>
                          setFinanceForm({
                            ...financeForm,
                            discountAmount: Number(discountAmount) || 0,
                          })
                        }
                        placeholder="Tiá»n giáº£m"
                      />
                      <Select
                        value={financeForm.refundStatus}
                        onValueChange={(value) =>
                          setFinanceForm({ ...financeForm, refundStatus: value })
                        }
                        options={[
                          { value: "NONE", label: "ChÆ°a phÃ¡t sinh" },
                          { value: "REQUESTED", label: "Chá» duyá»‡t hoÃ n tiá»n" },
                          { value: "APPROVED", label: "ÄÃ£ duyá»‡t hoÃ n tiá»n" },
                          { value: "REJECTED", label: "Tá»« chá»‘i hoÃ n tiá»n" },
                          { value: "PAID", label: "ÄÃ£ hoÃ n tiá»n" },
                        ]}
                      />
                      <TextField
                        type="number"
                        min="0"
                        value={financeForm.refundAmount}
                        onValueChange={(refundAmount) =>
                          setFinanceForm({
                            ...financeForm,
                            refundAmount: Number(refundAmount) || 0,
                          })
                        }
                        placeholder="Tiá»n hoÃ n"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => void handleSaveFinance()}
                      disabled={Boolean(actionLoading)}
                      className="mt-3 w-full"
                    >
                      LÆ°u thanh toÃ¡n
                    </Button>
                  </div>
                ) : null}
              </div>
            </SectionPanel>

            <SectionPanel
              eyebrow="Audit"
              title="Lá»‹ch sá»­ chá»‰nh sá»­a"
              icon={<ScrollText className="h-5 w-5" />}
              right={
                <span className="rounded-full bg-[#fff6df] px-3 py-1 text-xs font-bold text-[#8a5724]">
                  {editHistory.length} báº£n ghi
                </span>
              }
            >
              <div className="space-y-3">
                {editHistory.length === 0 ? (
                  <EmptyState text="ChÆ°a cÃ³ lá»‹ch sá»­ chá»‰nh sá»­a cho booking nÃ y." />
                ) : (
                  editHistory.map((item) => <HistoryItem key={item.id} item={item} />)
                )}
              </div>
            </SectionPanel>
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

function HistoryItem({ item }: { item: EditHistoryResponse }) {
  return (
    <div className="rounded-2xl border border-[#eee3d5] bg-[#fbf6ed] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="mt-0.5 rounded-full bg-white p-2 text-[#9b5c24]">
            <ScrollText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-[#17213a]">
              {formatHistoryField(item.fieldName)}
            </p>
            <p className="mt-1 text-sm font-semibold break-words text-[#8a5724]">
              {formatHistoryContent(item.content)}
            </p>
            {item.description ? (
              <p className="mt-1 text-xs text-[#7c6f63]">{item.description}</p>
            ) : null}
          </div>
        </div>
        <div className="shrink-0 text-left md:text-right">
          <p className="text-xs font-bold text-[#17213a]">
            {item.modifiedBy || "system"}
          </p>
          <p className="mt-1 text-xs text-[#7c6f63]">{formatDateTime(item.modifiedAt)}</p>
        </div>
      </div>
    </div>
  );
}

function DetailMini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold tracking-[0.12em] text-[#7c6f63] uppercase">
        {label}
      </p>
      <p className="mt-1 font-semibold break-words text-[#17213a]">{value}</p>
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

function getRefundStatus(
  status: DisplayStatus,
  paidAmount: number,
  refundStatus?: string,
  refundAmount = 0,
) {
  if (refundStatus && refundStatus !== "NONE") {
    return {
      label: formatRefundStatus(refundStatus),
      description:
        refundAmount > 0
          ? `Sá»‘ tiá»n hoÃ n: ${formatMoney(refundAmount)}`
          : "ÄÃ£ cÃ³ tráº¡ng thÃ¡i hoÃ n tiá»n tá»« há»‡ thá»‘ng.",
    };
  }
  if (status === "CANCEL_REQUESTED" && paidAmount > 0) {
    return {
      label: "Chá» duyá»‡t hoÃ n tiá»n",
      description: "Booking Ä‘Ã£ thanh toÃ¡n vÃ  Ä‘ang chá» quáº£n lÃ½ duyá»‡t há»§y.",
    };
  }
  if (status === "CANCELLED" && paidAmount > 0) {
    return {
      label: "Cáº§n kiá»ƒm tra hoÃ n tiá»n",
      description: "Há»‡ thá»‘ng chÆ°a cÃ³ giao dá»‹ch hoÃ n tiá»n riÃªng Ä‘á»ƒ Ä‘á»‘i soÃ¡t tá»± Ä‘á»™ng.",
    };
  }
  return {
    label: "ChÆ°a phÃ¡t sinh",
    description: "ChÆ°a cÃ³ yÃªu cáº§u hoÃ n tiá»n Ä‘Æ°á»£c ghi nháº­n cho booking nÃ y.",
  };
}

function formatRefundStatus(status?: string) {
  const labels: Record<string, string> = {
    NONE: "ChÆ°a phÃ¡t sinh",
    REQUESTED: "Chá» duyá»‡t hoÃ n tiá»n",
    APPROVED: "ÄÃ£ duyá»‡t hoÃ n tiá»n",
    REJECTED: "Tá»« chá»‘i hoÃ n tiá»n",
    PAID: "ÄÃ£ hoÃ n tiá»n",
  };
  if (!status) return labels.NONE;
  return labels[status] ?? status;
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

function formatHistoryField(fieldName?: string) {
  if (!fieldName) return "-";
  return historyFieldLabel[fieldName] ?? fieldName;
}

function formatHistoryContent(content?: string) {
  if (!content) return "-";
  const [from, to] = content.split(" -> ");
  if (!to) return content;
  return `${formatHistoryValue(from)} -> ${formatHistoryValue(to)}`;
}

function formatHistoryValue(value: string) {
  if (!value || value === "null") return "-";
  const asDate = new Date(value);
  if (Number.isFinite(asDate.getTime()) && value.includes("T")) {
    return formatDateTime(value);
  }
  if (bookingStatusLabel[value]) return bookingStatusLabel[value];
  if (detailStatusLabel[value]) return detailStatusLabel[value];
  const asNumber = Number(value);
  if (Number.isFinite(asNumber) && /^-?\d+(\.\d+)?$/.test(value)) {
    return formatMoney(asNumber);
  }
  return value;
}

function shortCode(id: string) {
  return `BK-${id.slice(0, 8).toUpperCase()}`;
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
    return `${days} ngÃ y${hours > 0 ? ` ${hours} giá»` : ""}`;
  }
  if (hours > 0) {
    return `${hours} giá»${minutes > 0 ? ` ${minutes} phÃºt` : ""}`;
  }
  return `${minutes} phÃºt`;
}
