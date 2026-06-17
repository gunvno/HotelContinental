"use client";

import {
  ArrowLeft,
  Building2,
  Minus,
  Plus,
  ShieldCheck,
  TicketPercent,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  createPaymentRequest,
  getLatestPaymentRequestByBooking,
} from "@/services/billing-service";
import {
  createRoomBooking,
  type RoomBookingResponse,
} from "@/services/booking-service";
import { getMyProfile, updateMyPhoneNumber } from "@/services/profile-service";
import {
  applyVoucher,
  type VoucherApplyResponse,
} from "@/services/promotion-service";
import { getCatalogServices, type ServiceResponse } from "@/services/room-service";
import { createMyServiceOrderDetail } from "@/services/service-order-service";
import { useAuthStore } from "@/store/auth-store";

type SelectedServiceMap = Record<string, number>;

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const userName = useAuthStore((state) => state.userName);
  const email = useAuthStore((state) => state.email);
  const firstName = useAuthStore((state) => state.firstName);
  const lastName = useAuthStore((state) => state.lastName);

  const submitLockRef = useRef(false);
  const bookingRef = useRef<RoomBookingResponse | null>(null);
  const serviceOrdersCreatedRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherApplyResponse | null>(null);
  const [voucherMessage, setVoucherMessage] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedServiceMap>({});
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    note: "",
  });

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

  const selectedServiceItems = useMemo(
    () =>
      services
        .map((service) => ({
          service,
          quantity: selectedServices[service.id] ?? 0,
        }))
        .filter((item) => item.quantity > 0),
    [selectedServices, services],
  );

  const selectedServiceTotal = selectedServiceItems.reduce(
    (total, item) => total + Number(item.service.price ?? 0) * item.quantity,
    0,
  );
  const voucherDiscount = appliedVoucher?.discountAmount ?? 0;
  const finalTotal = Math.max(
    0,
    paymentData.baseTotal + selectedServiceTotal - voucherDiscount,
  );
  const totalExtraPrice = paymentData.tax - paymentData.memberDiscount - voucherDiscount;
  const isActionBusy = isSubmitting || isApplyingVoucher;

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

  useEffect(() => {
    let isMounted = true;
    setIsLoadingServices(true);
    getCatalogServices(0, 500)
      .then((data) => {
        if (!isMounted) return;
        setServices(
          data.filter(
            (service) =>
              !service.deleted &&
              (!service.status || service.status === "AVAILABLE" || service.status === "ACTIVE"),
          ),
        );
      })
      .catch(() => {
        if (isMounted) setServices([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingServices(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
      const voucher = await applyVoucher(code, paymentData.baseTotal + selectedServiceTotal);
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

  function changeServiceQuantity(serviceId: string, delta: number) {
    if (isActionBusy) return;
    setSelectedServices((prev) => {
      const nextQuantity = Math.max(0, (prev[serviceId] ?? 0) + delta);
      const next = { ...prev };
      if (nextQuantity === 0) {
        delete next[serviceId];
      } else {
        next[serviceId] = nextQuantity;
      }
      return next;
    });
  }

  async function handleContinueToQr() {
    if (submitLockRef.current || isActionBusy) return;
    submitLockRef.current = true;
    setIsSubmitting(true);
    setBookingError(null);

    try {
      if (customerInfo.phoneNumber.trim()) {
        try {
          await updateMyPhoneNumber(customerInfo.phoneNumber.trim());
        } catch {
          // Profile update is optional here; it must not block booking/payment creation.
        }
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
          totalServicePrice: selectedServiceTotal,
          totalExtraPrice,
          totalPrice: finalTotal,
        });
        bookingRef.current = createdBooking;
      }

      if (!serviceOrdersCreatedRef.current && selectedServiceItems.length > 0) {
        for (const item of selectedServiceItems) {
          await createMyServiceOrderDetail({
            roomBookingId: createdBooking.id,
            serviceId: item.service.id,
            quantity: item.quantity,
            description: "Dịch vụ khách chọn trước khi thanh toán",
          });
        }
        serviceOrdersCreatedRef.current = true;
      }

      let paymentRequest;
      try {
        paymentRequest = await createPaymentRequest({
          roomBookingId: createdBooking.id,
          amount: finalTotal,
        });
      } catch {
        paymentRequest = await getLatestPaymentRequestByBooking(createdBooking.id);
      }

      const params = new URLSearchParams({
        bookingId: createdBooking.id,
        paymentRequestId: paymentRequest.id,
        roomId: paymentData.roomId,
        roomTitle: paymentData.roomTitle,
        checkIn: paymentData.checkIn,
        checkOut: paymentData.checkOut,
        guests: String(paymentData.guests),
        total: String(finalTotal),
      });

      if (appliedVoucher) {
        params.set("voucherCode", appliedVoucher.code);
      }

      router.push(`/payment/qr?${params.toString()}`);
    } catch {
      setBookingError(
        "Không thể tạo booking hoặc mã thanh toán. Vui lòng kiểm tra lại booking-service và billing-service.",
      );
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-background min-h-screen">
      <section className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <Link
          href="/room/listroom"
          className="text-ring inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Trở lại
        </Link>

        <div className="mx-auto mt-8 max-w-3xl text-center">
          <h1 className="text-foreground font-serif text-[clamp(2rem,9vw,3.5rem)] leading-tight font-semibold">
            Xác nhận thông tin đặt phòng
          </h1>
          <p className="text-muted-foreground mt-3 text-base">
            Chọn voucher, thêm dịch vụ bổ sung nếu cần, sau đó chuyển sang bước tạo mã QR.
          </p>
        </div>

        <section className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:items-start lg:gap-6">
          <div className="space-y-6">
            <article className="border-border/70 bg-muted/35 rounded-2xl border p-4 sm:p-6">
              <SectionTitle index={1} title="Thông tin khách hàng" />

              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="Họ và tên" value={customerInfo.fullName} readOnly />
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
                <TextInput
                  label="Email"
                  value={customerInfo.email}
                  readOnly
                  className="sm:col-span-2"
                  placeholder="Tài khoản chưa có email"
                />
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

            <article className="border-border/70 bg-muted/35 rounded-2xl border p-4 sm:p-6">
              <SectionTitle index={2} title="Voucher" />

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
                    className="border-border text-foreground h-11 rounded-full border px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    Bỏ mã
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={isActionBusy}
                    className="bg-ring text-background h-11 rounded-full px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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

            <article className="border-border/70 bg-muted/35 rounded-2xl border p-4 sm:p-6">
              <SectionTitle index={3} title="Dịch vụ bổ sung" />

              <div className="grid gap-3">
                {isLoadingServices ? (
                  <p className="text-muted-foreground rounded-xl bg-white/70 p-4 text-sm">
                    Đang tải dịch vụ...
                  </p>
                ) : services.length === 0 ? (
                  <p className="text-muted-foreground rounded-xl bg-white/70 p-4 text-sm">
                    Chưa có dịch vụ bổ sung khả dụng.
                  </p>
                ) : (
                  services.slice(0, 8).map((service) => {
                    const quantity = selectedServices[service.id] ?? 0;
                    return (
                      <div
                        key={service.id}
                        className="border-border bg-background flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-foreground font-semibold">{service.name}</p>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {service.description || "Dịch vụ cộng thêm theo nhu cầu của khách."}
                          </p>
                          <p className="text-ring mt-2 text-sm font-semibold">
                            {formatMoney(service.price)}
                          </p>
                        </div>
                        <div className="flex h-10 w-full shrink-0 items-center justify-between rounded-full border border-[#ead8c4] bg-[#fffaf3] px-2 sm:w-[132px]">
                          <button
                            type="button"
                            onClick={() => changeServiceQuantity(service.id, -1)}
                            disabled={isActionBusy || quantity === 0}
                            className="text-ring inline-flex h-7 w-7 items-center justify-center rounded-full disabled:opacity-35"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-semibold">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => changeServiceQuantity(service.id, 1)}
                            disabled={isActionBusy}
                            className="bg-ring text-background inline-flex h-7 w-7 items-center justify-center rounded-full disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </article>
          </div>

          <aside className="border-border/70 bg-muted/35 rounded-2xl border p-4 sm:p-6 lg:sticky lg:top-24">
            <h3 className="text-foreground font-serif text-3xl">Tóm tắt đơn hàng</h3>

            <div className="border-border mt-4 border-t pt-4">
              <div className="flex items-center gap-3">
                <div className="bg-background flex h-16 w-16 items-center justify-center rounded-lg">
                  <Building2 className="text-ring h-7 w-7" />
                </div>
                <div>
                  <p className="text-ring font-semibold">{paymentData.roomTitle}</p>
                  <p className="text-muted-foreground text-xs">ID: {paymentData.roomId}</p>
                  <p className="text-muted-foreground text-xs">
                    {paymentData.guests} người lớn
                  </p>
                </div>
              </div>

              <div className="border-border bg-background mt-4 rounded-xl border p-3">
                <div className="border-border grid grid-cols-2 gap-3 border-b pb-2">
                  <InfoBlock label="Ngày nhận phòng" value={paymentData.checkIn} />
                  <InfoBlock
                    label={paymentData.stayType === "hour" ? "Giờ bắt đầu" : "Ngày trả phòng"}
                    value={
                      paymentData.stayType === "hour"
                        ? paymentData.checkInTime
                        : paymentData.checkOut
                    }
                  />
                </div>
                <p className="text-muted-foreground pt-2 text-sm">
                  Tổng thời gian: {paymentData.stayDuration} {paymentData.stayUnit}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <SummaryRow
                label={`Giá phòng (${paymentData.stayDuration} ${paymentData.stayUnit} x ${formatMoney(paymentData.unitPrice)})`}
                value={formatMoney(paymentData.roomAmount)}
              />
              <SummaryRow label="VAT và phụ phí (10%)" value={formatMoney(paymentData.tax)} />
              <SummaryRow
                label="Ưu đãi thành viên (5%)"
                value={`- ${formatMoney(paymentData.memberDiscount)}`}
                highlight
              />
              {selectedServiceTotal > 0 ? (
                <SummaryRow
                  label="Dịch vụ bổ sung"
                  value={formatMoney(selectedServiceTotal)}
                />
              ) : null}
              {appliedVoucher ? (
                <SummaryRow
                  label={`Voucher ${appliedVoucher.code}`}
                  value={`- ${formatMoney(voucherDiscount)}`}
                  highlight
                />
              ) : null}
            </div>

            {selectedServiceItems.length > 0 ? (
              <div className="border-border mt-5 border-t pt-4">
                <p className="text-muted-foreground mb-2 text-[11px] tracking-[0.12em] uppercase">
                  Dịch vụ đã chọn
                </p>
                <div className="space-y-2">
                  {selectedServiceItems.map(({ service, quantity }) => (
                    <div
                      key={service.id}
                      className="text-muted-foreground flex justify-between gap-3 text-xs"
                    >
                      <span>
                        {service.name} x {quantity}
                      </span>
                      <span>{formatMoney(Number(service.price ?? 0) * quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="border-border mt-5 border-t pt-4">
              <div className="flex items-end justify-between">
                <span className="text-foreground text-lg">Tổng cộng</span>
                <div className="text-right">
                  <p className="text-ring text-3xl leading-none font-semibold sm:text-[2rem]">
                    {formatMoney(finalTotal)}
                  </p>
                  <p className="text-muted-foreground mt-1 text-[10px] tracking-[0.12em] uppercase">
                    Đã bao gồm VAT & phí dịch vụ
                  </p>
                </div>
              </div>

              {bookingError ? (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700">
                  {bookingError}
                </p>
              ) : null}

              <button
                suppressHydrationWarning
                type="button"
                onClick={handleContinueToQr}
                disabled={isActionBusy || !paymentData.roomId || finalTotal <= 0}
                className="bg-ring text-background mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-[0.16em] uppercase shadow-[0_16px_30px_-18px_rgba(196,122,52,0.75)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShieldCheck className="h-4 w-4" />
                {isSubmitting ? "Đang tạo mã..." : "Thanh toán"}
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

function SectionTitle({ index, title }: { index: number; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="bg-ring text-background inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold">
        {index}
      </span>
      <h2 className="text-foreground font-serif text-3xl">{title}</h2>
    </div>
  );
}

function TextInput({
  label,
  value,
  readOnly,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
        {label}
      </span>
      <input
        suppressHydrationWarning
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        className="border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm outline-none"
      />
    </label>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
        {label}
      </p>
      <p className="text-foreground mt-1 text-sm">{value}</p>
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
      className={`flex items-center justify-between gap-4 ${highlight ? "text-ring font-semibold" : "text-muted-foreground"}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function formatMoney(value?: number) {
  return `${currencyFormatter.format(Number(value ?? 0))}đ`;
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
