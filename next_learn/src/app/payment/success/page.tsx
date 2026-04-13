"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Check,
  KeyRound,
  Mail,
  MessageCircle,
  Printer,
  Users,
} from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();

  const data = useMemo(() => {
    const bookingId = searchParams.get("bookingId") || "CGH-290483-VN";
    const roomId = searchParams.get("roomId") || "room-1";
    const roomTitle = searchParams.get("roomTitle") || "Suite Tổng thống Panorama";
    const checkIn = searchParams.get("checkIn") || "15.06.2024";
    const checkOut = searchParams.get("checkOut") || "18.06.2024";
    const guests = Number(searchParams.get("guests") || 2);
    const total = Number(searchParams.get("total") || 14_175_000);

    return {
      bookingId,
      roomId,
      roomTitle,
      checkIn,
      checkOut,
      guests,
      total,
    };
  }, [searchParams]);

  const currencyFormatter = new Intl.NumberFormat("vi-VN");

  return (
    <main className="bg-background min-h-screen">
      <section className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-8 lg:px-10">
        <section className="mx-auto max-w-[980px]">

          <div className="text-center">
            <h1 className="text-foreground font-serif text-[clamp(2.1rem,5vw,3.6rem)] leading-tight font-semibold">
              Cảm ơn quý khách!
            </h1>
            <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-base leading-7">
              Đơn đặt phòng của bạn đã được xác nhận thành công. Chúng tôi đang chuẩn bị để chào đón bạn.
            </p>
          </div>

          <article className="border-border/70 bg-muted/35 mt-8 grid overflow-hidden rounded-3xl border lg:grid-cols-[1fr_1fr]">
            <div className="relative min-h-[270px]">
              <img
                src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
                alt={data.roomTitle}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 rounded-xl bg-black/45 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] tracking-[0.16em] text-white/85 uppercase">Xác nhận thành công</p>
                <p className="mt-1 text-xl font-semibold tracking-[0.08em] text-white">{data.bookingId}</p>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">Loại phòng</p>
              <h2 className="text-foreground mt-2 inline-flex items-center gap-2 text-2xl font-semibold">
                <BedDouble className="text-ring h-5 w-5" />
                {data.roomTitle}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">ID phòng: {data.roomId}</p>

              <div className="border-border mt-5 grid gap-3 border-y py-4 sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase">Ngày đến</p>
                  <p className="text-foreground mt-1 inline-flex items-center gap-1.5 text-sm font-medium">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {data.checkIn}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase">Ngày đi</p>
                  <p className="text-foreground mt-1 inline-flex items-center gap-1.5 text-sm font-medium">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {data.checkOut}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase">Khách</p>
                  <p className="text-foreground mt-1 inline-flex items-center gap-1.5 text-sm font-medium">
                    <Users className="h-3.5 w-3.5" />
                    {data.guests} người
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-muted-foreground text-sm">Tổng thanh toán</p>
                <p className="text-ring text-2xl font-semibold">{currencyFormatter.format(data.total)}đ</p>
              </div>

              <div className="mt-5 space-y-2">
                <Link
                  href={`/payment/invoice?bookingId=${encodeURIComponent(data.bookingId)}&roomId=${encodeURIComponent(data.roomId)}&roomTitle=${encodeURIComponent(data.roomTitle)}&checkIn=${encodeURIComponent(data.checkIn)}&checkOut=${encodeURIComponent(data.checkOut)}&guests=${data.guests}&total=${data.total}`}
                  className="bg-ring text-background inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-[0.14em] uppercase"
                >
                  <Check className="h-4 w-4" />
                  Xem hóa đơn chi tiết
                </Link>

                <button
                  type="button"
                  className="border-border text-foreground inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border text-sm font-semibold tracking-[0.14em] uppercase"
                >
                  <MessageCircle className="h-4 w-4" />
                  Khám phá dịch vụ thêm
                </button>
              </div>
            </div>
          </article>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 text-sm">
            <Link href="/" className="text-foreground inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Về trang chủ
            </Link>

            <div className="text-muted-foreground inline-flex items-center gap-5 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Gửi email xác nhận
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Printer className="h-3.5 w-3.5" />
                In xác nhận
              </span>
            </div>
          </div>

          <article className="border-border/70 bg-muted/25 mt-10 grid gap-5 rounded-3xl border p-5 sm:grid-cols-[180px_1fr] sm:p-6">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"
              alt="Concierge"
              className="h-48 w-full rounded-2xl object-cover"
            />
            <div className="space-y-4">
              <span className="bg-ring/15 text-ring inline-flex rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase">
                Lời nhắn từ quản lý
              </span>
              <h3 className="text-foreground font-serif text-[clamp(1.6rem,3.4vw,2.5rem)] leading-tight font-semibold">
                "Mọi chi tiết nhỏ nhất trong chuyến đi của bạn đều được chúng tôi trân trọng chăm chút."
              </h3>
              <p className="text-muted-foreground text-sm leading-7">
                Đội ngũ Concierge của Continental Grand Hotel đã sẵn sàng hỗ trợ quý khách. Nếu bạn cần dịch vụ
                đưa đón tại sân bay hoặc muốn đặt bàn tại nhà hàng Michelin của chúng tôi trước khi đến, đừng ngần
                ngại liên hệ.
              </p>
              <button
                type="button"
                className="bg-foreground text-background inline-flex h-10 items-center justify-center rounded-full px-6 text-xs font-semibold tracking-[0.14em] uppercase"
              >
                Nhắn tin cho chúng tôi
              </button>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
