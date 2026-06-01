"use client";

import Link from "next/link";
import { useMemo, Suspense } from "react";
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

function InvoiceContent() {
  const searchParams = useSearchParams();

  const data = useMemo(() => {
    const bookingId = searchParams.get("bookingId") || "INV-2024-0892";
    const roomId = searchParams.get("roomId") || "room-1";
    const roomTitle = searchParams.get("roomTitle") || "PhÃ²ng Heritage Suite";
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
    <article className="border-border bg-background mt-7 overflow-hidden rounded-2xl border">
      <div className="h-1.5 w-full bg-ring" />

      <div className="p-6 sm:p-8">
        <div className="grid gap-8 border-b border-border/80 pb-6 sm:grid-cols-2">
          <section>
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">KhÃ¡ch hÃ ng</p>
            <h3 className="text-foreground mt-2 text-2xl font-semibold">Nguyá»…n Minh Tuáº¥n</h3>
            <p className="text-muted-foreground mt-1 text-sm">tuan.nguyen@email.com</p>
            <p className="text-muted-foreground text-sm">+84 901 234 567</p>
            <p className="text-muted-foreground mt-3 text-sm">235 Äá»“ng Khá»Ÿi, Quáº­n 1, TP. Há»“ ChÃ­ Minh</p>
          </section>

          <section className="sm:text-right">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">ThÃ´ng tin khÃ¡ch sáº¡n</p>
            <h3 className="text-foreground mt-2 font-serif text-3xl italic">Continental Grand Hotel</h3>
            <p className="text-muted-foreground mt-1 text-sm">info@continentalgrand.vn</p>
            <p className="text-muted-foreground text-sm">+84 28 3829 9201</p>
            <p className="text-muted-foreground mt-3 text-sm">132-134 Äá»“ng Khá»Ÿi, Quáº­n 1, TP. Há»“ ChÃ­ Minh</p>
          </section>
        </div>

        <div className="mt-6">
          <div className="text-muted-foreground grid grid-cols-[1fr_90px_150px] border-b border-border/80 pb-3 text-[10px] font-semibold tracking-[0.16em] uppercase">
            <p>Dá»‹ch vá»¥ sáº£n pháº©m</p>
            <p className="text-center">SL</p>
            <p className="text-right">ThÃ nh tiá»n</p>
          </div>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-[1fr_90px_150px] items-center border-b border-border/40 pb-4">
              <div className="flex items-center gap-3">
                <span className="bg-muted text-ring inline-flex h-10 w-10 items-center justify-center rounded-lg">
                  <BedDouble className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-foreground font-semibold">{data.roomTitle}</p>
                  <p className="text-muted-foreground text-xs">{data.guests} Ä‘Ãªm ({data.checkIn} - {data.checkOut}) â€¢ {data.roomId}</p>
                </div>
              </div>
              <p className="text-foreground text-center">2</p>
              <p className="text-foreground text-right font-semibold">{currency.format(Math.round(data.subTotal * 0.62))} Ä‘</p>
            </div>

            <div className="grid grid-cols-[1fr_90px_150px] items-center border-b border-border/40 pb-4">
              <div className="flex items-center gap-3">
                <span className="bg-muted text-emerald-700 inline-flex h-10 w-10 items-center justify-center rounded-lg">
                  <Leaf className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-foreground font-semibold">Liá»‡u trÃ¬nh Sen Wellness</p>
                  <p className="text-muted-foreground text-xs">Trá»‹ liá»‡u tinh dáº§u 90 phÃºt</p>
                </div>
              </div>
              <p className="text-foreground text-center">1</p>
              <p className="text-foreground text-right font-semibold">{currency.format(Math.round(data.subTotal * 0.13))} Ä‘</p>
            </div>

            <div className="grid grid-cols-[1fr_90px_150px] items-center">
              <div className="flex items-center gap-3">
                <span className="bg-muted text-emerald-700 inline-flex h-10 w-10 items-center justify-center rounded-lg">
                  <Utensils className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-foreground font-semibold">Bá»¯a tá»‘i táº¡i Le Caprice</p>
                  <p className="text-muted-foreground text-xs">Thá»±c Ä‘Æ¡n náº¿m thá»­ cao cáº¥p cho 2 ngÆ°á»i</p>
                </div>
              </div>
              <p className="text-foreground text-center">1</p>
              <p className="text-foreground text-right font-semibold">{currency.format(Math.round(data.subTotal * 0.25))} Ä‘</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-end gap-2 border-t border-border/80 pt-6">
            <div className="flex w-full max-w-[250px] justify-between text-sm">
              <span className="text-muted-foreground">Tá»•ng cá»™ng</span>
              <span className="font-medium">{currency.format(data.subTotal)} Ä‘</span>
            </div>
            <div className="flex w-full max-w-[250px] justify-between text-sm">
              <span className="text-muted-foreground">VAT (8%)</span>
              <span className="font-medium">{currency.format(data.vat)} Ä‘</span>
            </div>
            <div className="flex w-full max-w-[250px] justify-between text-sm">
              <span className="text-muted-foreground">PhÃ­ dá»‹ch vá»¥</span>
              <span className="font-medium">{currency.format(data.serviceFee)} Ä‘</span>
            </div>
            <div className="mt-2 flex w-full max-w-[250px] justify-between border-t border-border/80 pt-2 text-lg font-bold">
              <span>Thanh toÃ¡n</span>
              <span className="text-ring">{currency.format(data.total)} Ä‘</span>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 mt-8 grid gap-6 rounded-xl p-6 sm:grid-cols-[1fr_auto]">
          <div className="flex gap-4">
            <CircleAlert className="text-ring h-6 w-6 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">ThÃ´ng tin quan trá»ng</h4>
              <p className="text-muted-foreground text-sm">
                Vui lÃ²ng giá»¯ láº¡i biÃªn lai nÃ y cho Ä‘áº¿n khi nháº­n phÃ²ng. Cáº£m Æ¡n quÃ½ khÃ¡ch Ä‘Ã£ chá»n Continental Grand cho ká»³ nghá»‰ cá»§a mÃ¬nh. Háº¹n gáº·p láº¡i quÃ½ khÃ¡ch.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center rounded-xl border border-border/70 bg-muted/15 p-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrValue}`}
              alt="MÃ£ QR hÃ³a Ä‘Æ¡n"
              className="h-[200px] w-[200px]"
            />
            <p className="text-muted-foreground mt-3 text-[10px] tracking-[0.15em] uppercase">
              QuÃ©t mÃ£ Ä‘á»ƒ xÃ¡c thá»±c hÃ³a Ä‘Æ¡n Ä‘iá»‡n tá»­
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function InvoicePage() {
  return (
    <main className="bg-background min-h-screen">
      <section className="mx-auto w-full max-w-[1240px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[930px]">
          <Link href="/payment/success" className="text-ring inline-flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Quay láº¡i danh sÃ¡ch
          </Link>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-foreground font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-tight font-semibold">
                Chi tiáº¿t hÃ³a Ä‘Æ¡n
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                MÃ£ hÃ³a Ä‘Æ¡n tá»± Ä‘á»™ng táº¡o
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="bg-muted text-foreground inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium">
                <Download className="h-4 w-4" />
                Táº£i xuá»‘ng PDF
              </button>
              <button className="bg-ring text-background inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold">
                <Printer className="h-4 w-4" />
                In hÃ³a Ä‘Æ¡n
              </button>
            </div>
          </div>

          <Suspense fallback={<div className="p-10 text-center">Äang táº£i hÃ³a Ä‘Æ¡n...</div>}>
            <InvoiceContent />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
