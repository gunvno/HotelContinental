"use client";

import {
  BedDouble,
  CalendarDays,
  Check,
  Home,
  ReceiptText,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const data = useMemo(
    () => ({
      bookingId: searchParams.get("bookingId") || "",
      paymentId: searchParams.get("paymentId") || "",
      roomId: searchParams.get("roomId") || "",
      roomTitle: searchParams.get("roomTitle") || "Phòng khách sạn",
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
      guests: Number(searchParams.get("guests") || 1),
      total: Number(searchParams.get("total") || 0),
    }),
    [searchParams],
  );

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
    <main className="bg-background min-h-screen">
      <section className="mx-auto w-full max-w-[980px] px-5 py-10 sm:px-8 lg:px-10">
        <div className="border-border bg-muted/30 mt-4 rounded-3xl border p-6 sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Check className="h-7 w-7" />
          </div>
          <div className="mt-5 text-center">
            <h1 className="text-foreground font-serif text-[clamp(2.1rem,5vw,3.6rem)] leading-tight font-semibold">
              Thanh toán đã được ghi nhận
            </h1>
            <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-base leading-7">
              Booking đã chuyển sang trạng thái đã thanh toán. Bạn có thể xem hóa đơn
              hoặc quay về trang chủ để tiếp tục sử dụng dịch vụ.
            </p>
          </div>

          <div className="border-border bg-background mt-8 grid gap-4 rounded-2xl border p-5 sm:grid-cols-2">
            <Info label="Mã booking" value={data.bookingId || "Chưa có"} />
            <Info label="Mã thanh toán" value={data.paymentId || "Chưa có"} />
            <Info
              label="Phòng"
              value={data.roomTitle}
              icon={<BedDouble className="h-4 w-4" />}
            />
            <Info
              label="Số khách"
              value={`${data.guests} người`}
              icon={<Users className="h-4 w-4" />}
            />
            <Info
              label="Nhận phòng"
              value={data.checkIn || "Chưa có"}
              icon={<CalendarDays className="h-4 w-4" />}
            />
            <Info
              label="Trả phòng"
              value={data.checkOut || "Chưa có"}
              icon={<CalendarDays className="h-4 w-4" />}
            />
          </div>

          <div className="bg-ring/10 mt-6 flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Tổng thanh toán</p>
              <p className="text-ring mt-1 text-3xl font-semibold">
                {currencyFormatter.format(data.total)}đ
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="border-ring text-ring inline-flex h-11 items-center justify-center gap-2 rounded-full border px-6 text-sm font-semibold tracking-[0.14em] uppercase"
              >
                <Home className="h-4 w-4" />
                Về trang chủ
              </Link>
              <Link
                href={invoiceHref}
                className="bg-ring text-background inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold tracking-[0.14em] uppercase"
              >
                <ReceiptText className="h-4 w-4" />
                Xem hóa đơn
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
        {label}
      </p>
      <p className="text-foreground mt-1 inline-flex items-center gap-2 text-sm font-medium">
        {icon}
        {value}
      </p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-background min-h-screen p-10 text-center">
          Đang tải xác nhận...
        </main>
      }
    >
      <ProtectedRoute>
        <PaymentSuccessContent />
      </ProtectedRoute>
    </Suspense>
  );
}
