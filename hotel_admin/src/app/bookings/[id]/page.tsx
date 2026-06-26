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
import { ToastBridge } from "@/components/ui/toast";
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
  markBookingServiceOrdersPaidAtCheckout,
  type ServiceOrderDetailResponse,
  type ServiceOrderCheckoutPaymentMethod,
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

const paymentStatusLabel: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  EXPIRED: "Hết hạn",
  FAILED: "Thất bại",
};

const serviceStatusLabel: Record<string, string> = {
  WAITING: "Chờ phục vụ",
  SERVED: "Đã phục vụ",
};

const servicePaymentStatusLabel: Record<string, string> = {
  POST_TO_ROOM: "Thu khi checkout",
  PENDING_PAYMENT: "Chờ thanh toán online",
  PAID: "Đã thanh toán",
};

const historyFieldLabel: Record<string, string> = {
  checkin: "Ngày nhận phòng",
  checkout: "Ngày trả phòng",
  checkin_reality: "Giờ thực nhận",
  checkout_reality: "Giờ thực trả",
  booking_status: "Trạng thái booking",
  detail_status: "Trạng thái phòng",
  total_room_price: "Tiền phòng",
  total_service_price: "Tiền dịch vụ",
  total_extra_price: "Phụ thu",
  total_price: "Tổng tiền",
  voucher_code: "Mã voucher",
  discount_amount: "Tiền giảm giá",
  refund_status: "Trạng thái hoàn tiền",
  refund_amount: "Tiền hoàn",
};

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const permission = usePermission();
  const isManager = permission.has("ROLE_MANAGER");
  const isReceptionist = permission.has("ROLE_RECEPTIONIST");
  const canViewBookings = permission.has("BOOKING_VIEW");
  const canCheckIn = permission.has("BOOKING_CHECKIN") && isReceptionist;
  const canCheckOut = permission.has("BOOKING_CHECKOUT") && isReceptionist;
  const canCancelBooking = permission.has("BOOKING_CANCEL") && isManager;
  const canConfirmPayment = permission.has("PAYMENT_CONFIRM") && isReceptionist;
  const canUpdateTotals = permission.has("BOOKING_UPDATE_TOTALS") && isManager;
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
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] =
    useState<ServiceOrderCheckoutPaymentMethod>("CASH");
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
        "Không thể tải chi tiết booking. Kiểm tra booking-service và quyền BOOKING_VIEW.",
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
      setMessage("Không thể thực hiện thao tác này. Kiểm tra trạng thái booking và quyền tài khoản.");
    } finally {
      setActionLoading(null);
    }
  }

  function handleCancelBooking() {
    if (!booking) return;
    const ok = window.confirm(
      "Bạn chắc chắn muốn hủy booking này? Booking đã thanh toán sẽ chuyển sang yêu cầu hủy để quản lý duyệt.",
    );
    if (!ok) return;
    void runBookingAction("cancel", `Đã gửi thao tác hủy booking ${shortCode(booking.id)}.`, () =>
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
      `Đã cập nhật thanh toán cho booking ${shortCode(booking.id)}.`,
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

  async function handleCheckout() {
    if (!booking || actionLoading) return;
    await runBookingAction(
      "checkout",
      `Đã check-out booking ${shortCode(booking.id)}.`,
      async () => {
        if (unpaidServiceTotal > 0) {
          await markBookingServiceOrdersPaidAtCheckout(booking.id, {
            paymentMethod: checkoutPaymentMethod,
            note: `Checkout service charges - ${shortCode(booking.id)}`,
          });
        }
        await checkOutRoomBooking(booking.id);
      },
    );
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
  const unpaidServiceTotal = services
    .filter((item) => item.chargeable !== false)
    .filter((item) => item.source !== "INCLUDED")
    .filter((item) => item.paymentStatus !== "PAID")
    .reduce(
      (total, item) => total + Number(item.totalPrice || item.price * item.quantity || 0),
      0,
    );
  const refundAmount = invoice?.refundAmount ?? booking?.refundAmount ?? 0;
  const checkoutAmountDue = Math.max(remainingAmount, unpaidServiceTotal);
  const refundStatus = getRefundStatus(
    displayStatus,
    paidAmount,
    invoice?.refundStatus ?? booking?.refundStatus,
    refundAmount,
  );

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
        <ToastBridge success={message} onClearSuccess={() => setMessage(null)} />
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-10 text-center text-[#7c6f63]">
          Đang tải chi tiết booking...
        </div>
      ) : booking ? (
        <>
          <section className="rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold tracking-[0.22em] text-[#9b5c24] uppercase">
                  Trung tâm vận hành booking
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
                  Mã đầy đủ: {booking.id}
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
                  Tải lại
                </Button>
                {displayStatus === "PENDING" && canConfirmPayment ? (
                  <Button
                    type="button"
                    disabled={Boolean(actionLoading)}
                    onClick={() =>
                      void runBookingAction(
                        "payment",
                        `Đã xác nhận chuyển khoản cho booking ${shortCode(booking.id)}.`,
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
                    Xác nhận CK
                  </Button>
                ) : null}
                {readyToCheckIn && canCheckIn ? (
                  <Button
                    type="button"
                    disabled={Boolean(actionLoading)}
                    onClick={() => router.push(`/bookings/${booking.id}/checkin`)}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Check-in
                  </Button>
                ) : null}
                {readyToCheckOut && canCheckOut ? (
                  <Button
                    type="button"
                    disabled={Boolean(actionLoading)}
                    onClick={() => void handleCheckout()}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Check-out
                  </Button>
                ) : null}
                {canCancelThisBooking && canCancelBooking ? (
                  <Button
                    type="button"
                    disabled={Boolean(actionLoading)}
                    onClick={handleCancelBooking}
                    className="gap-2 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    <XCircle className="h-4 w-4" />
                    Hủy booking
                  </Button>
                ) : null}
                {canApproveThisCancellation && canCancelBooking ? (
                  <Button
                    type="button"
                    disabled={Boolean(actionLoading)}
                    onClick={() =>
                      void runBookingAction(
                        "approve-cancel",
                        `Đã duyệt hủy booking ${shortCode(booking.id)}.`,
                        () => approveRoomBookingCancellation(booking.id),
                      )
                    }
                    className="gap-2"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Duyệt hủy
                  </Button>
                ) : null}
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryInfoCard
              icon={<UserRound className="h-5 w-5" />}
              label="Khách đặt"
              value={customerName}
              sub={customer?.email || customer?.username || booking.customerId}
            />
            <SummaryInfoCard
              icon={<BedDouble className="h-5 w-5" />}
              label="Phòng"
              value={roomName}
              sub={room?.roomTypes?.name || booking.roomId}
            />
            <SummaryInfoCard
              icon={<Clock3 className="h-5 w-5" />}
              label="Thời lượng"
              value={getDurationLabel(booking.checkin, booking.checkout)}
              sub={booking.bookingType}
            />
            <SummaryInfoCard
              icon={<BadgeDollarSign className="h-5 w-5" />}
              label="Tổng tiền"
              value={formatMoney(booking.totalPrice)}
              sub={`Đặt cọc ${formatMoney(booking.deposit)}`}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <SectionPanel
              eyebrow="Booking"
              title="Thông tin booking"
              icon={<FileText className="h-5 w-5" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <LargeInfoCard
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Nhận phòng dự kiến"
                  value={formatDateTime(booking.checkin)}
                />
                <LargeInfoCard
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Trả phòng dự kiến"
                  value={formatDateTime(booking.checkout)}
                />
                <LargeInfoCard
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="Thực nhận"
                  value={booking.checkinReality ? formatDateTime(booking.checkinReality) : "-"}
                />
                <LargeInfoCard
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="Thực trả"
                  value={booking.checkoutReality ? formatDateTime(booking.checkoutReality) : "-"}
                />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <DetailInfoCard label="Trạng thái booking" value={formatBookingStatus(booking.status)} />
                <DetailInfoCard label="Trạng thái phòng" value={formatDetailStatus(booking.detailStatus)} />
                <DetailInfoCard label="Loại booking" value={booking.bookingType} />
                <DetailInfoCard label="Mã khách" value={booking.customerId} />
              </div>
            </SectionPanel>

            <SectionPanel
              eyebrow="Phòng"
              title="Phòng đang xử lý"
              icon={<BedDouble className="h-5 w-5" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <DetailInfoCard label="Tên phòng" value={roomName} />
                <DetailInfoCard label="Loại phòng" value={room?.roomTypes?.name || "-"} />
                <DetailInfoCard label="Diện tích" value={room?.roomSize || "-"} />
                <DetailInfoCard label="Trạng thái phòng" value={room?.status || "-"} />
                <DetailInfoCard label="Giá theo ngày" value={formatMoney(room?.pricePerDay)} />
                <DetailInfoCard label="Giá theo giờ" value={formatMoney(room?.pricePerHour)} />
              </div>
            </SectionPanel>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <SectionPanel
              eyebrow="Khách lưu trú"
              title="Danh sách người ở"
              icon={<UsersRound className="h-5 w-5" />}
              right={
                canCheckIn ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={displayStatus === "CHECKED_OUT" || displayStatus === "CANCELLED"}
                  onClick={() => router.push(`/bookings/${booking.id}/checkin`)}
                >
                  Cập nhật
                </Button>
                ) : null
              }
            >
              {guests.length === 0 ? (
                <EmptyState text="Chưa có khách lưu trú. Khi check-in, lễ tân nhập danh sách người ở tại đây." />
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
                            Khách {index + 1}
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
                        <span>Giấy tờ: {guest.identityNumber}</span>
                        <span>Ngày sinh: {formatPlainDate(guest.dateOfBirth)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionPanel>

            <SectionPanel
              eyebrow="Dịch vụ phát sinh"
              title="Dịch vụ của booking"
              icon={<Utensils className="h-5 w-5" />}
            >
              {services.length === 0 ? (
                <EmptyState text="Chưa có dịch vụ phát sinh hoặc dịch vụ đi kèm nào được ghi nhận." />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-[#eee3d5]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#fbf6ed] text-xs font-bold tracking-[0.12em] text-[#7c6f63] uppercase">
                      <tr>
                        <th className="px-4 py-3">Dịch vụ</th>
                        <th className="px-4 py-3">SL</th>
                        <th className="px-4 py-3">Tiền</th>
                        <th className="px-4 py-3">Trạng thái</th>
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
                              {item.source === "INCLUDED" ? "Đi kèm" : "Phát sinh"}
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
                            <p className="mt-2 text-xs font-semibold text-[#7c6f63]">
                              {servicePaymentStatusLabel[item.paymentStatus ?? "POST_TO_ROOM"]}
                            </p>
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
              eyebrow="Hóa đơn / thanh toán"
              title="Invoice & thanh toán"
              icon={<ReceiptText className="h-5 w-5" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <MoneyInfoCard label="Tiền phòng" value={formatMoney(invoiceRoomTotal)} />
                <MoneyInfoCard label="Tiền dịch vụ" value={formatMoney(invoiceServiceTotal)} />
                <MoneyInfoCard label="Phụ thu" value={formatMoney(invoiceExtraTotal)} />
                <MoneyInfoCard
                  label="Voucher"
                  value={
                    discountAmount > 0
                      ? `-${formatMoney(discountAmount)}${voucherCode ? ` (${voucherCode})` : ""}`
                      : "Chưa áp dụng"
                  }
                />
                <MoneyInfoCard label="Đặt cọc / đã trả" value={formatMoney(paidAmount)} />
                <MoneyInfoCard label="Còn phải trả" value={formatMoney(remainingAmount)} strong />
              </div>
              {readyToCheckOut ? (
                <div className="mt-4 rounded-2xl border border-[#c8792a] bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-bold tracking-[0.16em] text-[#9b5c24] uppercase">
                        Quy trình checkout
                      </p>
                      <h3 className="mt-1 text-xl font-black text-[#17213a]">
                        Xác nhận thu tiền và kết thúc lưu trú
                      </h3>
                      <p className="mt-1 text-sm text-[#7c6f63]">
                        Kiểm tra các khoản còn phải thu trước khi chuyển booking sang trạng thái đã trả phòng.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#fff6df] px-4 py-3 text-right">
                      <p className="text-xs font-bold tracking-[0.14em] text-[#8a5724] uppercase">
                        Cần thu khi checkout
                      </p>
                      <p className="mt-1 text-2xl font-black text-[#17213a]">
                        {formatMoney(checkoutAmountDue)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <CheckoutLine label="Tiền phòng đã trả" value={formatMoney(paidAmount)} />
                    <CheckoutLine
                      label="Dịch vụ trả sau"
                      value={formatMoney(unpaidServiceTotal)}
                      note="Chỉ gồm dịch vụ chưa thanh toán online."
                    />
                    <CheckoutLine label="Phụ thu" value={formatMoney(invoiceExtraTotal)} />
                    <CheckoutLine
                      label="Hoàn tiền nếu có"
                      value={refundAmount > 0 ? formatMoney(refundAmount) : "Không phát sinh"}
                      note={refundStatus.label}
                    />
                    <CheckoutLine label="Còn phải trả" value={formatMoney(remainingAmount)} strong />
                    <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ed] p-4">
                      <p className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
                        Phương thức thu
                      </p>
                      <Select
                        value={checkoutPaymentMethod}
                        onValueChange={(value) =>
                          setCheckoutPaymentMethod(value as ServiceOrderCheckoutPaymentMethod)
                        }
                        className="mt-2"
                        options={[
                          { value: "CASH", label: "Tiền mặt" },
                          { value: "BANK_TRANSFER", label: "Chuyển khoản" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#fbf6ed] p-4 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-[#6f5f50]">
                      <p className="font-bold text-[#17213a]">Xác nhận kết thúc lưu trú</p>
                      <p>
                        Khi xác nhận, hệ thống sẽ ghi nhận thanh toán dịch vụ trả sau rồi check-out booking.
                      </p>
                    </div>
                    <Button
                      type="button"
                      disabled={!canCheckOut || Boolean(actionLoading)}
                      onClick={() => void handleCheckout()}
                      className="gap-2 md:min-w-[220px]"
                    >
                      <LogOut className="h-4 w-4" />
                      Xác nhận check-out
                    </Button>
                  </div>
                </div>
              ) : null}
              <div className="mt-4 rounded-2xl border border-[#eee3d5] bg-[#fbf6ed] p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
                      Trạng thái thanh toán
                    </p>
                    <p className="mt-1 font-black text-[#17213a]">
                      {paymentRequest
                        ? paymentStatusLabel[paymentRequest.status] ?? paymentRequest.status
                        : "Chưa có yêu cầu thanh toán"}
                    </p>
                    <p className="mt-1 text-xs break-all text-[#9f8a77]">
                      {paymentRequest?.transferContent ||
                        invoice?.invoiceNo ||
                        "Chưa phát sinh mã thanh toán/hóa đơn."}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
                      Trạng thái hoàn tiền
                    </p>
                    <p className="mt-1 font-black text-[#17213a]">{refundStatus.label}</p>
                    <p className="mt-1 text-xs text-[#9f8a77]">{refundStatus.description}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 border-t border-[#eadfcd] pt-4 text-sm md:grid-cols-2">
                  <DetailMini label="Tổng trước voucher" value={formatMoney(invoiceGrandTotal)} />
                  <DetailMini label="Số tiền request" value={formatMoney(paymentRequest?.amount)} />
                  <DetailMini
                    label="Thời gian thanh toán"
                    value={
                      paymentRequest?.paidTime
                        ? formatDateTime(paymentRequest.paidTime)
                        : invoice?.paymentTime || "-"
                    }
                  />
                  <DetailMini
                    label="Mã invoice"
                    value={invoice?.invoiceNo || "Chưa có invoice đã thanh toán"}
                  />
                  <DetailMini
                    label="Phương thức"
                    value={invoice?.paymentMethod || paymentRequest?.provider || "-"}
                  />
                  <DetailMini
                    label="Hết hạn thanh toán"
                    value={
                      paymentRequest?.expiredTime
                        ? formatDateTime(paymentRequest.expiredTime)
                        : "-"
                    }
                  />
                </div>
                <div className="mt-4 rounded-xl bg-white p-3 text-xs font-semibold text-[#7c6f63]">
                  Voucher và hoàn tiền đang lấy từ booking/invoice. Nếu chưa có giao dịch
                  hoàn tiền thật, trạng thái sẽ hiển thị theo dữ liệu refund hiện có.
                </div>
                {canUpdateTotals ? (
                  <div className="mt-4 rounded-2xl border border-[#eadfcd] bg-white p-4">
                    <p className="text-sm font-black text-[#17213a]">
                      Cập nhật voucher / hoàn tiền
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
                        placeholder="Mã voucher"
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
                        placeholder="Tiền giảm"
                      />
                      <Select
                        value={financeForm.refundStatus}
                        onValueChange={(value) =>
                          setFinanceForm({ ...financeForm, refundStatus: value })
                        }
                        options={[
                          { value: "NONE", label: "Chưa phát sinh" },
                          { value: "REQUESTED", label: "Chờ duyệt hoàn tiền" },
                          { value: "APPROVED", label: "Đã duyệt hoàn tiền" },
                          { value: "REJECTED", label: "Từ chối hoàn tiền" },
                          { value: "PAID", label: "Đã hoàn tiền" },
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
                        placeholder="Tiền hoàn"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => void handleSaveFinance()}
                      disabled={Boolean(actionLoading)}
                      className="mt-3 w-full"
                    >
                      Lưu thanh toán
                    </Button>
                  </div>
                ) : null}
              </div>
            </SectionPanel>

            <SectionPanel
              eyebrow="Audit"
              title="Lịch sử chỉnh sửa"
              icon={<ScrollText className="h-5 w-5" />}
              right={
                <span className="rounded-full bg-[#fff6df] px-3 py-1 text-xs font-bold text-[#8a5724]">
                  {editHistory.length} bản ghi
                </span>
              }
            >
              <div className="space-y-3">
                {editHistory.length === 0 ? (
                  <EmptyState text="Chưa có lịch sử chỉnh sửa cho booking này." />
                ) : (
                  editHistory.map((item) => <HistoryItem key={item.id} item={item} />)
                )}
              </div>
            </SectionPanel>
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

function CheckoutLine({
  label,
  value,
  note,
  strong = false,
}: {
  label: string;
  value: string;
  note?: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ed] p-4">
      <p className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
        {label}
      </p>
      <p className={`mt-1 ${strong ? "text-2xl" : "text-lg"} font-black text-[#17213a]`}>
        {value}
      </p>
      {note ? <p className="mt-1 text-xs font-semibold text-[#9f8a77]">{note}</p> : null}
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
          ? `Số tiền hoàn: ${formatMoney(refundAmount)}`
          : "Đã có trạng thái hoàn tiền từ hệ thống.",
    };
  }
  if (status === "CANCEL_REQUESTED" && paidAmount > 0) {
    return {
      label: "Chờ duyệt hoàn tiền",
      description: "Booking đã thanh toán và đang chờ quản lý duyệt hủy.",
    };
  }
  if (status === "CANCELLED" && paidAmount > 0) {
    return {
      label: "Cần kiểm tra hoàn tiền",
      description: "Hệ thống chưa có giao dịch hoàn tiền riêng để đối soát tự động.",
    };
  }
  return {
    label: "Chưa phát sinh",
    description: "Chưa có yêu cầu hoàn tiền được ghi nhận cho booking này.",
  };
}

function formatRefundStatus(status?: string) {
  const labels: Record<string, string> = {
    NONE: "Chưa phát sinh",
    REQUESTED: "Chờ duyệt hoàn tiền",
    APPROVED: "Đã duyệt hoàn tiền",
    REJECTED: "Từ chối hoàn tiền",
    PAID: "Đã hoàn tiền",
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
    return `${days} ngày${hours > 0 ? ` ${hours} giờ` : ""}`;
  }
  if (hours > 0) {
    return `${hours} giờ${minutes > 0 ? ` ${minutes} phút` : ""}`;
  }
  return `${minutes} phút`;
}
