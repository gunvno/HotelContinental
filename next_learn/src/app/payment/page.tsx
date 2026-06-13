"use client";

import {
  ArrowLeft,
  Building2,
  Copy,
  QrCode,
  ShieldCheck,
  TicketPercent,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  createPaymentRequest,
  getLatestPaymentByBooking,
  getPaymentRequest,
  type PaymentRequestResponse,
} from "@/services/billing-service";
import {
  createRoomBooking,
  type RoomBookingResponse,
} from "@/services/booking-service";
import { getMyProfile, updateMyPhoneNumber } from "@/services/profile-service";
import {
  applyVoucher,
  consumeVoucher,
  type VoucherApplyResponse,
} from "@/services/promotion-service";
import { useAuthStore } from "@/store/auth-store";

const BANK_ID = "MB";
const BANK_ACCOUNT_NO = "0386404269";
const BANK_ACCOUNT_NAME = "TA VAN LONG";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const userName = useAuthStore((state) => state.userName);
  const email = useAuthStore((state) => state.email);
  const firstName = useAuthStore((state) => state.firstName);
  const lastName = useAuthStore((state) => state.lastName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [booking, setBooking] = useState<RoomBookingResponse | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequestResponse | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherApplyResponse | null>(null);
  const [voucherMessage, setVoucherMessage] = useState<string | null>(null);
  const submitLockRef = useRef(false);
  const bookingRef = useRef<RoomBookingResponse | null>(null);
  const voucherConsumedRef = useRef(false);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    note: "",
  });
  const isActionBusy = isSubmitting || isApplyingVoucher;

  const paymentData = useMemo(() => {
    const roomId = searchParams.get("roomId") || "";
    const roomTitle = searchParams.get("roomTitle") || "Phòng khách sạn";
    const checkIn = searchParams.get("checkIn") || "";
    const checkOut = searchParams.get("checkOut") || "";
    const guests = Number(searchParams.get("guests") || 1);
    const pricePerNight = Number(searchParams.get("pricePerNight") || 0);
    const stayType = searchParams.get("stayType") || "night";
    const checkInTime = searchParams.get("checkInTime") || "14:00";
    const stayHours = Number(searchParams.get("stayHours") || 3);
    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    const nights =
      Number.isFinite(start.getTime()) && Number.isFinite(end.getTime())
        ? Math.max(
            1,
            Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
          )
        : 1;
    const stayDuration = stayType === "hour" ? stayHours : nights;
    const stayUnit = stayType === "hour" ? "giờ" : "đêm";
    const unitPrice = stayType === "hour" ? Math.round(pricePerNight / 8) : pricePerNight;
    const roomAmount = unitPrice * stayDuration;
    const tax = Math.round(roomAmount * 0.1);
    const memberDiscount = Math.round(roomAmount * 0.05);
    const baseTotal = roomAmount + tax - memberDiscount;

    return {
      roomId,
      roomTitle,
      checkIn,
      checkOut,
      guests,
      stayType,
      checkInTime,
      stayDuration,
      stayUnit,
      unitPrice,
      roomAmount,
      tax,
      memberDiscount,
      baseTotal,
    };
  }, [searchParams]);

  const voucherDiscount = appliedVoucher?.discountAmount ?? 0;
  const finalTotal = Math.max(0, paymentData.baseTotal - voucherDiscount);
  const totalExtraPrice = paymentData.tax - paymentData.memberDiscount - voucherDiscount;

  useEffect(() => {
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    setCustomerInfo((prev) => ({
      ...prev,
      fullName: fullName || userName || "",
      email: email || "",
    }));
  }, [email, firstName, lastName, userName]);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    getMyProfile()
      .then((profile) => {
        if (!isMounted || !profile) return;
        setCustomerInfo((prev) => ({
          ...prev,
          fullName:
            [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() ||
            prev.fullName,
          email: profile.email || prev.email,
          phoneNumber: profile.phoneNumber || prev.phoneNumber,
        }));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [token]);

  const currencyFormatter = new Intl.NumberFormat("vi-VN");
  const checkoutCode = useMemo(() => {
    const roomSuffix = paymentData.roomId
      ? paymentData.roomId.slice(-6).toUpperCase()
      : "ROOM";
    return `CHECKOUT ${roomSuffix} ${paymentData.checkIn.replaceAll("-", "")}`;
  }, [paymentData.checkIn, paymentData.roomId]);
  const bookingId = booking?.id ?? "TẠO KHI XÁC NHẬN";
  const transferContent = paymentRequest?.transferContent ?? (booking?.id ? `BOOKING ${booking.id}` : checkoutCode);
  const transferAmount = paymentRequest?.amount ?? finalTotal;
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT_NO}-compact2.png?amount=${transferAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_ACCOUNT_NAME)}`;

  async function copyText(value: string) {
    if (isActionBusy) return;
    await navigator.clipboard?.writeText(value);
  }

  async function handleApplyVoucher() {
    if (isActionBusy) return;
    const code = voucherCode.trim();
    if (!code) {
      setVoucherMessage("Vui lòng nhập mã voucher.");
      return;
    }

    setIsApplyingVoucher(true);
    setVoucherMessage(null);
    try {
      const voucher = await applyVoucher(code, paymentData.baseTotal);
      setAppliedVoucher(voucher);
      setVoucherCode(voucher.code);
      setVoucherMessage(
        `Đã áp dụng ${voucher.name}. Giảm ${currencyFormatter.format(voucher.discountAmount)}đ.`,
      );
    } catch {
      setAppliedVoucher(null);
      setVoucherMessage("Voucher không hợp lệ, đã hết hạn hoặc đã được sử dụng.");
    } finally {
      setIsApplyingVoucher(false);
    }
  }

  function handleRemoveVoucher() {
    if (isActionBusy) return;
    setAppliedVoucher(null);
    setVoucherMessage(null);
  }

  useEffect(() => {
    if (!paymentRequest || paymentRequest.status !== "PENDING" || !booking) return;

    let alive = true;
    const intervalId = window.setInterval(async () => {
      try {
        const latestRequest = await getPaymentRequest(paymentRequest.id);
        if (!alive) return;
        setPaymentRequest(latestRequest);

        if (latestRequest.status === "PAID") {
          if (appliedVoucher && !voucherConsumedRef.current) {
            voucherConsumedRef.current = true;
            await consumeVoucher(appliedVoucher.code, booking.id);
          }

          const payment = await getLatestPaymentByBooking(booking.id);
          router.push(
            `/payment/success?${new URLSearchParams({
              bookingId: booking.id,
              paymentId: payment.id,
              roomId: paymentData.roomId,
              roomTitle: paymentData.roomTitle,
              checkIn: paymentData.checkIn,
              checkOut: paymentData.checkOut,
              guests: String(paymentData.guests),
              total: String(latestRequest.amount),
            }).toString()}`,
          );
        }

        if (latestRequest.status === "EXPIRED" || latestRequest.status === "FAILED") {
          setBookingError("Yêu cầu thanh toán đã hết hạn hoặc thất bại. Vui lòng tạo lại mã chuyển khoản.");
          submitLockRef.current = false;
          setIsSubmitting(false);
        }
      } catch {
        // Keep polling; transient API errors should not break the waiting screen.
      }
    }, 3000);

    return () => {
      alive = false;
      window.clearInterval(intervalId);
    };
  }, [appliedVoucher, booking, paymentData, paymentRequest, router]);

  async function handleConfirmPayment() {
    if (submitLockRef.current || isActionBusy) return;
    submitLockRef.current = true;
    setIsSubmitting(true);
    setBookingError(null);
    setPaymentNotice(null);
    try {
      if (customerInfo.phoneNumber.trim()) {
        await updateMyPhoneNumber(customerInfo.phoneNumber.trim());
      }

      let createdBooking = bookingRef.current;
      if (!createdBooking) {
        createdBooking = await createRoomBooking({
          roomId: paymentData.roomId,
          checkin: buildCheckin(paymentData.checkIn, paymentData.checkInTime),
          checkout: buildCheckout(
            paymentData.checkIn,
            paymentData.checkOut,
            paymentData.checkInTime,
            paymentData.stayType,
            paymentData.stayDuration,
          ),
          roomPrice: paymentData.unitPrice,
          totalRoomPrice: paymentData.roomAmount,
          totalServicePrice: 0,
          totalExtraPrice,
          totalPrice: finalTotal,
        });
        bookingRef.current = createdBooking;
        setBooking(createdBooking);
      }

      if (!paymentRequest) {
        const createdPaymentRequest = await createPaymentRequest({
          roomBookingId: createdBooking.id,
          amount: finalTotal,
        });
        setPaymentRequest(createdPaymentRequest);
      }

      setPaymentNotice(
        "Đã tạo mã chuyển khoản. Hệ thống sẽ tự chuyển trang khi thanh toán được xác nhận.",
      );
    } catch {
      setBookingError(
        "Không thể tạo yêu cầu thanh toán. Vui lòng kiểm tra lại dịch vụ billing/booking/promotion.",
      );
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-background min-h-screen">
      <section className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-8 lg:px-10">
        <Link
          href="/room/listroom"
          className="text-ring inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Trở lại
        </Link>

        <div className="mx-auto mt-8 max-w-3xl text-center">
          <h1 className="text-foreground font-serif text-[clamp(2.2rem,5vw,3.5rem)] leading-tight font-semibold">
            Xác nhận thông tin & Thanh toán
          </h1>
          <p className="text-muted-foreground mt-3 text-base">
            Kiểm tra thông tin lưu trú, áp voucher nếu có, quét mã chuyển khoản và xác
            nhận sau khi thanh toán.
          </p>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:items-start">
          <div className="space-y-6">
            <article className="border-border/70 bg-muted/35 rounded-2xl border p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="bg-ring text-background inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold">
                  1
                </span>
                <h2 className="text-foreground font-serif text-3xl">
                  Thông tin khách hàng
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                    Họ và tên
                  </span>
                  <input
                    suppressHydrationWarning
                    value={customerInfo.fullName}
                    readOnly
                    className="border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                    Số điện thoại
                  </span>
                  <input
                    suppressHydrationWarning
                    value={customerInfo.phoneNumber}
                    onChange={(event) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        phoneNumber: event.target.value,
                      }))
                    }
                    disabled={isActionBusy}
                    placeholder="Nhập số điện thoại"
                    className="border-border bg-background text-foreground focus:border-ring h-11 w-full rounded-lg border px-3 text-sm transition outline-none disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>

                <label className="space-y-2 sm:col-span-2">
                  <span className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                    Email
                  </span>
                  <input
                    suppressHydrationWarning
                    value={customerInfo.email}
                    readOnly
                    placeholder="Tài khoản chưa có email"
                    className="border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm outline-none"
                  />
                </label>

                <label className="space-y-2 sm:col-span-2">
                  <span className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                    Ghi chú đơn hàng
                  </span>
                  <textarea
                    suppressHydrationWarning
                    rows={3}
                    value={customerInfo.note}
                    onChange={(event) =>
                      setCustomerInfo((prev) => ({ ...prev, note: event.target.value }))
                    }
                    disabled={isActionBusy}
                    placeholder="Ví dụ: Phòng tầng cao, nôi cho em bé, ăn chay..."
                    className="border-border bg-background text-foreground focus:border-ring w-full resize-none rounded-lg border px-3 py-2.5 text-sm transition outline-none disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </label>
              </div>
            </article>

            <article className="border-border/70 bg-muted/35 rounded-2xl border p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="bg-ring text-background inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold">
                  2
                </span>
                <h2 className="text-foreground font-serif text-3xl">Voucher</h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <TicketPercent className="text-ring absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    suppressHydrationWarning
                    value={voucherCode}
                    onChange={(event) => setVoucherCode(event.target.value.toUpperCase())}
                    disabled={!!appliedVoucher || isActionBusy}
                    placeholder="Nhập mã voucher"
                    className="border-border bg-background text-foreground focus:border-ring h-11 w-full rounded-lg border pr-3 pl-9 text-sm transition outline-none disabled:opacity-70"
                  />
                </label>
                {appliedVoucher ? (
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    disabled={isActionBusy}
                    className="border-border text-foreground h-11 rounded-full border px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Bỏ mã
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={isActionBusy}
                    className="bg-ring text-background h-11 rounded-full px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isApplyingVoucher ? "Đang kiểm tra..." : "Áp dụng"}
                  </button>
                )}
              </div>
              {voucherMessage ? (
                <p
                  className={`mt-3 rounded-xl p-3 text-sm ${appliedVoucher ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                >
                  {voucherMessage}
                </p>
              ) : null}
            </article>

            <article className="border-border/70 bg-muted/35 rounded-2xl border p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="bg-ring text-background inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold">
                  3
                </span>
                <h2 className="text-foreground font-serif text-3xl">
                  Chuyển khoản ngân hàng
                </h2>
              </div>

              <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                <div className="border-border bg-background rounded-2xl border p-4">
                  <div className="text-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
                    <QrCode className="text-ring h-4 w-4" />
                    Mã QR chuyển khoản
                  </div>
                  <img
                    src={qrUrl}
                    alt="Mã QR chuyển khoản"
                    className="mx-auto aspect-square w-full rounded-xl bg-white object-contain"
                  />
                </div>

                <div className="space-y-3">
                  <BankInfoRow label="Ngân hàng" value="MB Bank" />
                  <BankInfoRow
                    label="Số tài khoản"
                    value={BANK_ACCOUNT_NO}
                    copyValue={BANK_ACCOUNT_NO}
                    onCopy={copyText}
                    disabled={isActionBusy}
                  />
                  <BankInfoRow label="Chủ tài khoản" value={BANK_ACCOUNT_NAME} />
                  <BankInfoRow
                    label="Số tiền"
                    value={`${currencyFormatter.format(finalTotal)}đ`}
                    copyValue={String(finalTotal)}
                    onCopy={copyText}
                    disabled={isActionBusy}
                  />
                  <BankInfoRow
                    label="Nội dung chuyển khoản"
                    value={transferContent}
                    copyValue={transferContent}
                    onCopy={copyText}
                    disabled={isActionBusy}
                  />
                  <p className="bg-ring/10 text-muted-foreground rounded-xl p-3 text-sm leading-6">
                    Khi quét mã bằng app ngân hàng, số tiền và nội dung sẽ được tự điền.
                    Sau khi yêu cầu thanh toán được xác nhận, hệ thống sẽ tự chuyển sang
                    màn hình thành công.
                  </p>
                  {paymentNotice ? (
                    <p className="rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-emerald-700">
                      {paymentNotice}
                    </p>
                  ) : null}
                  {bookingError ? (
                    <p className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700">
                      {bookingError}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          </div>

          <aside className="border-border/70 bg-muted/35 rounded-2xl border p-5 sm:p-6 lg:sticky lg:top-24">
            <h3 className="text-foreground font-serif text-3xl">Tóm tắt đơn hàng</h3>

            <div className="border-border mt-4 border-t pt-4">
              <div className="flex items-center gap-3">
                <div className="bg-background flex h-16 w-16 items-center justify-center rounded-lg">
                  <Building2 className="text-ring h-7 w-7" />
                </div>
                <div>
                  <p className="text-ring font-semibold">{paymentData.roomTitle}</p>
                  <p className="text-muted-foreground text-xs">
                    ID: {paymentData.roomId}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {paymentData.guests} người lớn
                  </p>
                </div>
              </div>

              <div className="border-border bg-background mt-4 rounded-xl border p-3">
                <div className="border-border grid grid-cols-2 gap-3 border-b pb-2">
                  <div>
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                      Ngày nhận phòng
                    </p>
                    <p className="text-foreground mt-1 text-sm">{paymentData.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                      {paymentData.stayType === "hour" ? "Giờ bắt đầu" : "Ngày trả phòng"}
                    </p>
                    <p className="text-foreground mt-1 text-sm">
                      {paymentData.stayType === "hour"
                        ? paymentData.checkInTime
                        : paymentData.checkOut}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground pt-2 text-sm">
                  Tổng thời gian: {paymentData.stayDuration} {paymentData.stayUnit}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <SummaryRow
                label={`Giá phòng (${paymentData.stayDuration} ${paymentData.stayUnit} x ${currencyFormatter.format(paymentData.unitPrice)}đ)`}
                value={`${currencyFormatter.format(paymentData.roomAmount)}đ`}
              />
              <SummaryRow
                label="VAT và phụ phí (10%)"
                value={`${currencyFormatter.format(paymentData.tax)}đ`}
              />
              <SummaryRow
                label="Ưu đãi thành viên (5%)"
                value={`- ${currencyFormatter.format(paymentData.memberDiscount)}đ`}
                highlight
              />
              {appliedVoucher ? (
                <SummaryRow
                  label={`Voucher ${appliedVoucher.code}`}
                  value={`- ${currencyFormatter.format(voucherDiscount)}đ`}
                  highlight
                />
              ) : null}
            </div>

            <div className="border-border mt-5 border-t pt-4">
              <p className="text-muted-foreground mb-2 text-[11px] tracking-[0.12em] uppercase">
                Mã đặt phòng: {bookingId}
              </p>
              <div className="flex items-end justify-between">
                <span className="text-foreground text-lg">Tổng cộng</span>
                <div className="text-right">
                  <p className="text-ring text-[2rem] leading-none font-semibold">
                    {currencyFormatter.format(finalTotal)}đ
                  </p>
                  <p className="text-muted-foreground mt-1 text-[10px] tracking-[0.12em] uppercase">
                    Đã bao gồm VAT & phí dịch vụ
                  </p>
                </div>
              </div>

              <button
                suppressHydrationWarning
                type="button"
                onClick={handleConfirmPayment}
                disabled={isActionBusy}
                className="bg-ring text-background mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-[0.16em] uppercase shadow-[0_16px_30px_-18px_rgba(196,122,52,0.75)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShieldCheck className="h-4 w-4" />
                {paymentRequest?.status === "PENDING"
                  ? "Đang chờ xác nhận"
                  : isSubmitting
                    ? "Đang tạo mã..."
                    : "Tạo mã chuyển khoản"}
              </button>

              <p className="text-muted-foreground mt-3 text-center text-[10px] leading-5">
                Khi xác nhận, bạn đồng ý với{" "}
                <Link
                  href="/terms"
                  className="text-ring font-semibold underline underline-offset-2"
                >
                  điều khoản
                </Link>{" "}
                và{" "}
                <Link
                  href="/cancellation-policy"
                  className="text-ring font-semibold underline underline-offset-2"
                >
                  chính sách hủy phòng
                </Link>
                .
              </p>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function BankInfoRow({
  label,
  value,
  copyValue,
  onCopy,
  disabled = false,
}: {
  label: string;
  value: string;
  copyValue?: string;
  onCopy?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="border-border bg-background rounded-xl border px-4 py-3">
      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
        {label}
      </p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-foreground text-sm font-semibold break-all">{value}</p>
        {copyValue && onCopy ? (
          <button
            suppressHydrationWarning
            type="button"
            disabled={disabled}
            onClick={() => onCopy(copyValue)}
            className="border-border text-muted-foreground hover:text-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Copy className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${highlight ? "text-ring font-semibold" : "text-muted-foreground"}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function buildCheckin(checkIn: string, checkInTime: string) {
  return `${checkIn}T${normalizeTime(checkInTime)}:00`;
}

function buildCheckout(
  checkIn: string,
  checkOut: string,
  checkInTime: string,
  stayType: string,
  stayDuration: number,
) {
  if (stayType === "hour") {
    const start = new Date(buildCheckin(checkIn, checkInTime));
    start.setHours(start.getHours() + stayDuration);
    return toLocalDateTimeString(start);
  }

  return `${checkOut}T12:00:00`;
}

function normalizeTime(value: string) {
  return value.length === 5 ? value : "14:00";
}

function toLocalDateTimeString(value: Date) {
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:00`;
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-background min-h-screen p-10 text-center">
          Đang tải thanh toán...
        </main>
      }
    >
      <ProtectedRoute>
        <PaymentContent />
      </ProtectedRoute>
    </Suspense>
  );
}
