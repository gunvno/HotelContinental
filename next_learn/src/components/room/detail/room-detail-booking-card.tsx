"use client";

import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

export type RoomDetailBookingCardProps = {
  roomId: string;
  roomTitle: string;
  pricePerNight: number;
  maxOccupancy?: number;
};

const currencyFormatter = new Intl.NumberFormat("vi-VN");

export function RoomDetailBookingCard({
  roomId,
  roomTitle,
  pricePerNight,
  maxOccupancy = 4,
}: RoomDetailBookingCardProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const tax = Math.round(pricePerNight * 0.1);
  const total = pricePerNight * 3 + tax;
  const paymentHref = useMemo(() => {
    const params = new URLSearchParams({
      roomId,
      roomTitle,
      pricePerNight: String(pricePerNight),
      guests: String(guests),
    });

    if (checkIn) {
      params.set("checkIn", checkIn);
    }
    if (checkOut) {
      params.set("checkOut", checkOut);
    }

    return `/payment?${params.toString()}`;
  }, [checkIn, checkOut, guests, pricePerNight, roomId, roomTitle]);

  return (
    <aside className="border-border/60 bg-background sticky top-24 rounded-3xl border p-6 shadow-[0_20px_55px_-35px_rgba(31,41,55,0.4)]">
      <h3 className="text-foreground font-serif text-[2rem] leading-tight font-semibold">
        Kiểm tra tình trạng phòng
      </h3>

      <div className="mt-6 space-y-4">
        <label className="block space-y-2">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase">
            Ngày nhận phòng
          </span>
          <div className="border-border bg-muted/40 text-muted-foreground flex items-center justify-between rounded-xl border px-4 py-3 text-sm">
            <input
              type="date"
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              className="w-full bg-transparent outline-none"
            />
            <CalendarDays className="text-ring h-4 w-4" />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase">
            Ngày trả phòng
          </span>
          <div className="border-border bg-muted/40 text-muted-foreground flex items-center justify-between rounded-xl border px-4 py-3 text-sm">
            <input
              type="date"
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
              className="w-full bg-transparent outline-none"
            />
            <CalendarDays className="text-ring h-4 w-4" />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase">
            Số lượng khách
          </span>
          <select
            value={guests}
            onChange={(event) => setGuests(Number(event.target.value))}
            className="border-border bg-muted/40 text-foreground w-full rounded-xl border px-4 py-3 text-sm outline-none"
          >
            {Array.from({ length: Math.max(1, maxOccupancy) }).map((_, index) => {
              const value = index + 1;
              return (
                <option key={value} value={value}>
                  {value} Người lớn
                </option>
              );
            })}
          </select>
        </label>
      </div>

      <div className="border-border mt-6 space-y-3 border-t pt-5 text-sm">
        <div className="text-muted-foreground flex items-center justify-between">
          <span>Giá phòng (3 đêm)</span>
          <span>{currencyFormatter.format(pricePerNight * 3)} VND</span>
        </div>
        <div className="text-muted-foreground flex items-center justify-between">
          <span>Phí dịch vụ & Thuế</span>
          <span>{currencyFormatter.format(tax)} VND</span>
        </div>
        <div className="text-foreground flex items-center justify-between pt-1 text-2xl font-semibold">
          <span>Tổng cộng</span>
          <span className="text-ring">{currencyFormatter.format(total)} VND</span>
        </div>
      </div>

      <Button href={paymentHref} className="mt-6 h-12 w-full rounded-full">Đặt phòng ngay</Button>
      <p className="text-muted-foreground mt-3 text-center text-xs">Không trừ phí hủy phòng trước 48 giờ</p>
    </aside>
  );
}
