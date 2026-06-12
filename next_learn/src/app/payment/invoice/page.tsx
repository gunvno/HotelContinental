"use client";

import { ArrowLeft, BedDouble, Download, Printer } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

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
    <article className="border-border bg-background mt-7 overflow-hidden rounded-2xl border">
      <div className="bg-ring h-1.5 w-full" />
      <div className="p-6 sm:p-8">
        <div className="border-border grid gap-6 border-b pb-6 sm:grid-cols-2">
          <section>
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
              Hóa đơn
            </p>
            <h2 className="text-foreground mt-2 font-serif text-3xl font-semibold">
              {data.invoiceNo}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Mã booking: {data.bookingId || "Chưa có"}
            </p>
            <p className="text-muted-foreground text-sm">
              Mã thanh toán: {data.paymentId || "Chưa có"}
            </p>
          </section>

          <section className="sm:text-right">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
              Khách sạn
            </p>
            <h3 className="text-foreground mt-2 font-serif text-3xl italic">
              Continental Grand Hotel
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Thanh toán chuyển khoản MB Bank
            </p>
            <p className="text-muted-foreground text-sm">0386404269 - TA VAN LONG</p>
          </section>
        </div>

        <div className="mt-6">
          <div className="border-border text-muted-foreground grid grid-cols-[1fr_90px_150px] border-b pb-3 text-[10px] font-semibold tracking-[0.16em] uppercase">
            <p>Dịch vụ</p>
            <p className="text-center">SL</p>
            <p className="text-right">Thành tiền</p>
          </div>

          <div className="border-border/50 grid grid-cols-[1fr_90px_150px] items-center border-b py-4">
            <div className="flex items-center gap-3">
              <span className="bg-muted text-ring inline-flex h-10 w-10 items-center justify-center rounded-lg">
                <BedDouble className="h-4 w-4" />
              </span>
              <div>
                <p className="text-foreground font-semibold">{data.roomTitle}</p>
                <p className="text-muted-foreground text-xs">
                  {data.checkIn} - {data.checkOut} • {data.roomId}
                </p>
              </div>
            </div>
            <p className="text-foreground text-center">{data.guests}</p>
            <p className="text-foreground text-right font-semibold">
              {currency.format(data.subTotal)}đ
            </p>
          </div>

          <div className="mt-6 flex flex-col items-end gap-2">
            <Price label="Tạm tính" value={`${currency.format(data.subTotal)}đ`} />
            <Price
              label="Thuế & phí dịch vụ"
              value={`${currency.format(data.serviceFee)}đ`}
            />
            <div className="border-border mt-2 flex w-full max-w-[280px] justify-between border-t pt-3 text-lg font-bold">
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
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <ProtectedRoute>
      <main className="bg-background min-h-screen">
        <section className="mx-auto w-full max-w-[980px] px-5 py-8 sm:px-8 lg:px-10">
          <Link
            href="/payment/success"
            className="text-ring inline-flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại xác nhận
          </Link>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-foreground font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-tight font-semibold">
                Chi tiết hóa đơn
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Hóa đơn tạm thời được tạo từ payment history.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="bg-muted text-foreground inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium">
                <Download className="h-4 w-4" />
                Tải PDF
              </button>
              <button className="bg-ring text-background inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold">
                <Printer className="h-4 w-4" />
                In hóa đơn
              </button>
            </div>
          </div>

          <Suspense
            fallback={<div className="p-10 text-center">Đang tải hóa đơn...</div>}
          >
            <InvoiceContent />
          </Suspense>
        </section>
      </main>
    </ProtectedRoute>
  );
}
