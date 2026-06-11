"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BedDouble, CalendarDays, Check, ReceiptText, Users } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const currencyFormatter = new Intl.NumberFormat("vi-VN");

  const data = useMemo(() => ({
    bookingId: searchParams.get("bookingId") || "",
    paymentId: searchParams.get("paymentId") || "",
    roomId: searchParams.get("roomId") || "",
    roomTitle: searchParams.get("roomTitle") || "Phòng khách sạn",
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
    guests: Number(searchParams.get("guests") || 1),
    total: Number(searchParams.get("total") || 0),
  }), [searchParams]);

  const invoiceHref = `/payment/invoice?${new URLSearchParams({
    bookingId: data.bookingId,
    paymentId: data.paymentId,
    roomId: data.roomId,
    roomTitle: data.roomTitle,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: String(data.guests),
    total: String(data.total),
  }).toString()}`;

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-[980px] px-5 py-10 sm:px-8 lg:px-10">
        <Link href="/room/listroom" className="inline-flex items-center gap-2 text-sm font-medium text-ring">
          <ArrowLeft className="h-4 w-4" />
          Về danh sách phòng
        </Link>

        <div className="mt-10 rounded-3xl border border-border bg-muted/30 p-6 sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Check className="h-7 w-7" />
          </div>
          <div className="mt-5 text-center">
            <h1 className="font-serif text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-tight text-foreground">
              Thanh toán đã được ghi nhận
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-muted-foreground">
              Booking đã chuyển sang trạng thái đã đặt cọc. Hóa đơn tạm thời được tạo từ giao dịch chuyển khoản này.
            </p>
          </div>

          <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-background p-5 sm:grid-cols-2">
            <Info label="Mã booking" value={data.bookingId || "Chưa có"} />
            <Info label="Mã thanh toán" value={data.paymentId || "Chưa có"} />
            <Info label="Phòng" value={data.roomTitle} icon={<BedDouble className="h-4 w-4" />} />
            <Info label="Số khách" value={`${data.guests} người`} icon={<Users className="h-4 w-4" />} />
            <Info label="Nhận phòng" value={data.checkIn || "Chưa có"} icon={<CalendarDays className="h-4 w-4" />} />
            <Info label="Trả phòng" value={data.checkOut || "Chưa có"} icon={<CalendarDays className="h-4 w-4" />} />
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-ring/10 p-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng thanh toán</p>
              <p className="mt-1 text-3xl font-semibold text-ring">{currencyFormatter.format(data.total)}đ</p>
            </div>
            <Link href={invoiceHref} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ring px-6 text-sm font-semibold uppercase tracking-[0.14em] text-background">
              <ReceiptText className="h-4 w-4" />
              Xem hóa đơn
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-foreground">
        {icon}
        {value}
      </p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background p-10 text-center">Đang tải xác nhận...</main>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
