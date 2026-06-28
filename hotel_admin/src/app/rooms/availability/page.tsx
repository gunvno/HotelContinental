"use client";

import { ArrowLeft, CalendarDays, CheckCircle2, RefreshCcw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ToastBridge } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import { formatMoney } from "@/lib/format";
import { getBusyRoomIds } from "@/services/booking-service";
import { getAllRooms, type RoomResponse } from "@/services/room-service";

function toDateTimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function normalizeLocalDateTime(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

function defaultCheckinValue() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  return toDateTimeLocalValue(now);
}

function defaultCheckoutValue(checkinValue: string) {
  const checkout = new Date(checkinValue);
  checkout.setDate(checkout.getDate() + 1);
  checkout.setHours(12, 0, 0, 0);
  return toDateTimeLocalValue(checkout);
}

export default function RoomAvailabilityPage() {
  const router = useRouter();
  const permission = usePermission();
  const canOpen =
    permission.has("ROOM_VIEW") &&
    (permission.has("ROLE_MANAGER") || permission.has("ROLE_RECEPTIONIST"));

  const initialCheckin = useMemo(defaultCheckinValue, []);
  const [checkin, setCheckin] = useState(initialCheckin);
  const [checkout, setCheckout] = useState(defaultCheckoutValue(initialCheckin));
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [busyRoomIds, setBusyRoomIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAvailability() {
    setLoading(true);
    setError("");
    try {
      const [roomData, busyIds] = await Promise.all([
        getAllRooms(0, 500),
        getBusyRoomIds(normalizeLocalDateTime(checkin), normalizeLocalDateTime(checkout)),
      ]);
      setRooms(roomData.data);
      setBusyRoomIds(busyIds);
    } catch {
      setError("Không tải được danh sách phòng trống. Kiểm tra room-service và booking-service.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAvailability();
  }, []);

  const availableRooms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rooms
      .filter((room) => room.id && !busyRoomIds.includes(room.id))
      .filter((room) => room.status !== "MAINTENANCE")
      .filter((room) => {
        if (!normalizedQuery) return true;
        return `${room.name} ${room.roomTypes?.name ?? ""} ${room.description ?? ""}`
          .toLowerCase()
          .includes(normalizedQuery);
      });
  }, [busyRoomIds, query, rooms]);

  if (!canOpen) {
    return <PermissionDenied message="Chỉ manager hoặc lễ tân được xem phòng trống." />;
  }

  return (
    <div className="space-y-6">
      {error ? <ToastBridge error={error} onClearError={() => setError("")} /> : null}

      <button
        type="button"
        onClick={() => router.push("/rooms")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#17213a] hover:text-[#9b5c24]"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách phòng
      </button>

      <section className="rounded-3xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-[#9b5c24] uppercase">
              Tư vấn phòng
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#17213a]">
              Tìm phòng trống theo ngày
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-[#6f5f50]">
              Lễ tân nhập thời gian nhận/trả phòng để xem phòng còn trống và tư vấn khách walk-in
              hoặc khách gọi điện.
            </p>
          </div>
          <Button
            type="button"
            disabled={loading}
            onClick={() => void loadAvailability()}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Kiểm tra phòng trống
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.3fr_auto] lg:items-end">
          <label className="space-y-2">
            <span className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
              Nhận phòng
            </span>
            <Input
              type="datetime-local"
              value={checkin}
              onChange={(event) => setCheckin(event.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
              Trả phòng
            </span>
            <Input
              type="datetime-local"
              value={checkout}
              onChange={(event) => setCheckout(event.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
              Tìm phòng / loại phòng
            </span>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9b5c24]" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ví dụ: 303, Deluxe..."
                className="pl-9"
              />
            </div>
          </label>
          <Button type="button" variant="secondary" onClick={() => router.push("/bookings/create")}>
            Tạo booking
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-[#9b5c24]" />
            <h3 className="text-xl font-black text-[#17213a]">Danh sách phòng trống</h3>
          </div>
          <span className="rounded-full bg-[#fff6df] px-3 py-1 text-xs font-bold text-[#8a5724]">
            {availableRooms.length} phòng
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyState text="Đang kiểm tra phòng trống..." />
            </div>
          ) : availableRooms.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyState text="Không có phòng trống phù hợp với bộ lọc hiện tại." />
            </div>
          ) : (
            availableRooms.map((room) => (
              <div
                key={room.id}
                className="rounded-2xl border border-[#eadfcd] bg-[#fbf6ed] p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-2xl font-black text-[#17213a]">Phòng {room.name}</p>
                    <p className="text-sm font-semibold text-[#7c6f63]">
                      {room.roomTypes?.name || "Chưa rõ loại phòng"} - {room.roomSize}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    Trống
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#6f5f50]">Giá theo đêm</span>
                    <span className="font-black text-[#8a5724]">
                      {formatMoney(room.pricePerDay)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#6f5f50]">Giá theo giờ</span>
                    <span className="font-black text-[#8a5724]">
                      {formatMoney(room.pricePerHour)}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  className="mt-4 w-full gap-2"
                  onClick={() => router.push("/bookings/create")}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Chọn để đặt
                </Button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
