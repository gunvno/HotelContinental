"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CreditCard, Landmark, ShieldCheck, Wallet } from "lucide-react";

export default function PaymentPage() {
  const searchParams = useSearchParams();

  const paymentData = useMemo(() => {
    const roomId = searchParams.get("roomId") || "room-1";
    const roomTitle = searchParams.get("roomTitle") || "Heritage Suite";
    const checkIn = searchParams.get("checkIn") || "15/04/2026";
    const checkOut = searchParams.get("checkOut") || "18/04/2026";
    const guests = Number(searchParams.get("guests") || 2);
    const pricePerNight = Number(searchParams.get("pricePerNight") || 4_500_000);
    const bookingId = `BK-${roomId.toUpperCase()}-${new Date().getFullYear()}`;

    const nights = 3;
    const roomAmount = pricePerNight * nights;
    const tax = Math.round(roomAmount * 0.1);
    const memberDiscount = Math.round(roomAmount * 0.05);
    const total = roomAmount + tax - memberDiscount;

    return {
      bookingId,
      roomId,
      roomTitle,
      checkIn,
      checkOut,
      guests,
      nights,
      roomAmount,
      tax,
      memberDiscount,
      total,
    };
  }, [searchParams]);

  const currencyFormatter = new Intl.NumberFormat("vi-VN");
  const successHref = `/payment/success?${new URLSearchParams({
    bookingId: paymentData.bookingId,
    roomId: paymentData.roomId,
    roomTitle: paymentData.roomTitle,
    checkIn: paymentData.checkIn,
    checkOut: paymentData.checkOut,
    guests: String(paymentData.guests),
    total: String(paymentData.total),
  }).toString()}`;

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
            Xác nhận thông tin &amp; Thanh toán
          </h1>
          <p className="text-muted-foreground mt-3 text-base">
            Chỉ còn một bước nữa để hoàn tất kỳ nghỉ sang trọng của bạn tại Continental Grand Hotel.
          </p>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:items-start">
          <div className="space-y-6">
            <article className="border-border/70 bg-muted/35 rounded-2xl border p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="bg-ring text-background inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold">
                  1
                </span>
                <h2 className="text-foreground font-serif text-3xl">Thông tin khách hàng</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                    Họ và tên
                  </span>
                  <input
                    defaultValue="Nguyễn Hoàng Nam"
                    className="border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-ring"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                    Số điện thoại
                  </span>
                  <input
                    defaultValue="+84 901 234 567"
                    className="border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-ring"
                  />
                </label>

                <label className="space-y-2 sm:col-span-2">
                  <span className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">Email</span>
                  <input
                    defaultValue="hoangnam.luxury@gmail.com"
                    className="border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-ring"
                  />
                </label>

                <label className="space-y-2 sm:col-span-2">
                  <span className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                    Ghi chú đơn hàng (yêu cầu đặc biệt)
                  </span>
                  <textarea
                    rows={3}
                    defaultValue="Ví dụ: Phòng tầng cao, nôi cho em bé, ăn chay..."
                    className="border-border bg-background text-foreground w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-ring"
                  />
                </label>
              </div>
            </article>

            <article className="border-border/70 bg-muted/35 rounded-2xl border p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="bg-ring text-background inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold">
                  2
                </span>
                <h2 className="text-foreground font-serif text-3xl">Phương thức thanh toán</h2>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  className="border-ring/55 bg-background flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left"
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="border-ring inline-flex h-4 w-4 rounded-full border-2 p-[3px]">
                      <span className="bg-ring h-full w-full rounded-full" />
                    </span>
                    <span>
                      <strong className="text-foreground block text-sm">Thẻ tín dụng / Ghi nợ quốc tế</strong>
                      <span className="text-muted-foreground text-xs">Visa, Mastercard, JCB, Amex</span>
                    </span>
                  </span>
                  <CreditCard className="text-muted-foreground h-4 w-4" />
                </button>

                <button
                  type="button"
                  className="border-border bg-background flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left"
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="border-muted-foreground/50 inline-flex h-4 w-4 rounded-full border" />
                    <span>
                      <strong className="text-foreground block text-sm">Chuyển khoản ngân hàng (QR Code)</strong>
                      <span className="text-muted-foreground text-xs">Vietcombank, Techcombank, BIDV...</span>
                    </span>
                  </span>
                  <Landmark className="text-muted-foreground h-4 w-4" />
                </button>

                <button
                  type="button"
                  className="border-border bg-background flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left"
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="border-muted-foreground/50 inline-flex h-4 w-4 rounded-full border" />
                    <span>
                      <strong className="text-foreground block text-sm">Ví điện tử</strong>
                      <span className="text-muted-foreground text-xs">MoMo, ZaloPay, ShopeePay</span>
                    </span>
                  </span>
                  <Wallet className="text-muted-foreground h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-4">
                <label className="space-y-2">
                  <span className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">Số thẻ</span>
                  <input
                    defaultValue="0000 0000 0000 0000"
                    className="border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-ring"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr_0.6fr]">
                  <label className="space-y-2">
                    <span className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">Tên trên thẻ</span>
                    <input
                      defaultValue="NGUYEN HOANG NAM"
                      className="border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-ring"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">Ngày hết hạn</span>
                    <input
                      defaultValue="MM/YY"
                      className="border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-ring"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">CVV</span>
                    <input
                      defaultValue="***"
                      className="border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-ring"
                    />
                  </label>
                </div>
              </div>
            </article>
          </div>

          <aside className="border-border/70 bg-muted/35 rounded-2xl border p-5 sm:p-6 lg:sticky lg:top-24">
            <h3 className="text-foreground font-serif text-3xl">Tóm tắt đơn hàng</h3>

            <div className="border-border mt-4 border-t pt-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=350&q=80"
                  alt="Heritage Suite"
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div>
                  <p className="text-ring font-semibold">{paymentData.roomTitle}</p>
                  <p className="text-muted-foreground text-xs">ID: {paymentData.roomId}</p>
                  <p className="text-muted-foreground text-xs">{paymentData.guests} Người lớn</p>
                  <p className="text-muted-foreground text-xs">01 Giường King</p>
                </div>
              </div>

              <div className="border-border bg-background mt-4 rounded-xl border p-3">
                <div className="grid grid-cols-2 gap-3 border-b border-border pb-2">
                  <div>
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                      Ngày nhận phòng
                    </p>
                    <p className="text-foreground mt-1 text-sm">{paymentData.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                      Ngày trả phòng
                    </p>
                    <p className="text-foreground mt-1 text-sm">{paymentData.checkOut}</p>
                  </div>
                </div>
                <p className="text-muted-foreground pt-2 text-sm">Tổng thời gian: {paymentData.nights} Đêm</p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <div className="text-muted-foreground flex items-center justify-between">
                <span>
                  Giá phòng ({paymentData.nights} đêm x {currencyFormatter.format(paymentData.roomAmount / paymentData.nights)}đ)
                </span>
                <span>{currencyFormatter.format(paymentData.roomAmount)}đ</span>
              </div>
              <div className="text-muted-foreground flex items-center justify-between">
                <span>Thuế &amp; Phí dịch vụ (10%)</span>
                <span>{currencyFormatter.format(paymentData.tax)}đ</span>
              </div>
              <div className="text-ring flex items-center justify-between font-semibold">
                <span>Ưu đãi thành viên (5%)</span>
                <span>- {currencyFormatter.format(paymentData.memberDiscount)}đ</span>
              </div>
            </div>

            <div className="border-border mt-5 border-t pt-4">
              <p className="text-muted-foreground mb-2 text-[11px] tracking-[0.12em] uppercase">
                Mã đặt phòng: {paymentData.bookingId}
              </p>
              <div className="flex items-end justify-between">
                <span className="text-foreground text-lg">Tổng cộng</span>
                <div className="text-right">
                  <p className="text-ring text-[2rem] leading-none font-semibold">{currencyFormatter.format(paymentData.total)}đ</p>
                  <p className="text-muted-foreground mt-1 text-[10px] tracking-[0.12em] uppercase">
                    Đã bao gồm VAT &amp; phí dịch vụ
                  </p>
                </div>
              </div>

              <Link
                href={successHref}
                className="bg-ring text-background mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-[0.16em] uppercase shadow-[0_16px_30px_-18px_rgba(196,122,52,0.75)] transition hover:brightness-105"
              >
                <ShieldCheck className="h-4 w-4" />
                Xác nhận và thanh toán
              </Link>

              <p className="text-muted-foreground mt-3 text-center text-[10px] leading-5">
                Thanh toán bảo mật 256-bit SSL. Bằng cách xác nhận, bạn đồng ý với điều khoản và chính sách
                của Continental Grand Hotel.
              </p>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
