"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  CircleAlert,
  Download,
  Leaf,
  Printer,
  Utensils,
} from "lucide-react";

export default function InvoicePage() {
  const searchParams = useSearchParams();

  const data = useMemo(() => {
    const bookingId = searchParams.get("bookingId") || "INV-2024-0892";
    const roomId = searchParams.get("roomId") || "room-1";
    const roomTitle = searchParams.get("roomTitle") || "Phòng Heritage Suite";
    const checkIn = searchParams.get("checkIn") || "22/10/2024";
    const checkOut = searchParams.get("checkOut") || "24/10/2024";
    const guests = Number(searchParams.get("guests") || 2);
    const total = Number(searchParams.get("total") || 21_809_000);

    const subTotal = Math.round(total / 1.13);
    const vat = Math.round(subTotal * 0.08);
    const serviceFee = Math.max(0, total - subTotal - vat);

    return {
      bookingId,
      roomId,
      roomTitle,
      checkIn,
      checkOut,
      guests,
      total,
      subTotal,
      vat,
      serviceFee,
      paidDate: "24/10/2023",
      invoiceNo: `INV-${new Date().getFullYear()}-${bookingId.slice(-4).toUpperCase()}`,
    };
  }, [searchParams]);

  const currency = new Intl.NumberFormat("vi-VN");
  const qrValue = encodeURIComponent(`${data.invoiceNo}|${data.bookingId}|${data.total}`);

  return (
    <main className="bg-background min-h-screen">
      <section className="mx-auto w-full max-w-[1240px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[930px]">
          <Link href="/payment/success" className="text-ring inline-flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-foreground font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-tight font-semibold">
                Chi tiết hóa đơn
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Mã hóa đơn: {data.invoiceNo} • Ngày thanh toán: {data.paidDate}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="bg-muted text-foreground inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium">
                <Download className="h-4 w-4" />
                Tải xuống PDF
              </button>
              <button className="bg-ring text-background inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold">
                <Printer className="h-4 w-4" />
                In hóa đơn
              </button>
            </div>
          </div>

          <article className="border-border bg-background mt-7 overflow-hidden rounded-2xl border">
            <div className="h-1.5 w-full bg-ring" />

            <div className="p-6 sm:p-8">
              <div className="grid gap-8 border-b border-border/80 pb-6 sm:grid-cols-2">
                <section>
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">Khách hàng</p>
                  <h3 className="text-foreground mt-2 text-2xl font-semibold">Nguyễn Minh Tuấn</h3>
                  <p className="text-muted-foreground mt-1 text-sm">tuan.nguyen@email.com</p>
                  <p className="text-muted-foreground text-sm">+84 901 234 567</p>
                  <p className="text-muted-foreground mt-3 text-sm">235 Đồng Khởi, Quận 1, TP. Hồ Chí Minh</p>
                </section>

                <section className="sm:text-right">
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">Thông tin khách sạn</p>
                  <h3 className="text-foreground mt-2 font-serif text-3xl italic">Continental Grand Hotel</h3>
                  <p className="text-muted-foreground mt-1 text-sm">info@continentalgrand.vn</p>
                  <p className="text-muted-foreground text-sm">+84 28 3829 9201</p>
                  <p className="text-muted-foreground mt-3 text-sm">132-134 Đồng Khởi, Quận 1, TP. Hồ Chí Minh</p>
                </section>
              </div>

              <div className="mt-6">
                <div className="text-muted-foreground grid grid-cols-[1fr_90px_150px] border-b border-border/80 pb-3 text-[10px] font-semibold tracking-[0.16em] uppercase">
                  <p>Dịch vụ sản phẩm</p>
                  <p className="text-center">SL</p>
                  <p className="text-right">Thành tiền</p>
                </div>

                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-[1fr_90px_150px] items-center border-b border-border/40 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-muted text-ring inline-flex h-10 w-10 items-center justify-center rounded-lg">
                        <BedDouble className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-foreground font-semibold">{data.roomTitle}</p>
                        <p className="text-muted-foreground text-xs">{data.guests} đêm ({data.checkIn} - {data.checkOut}) • {data.roomId}</p>
                      </div>
                    </div>
                    <p className="text-foreground text-center">2</p>
                    <p className="text-foreground text-right font-semibold">{currency.format(Math.round(data.subTotal * 0.62))} đ</p>
                  </div>

                  <div className="grid grid-cols-[1fr_90px_150px] items-center border-b border-border/40 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-muted text-emerald-700 inline-flex h-10 w-10 items-center justify-center rounded-lg">
                        <Leaf className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-foreground font-semibold">Liệu trình Sen Wellness</p>
                        <p className="text-muted-foreground text-xs">Trị liệu tinh dầu 90 phút</p>
                      </div>
                    </div>
                    <p className="text-foreground text-center">1</p>
                    <p className="text-foreground text-right font-semibold">{currency.format(Math.round(data.subTotal * 0.13))} đ</p>
                  </div>

                  <div className="grid grid-cols-[1fr_90px_150px] items-center">
                    <div className="flex items-center gap-3">
                      <span className="bg-muted text-emerald-700 inline-flex h-10 w-10 items-center justify-center rounded-lg">
                        <Utensils className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-foreground font-semibold">Bữa tối tại Le Caprice</p>
                        <p className="text-muted-foreground text-xs">Thực đơn nếm thử cao cấp cho 2 người</p>
                      </div>
                    </div>
                    <p className="text-foreground text-center">1</p>
                    <p className="text-foreground text-right font-semibold">{currency.format(Math.round(data.subTotal * 0.25))} đ</p>
                  </div>
                </div>

                <div className="mt-4 ml-auto w-full max-w-[360px] space-y-2 text-sm">
                  <div className="text-muted-foreground flex items-center justify-between">
                    <span>Tạm tính</span>
                    <span>{currency.format(data.subTotal)} đ</span>
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between">
                    <span>Thuế VAT (8%)</span>
                    <span>{currency.format(data.vat)} đ</span>
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between">
                    <span>Phí dịch vụ (5%)</span>
                    <span>{currency.format(data.serviceFee)} đ</span>
                  </div>
                  <div className="text-foreground mt-2 flex items-center justify-between border-t border-border pt-3 text-[2rem] font-semibold leading-none">
                    <span className="text-2xl">Tổng cộng</span>
                    <span className="text-ring">{currency.format(data.total)} đ</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                <div className="bg-muted/45 rounded-xl p-4">
                  <p className="text-foreground inline-flex items-center gap-2 text-sm font-semibold">
                    <CircleAlert className="text-ring h-4 w-4" />
                    Ghi chú thanh toán
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    Hóa đơn này được thanh toán qua thẻ Visa kết thúc bằng đuôi 8892. Cảm ơn quý khách đã lựa chọn
                    Continental Grand cho kỳ nghỉ của mình. Hẹn gặp lại quý khách.
                  </p>
                </div>

                <div className="flex flex-col items-center rounded-xl border border-border/70 bg-muted/15 p-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrValue}`}
                    alt="Mã QR hóa đơn"
                    className="h-[200px] w-[200px]"
                  />
                  <p className="text-muted-foreground mt-3 text-[10px] tracking-[0.15em] uppercase">
                    Quét mã để xác thực hóa đơn điện tử
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
