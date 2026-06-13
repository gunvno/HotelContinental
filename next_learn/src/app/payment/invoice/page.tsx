"use client";

import { ArrowLeft, BedDouble, Download, Printer } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { getInvoiceByBooking, type InvoiceResponse } from "@/services/billing-service";

function InvoiceContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currency = new Intl.NumberFormat("vi-VN");

  useEffect(() => {
    if (!bookingId) {
      setError("Thiếu mã booking để tải hóa đơn.");
      setLoading(false);
      return;
    }

    let alive = true;
    getInvoiceByBooking(bookingId)
      .then((data) => {
        if (!alive) return;
        setInvoice(data);
        setError("");
      })
      .catch(() => {
        if (alive) {
          setError("Không thể tải hóa đơn. Kiểm tra billing-service và trạng thái thanh toán.");
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [bookingId]);

  if (loading) {
    return (
      <div className="border-border bg-background mt-7 rounded-2xl border p-10 text-center">
        Đang tải hóa đơn...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || "Không tìm thấy hóa đơn."}
      </div>
    );
  }

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
              {invoice.invoiceNo}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Mã booking: {invoice.roomBookingId}
            </p>
            <p className="text-muted-foreground text-sm">
              Mã thanh toán: {invoice.paymentId}
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
              Thanh toán {invoice.paymentMethod}
            </p>
            <p className="text-muted-foreground text-sm">0386404269 - TA VAN LONG</p>
          </section>
        </div>

        <div className="mt-6">
          <div className="border-border text-muted-foreground grid grid-cols-[1fr_150px] border-b pb-3 text-[10px] font-semibold tracking-[0.16em] uppercase">
            <p>Khoản mục</p>
            <p className="text-right">Thành tiền</p>
          </div>

          <LineItem
            icon={<BedDouble className="h-4 w-4" />}
            title="Tiền phòng"
            description={`Phòng ${invoice.roomId}`}
            value={`${currency.format(invoice.totalRoomPrice)}đ`}
          />
          <LineItem
            title="Dịch vụ phát sinh"
            description="Dịch vụ khách gọi thêm trong thời gian lưu trú"
            value={`${currency.format(invoice.totalServicePrice)}đ`}
          />
          <LineItem
            title="VAT, ưu đãi và phụ phí"
            description="Tổng phụ phí sau ưu đãi/voucher nếu có"
            value={`${currency.format(invoice.totalExtraPrice)}đ`}
          />

          <div className="mt-6 flex flex-col items-end gap-2">
            <Price label="Tổng bill" value={`${currency.format(invoice.totalPrice)}đ`} />
            <div className="border-border mt-2 flex w-full max-w-[300px] justify-between border-t pt-3 text-lg font-bold">
              <span>Đã thanh toán</span>
              <span className="text-ring">{currency.format(invoice.paidAmount)}đ</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function LineItem({
  icon,
  title,
  description,
  value,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="border-border/50 grid grid-cols-[1fr_150px] items-center border-b py-4">
      <div className="flex items-center gap-3">
        <span className="bg-muted text-ring inline-flex h-10 w-10 items-center justify-center rounded-lg">
          {icon ?? <span className="h-2 w-2 rounded-full bg-current" />}
        </span>
        <div>
          <p className="text-foreground font-semibold">{title}</p>
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
      </div>
      <p className="text-foreground text-right font-semibold">{value}</p>
    </div>
  );
}

function Price({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full max-w-[300px] justify-between text-sm">
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
            href="/account/invoices"
            className="text-ring inline-flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách hóa đơn
          </Link>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-foreground font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-tight font-semibold">
                Chi tiết hóa đơn
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Hóa đơn được tổng hợp từ booking và payment history trong hệ thống.
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

          <Suspense fallback={<div className="p-10 text-center">Đang tải hóa đơn...</div>}>
            <InvoiceContent />
          </Suspense>
        </section>
      </main>
    </ProtectedRoute>
  );
}
