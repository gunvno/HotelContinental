"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BedDouble, Download, Printer } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";

function InvoiceContent() {
  const searchParams = useSearchParams();
  const currency = new Intl.NumberFormat("vi-VN");

  const data = useMemo(() => {
    const bookingId = searchParams.get("bookingId") || "";
    const paymentId = searchParams.get("paymentId") || "";
    const roomId = searchParams.get("roomId") || "";
    const roomTitle = searchParams.get("roomTitle") || "Phòng khách sạn";
    const checkIn = searchParams.get("checkIn") || "";
    const checkOut = searchParams.get("checkOut") || "";
    const guests = Number(searchParams.get("guests") || 1);
    const total = Number(searchParams.get("total") || 0);
    const subTotal = Math.round(total / 1.1);
    const serviceFee = total - subTotal;

    return {
      bookingId,
      paymentId,
      roomId,
      roomTitle,
      checkIn,
      checkOut,
      guests,
      total,
      subTotal,
      serviceFee,
      invoiceNo: `INV-${new Date().getFullYear()}-${(paymentId || bookingId || "0000").slice(-6).toUpperCase()}`,
    };
  }, [searchParams]);

  return (
    <article className="mt-7 overflow-hidden rounded-2xl border border-border bg-background">
      <div className="h-1.5 w-full bg-ring" />
      <div className="p-6 sm:p-8">
        <div className="grid gap-6 border-b border-border pb-6 sm:grid-cols-2">
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Hóa đơn</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground">{data.invoiceNo}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Mã booking: {data.bookingId || "Chưa có"}</p>
            <p className="text-sm text-muted-foreground">Mã thanh toán: {data.paymentId || "Chưa có"}</p>
          </section>

          <section className="sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Khách sạn</p>
            <h3 className="mt-2 font-serif text-3xl italic text-foreground">Continental Grand Hotel</h3>
            <p className="mt-1 text-sm text-muted-foreground">Thanh toán chuyển khoản MB Bank</p>
            <p className="text-sm text-muted-foreground">0386404269 - TA VAN LONG</p>
          </section>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-[1fr_90px_150px] border-b border-border pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <p>Dịch vụ</p>
            <p className="text-center">SL</p>
            <p className="text-right">Thành tiền</p>
          </div>

          <div className="grid grid-cols-[1fr_90px_150px] items-center border-b border-border/50 py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-ring">
                <BedDouble className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-foreground">{data.roomTitle}</p>
                <p className="text-xs text-muted-foreground">{data.checkIn} - {data.checkOut} • {data.roomId}</p>
              </div>
            </div>
            <p className="text-center text-foreground">{data.guests}</p>
            <p className="text-right font-semibold text-foreground">{currency.format(data.subTotal)}đ</p>
          </div>

          <div className="mt-6 flex flex-col items-end gap-2">
            <Price label="Tạm tính" value={`${currency.format(data.subTotal)}đ`} />
            <Price label="Thuế & phí dịch vụ" value={`${currency.format(data.serviceFee)}đ`} />
            <div className="mt-2 flex w-full max-w-[280px] justify-between border-t border-border pt-3 text-lg font-bold">
              <span>Đã thanh toán</span>
              <span className="text-ring">{currency.format(data.total)}đ</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Price({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full max-w-[280px] justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <ProtectedRoute>
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-[980px] px-5 py-8 sm:px-8 lg:px-10">
        <Link href="/payment/success" className="inline-flex items-center gap-2 text-sm font-medium text-ring">
          <ArrowLeft className="h-4 w-4" />
          Quay lại xác nhận
        </Link>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-tight text-foreground">
              Chi tiết hóa đơn
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Hóa đơn tạm thời được tạo từ payment history.</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex h-11 items-center gap-2 rounded-full bg-muted px-5 text-sm font-medium text-foreground">
              <Download className="h-4 w-4" />
              Tải PDF
            </button>
            <button className="inline-flex h-11 items-center gap-2 rounded-full bg-ring px-5 text-sm font-semibold text-background">
              <Printer className="h-4 w-4" />
              In hóa đơn
            </button>
          </div>
        </div>

        <Suspense fallback={<div className="p-10 text-center">Đang tải hóa đơn...</div>}>
          <InvoiceContent />
        </Suspense>
      </section>
    </main>
    </ProtectedRoute>
  );
}
