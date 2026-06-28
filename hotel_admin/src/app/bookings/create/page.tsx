"use client";

import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Phone,
  RefreshCcw,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ToastBridge } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import { formatMoney } from "@/lib/format";
import {
  checkInRoomBooking,
  createRoomBooking,
  getBusyRoomIds,
} from "@/services/booking-service";
import { getAllRooms, type RoomResponse } from "@/services/room-service";

type OfflineSource = "WALK_IN" | "PHONE";

function toDateTimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
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

function getStayNights(checkin: string, checkout: string) {
  const start = new Date(checkin);
  const end = new Date(checkout);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return 1;
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

function normalizeLocalDateTime(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

export default function CreateBookingPage() {
  const router = useRouter();
  const permission = usePermission();
  const canCreate = permission.has("BOOKING_CREATE") && permission.has("ROLE_RECEPTIONIST");

  const initialCheckin = useMemo(defaultCheckinValue, []);
  const [checkin, setCheckin] = useState(initialCheckin);
  const [checkout, setCheckout] = useState(defaultCheckoutValue(initialCheckin));
  const [offlineSource, setOfflineSource] = useState<OfflineSource>("WALK_IN");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerIdentityNumber, setCustomerIdentityNumber] = useState("");
  const [customerGender, setCustomerGender] = useState("UNKNOWN");
  const [customerDateOfBirth, setCustomerDateOfBirth] = useState("");
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [busyRoomIds, setBusyRoomIds] = useState<string[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
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
      const firstAvailable = roomData.data.find(
        (room) => room.id && !busyIds.includes(room.id) && room.status !== "MAINTENANCE",
      );
      setSelectedRoomId((current) =>
        current && !busyIds.includes(current) ? current : firstAvailable?.id ?? "",
      );
    } catch {
      setError(
        "Không tải được phòng trống. Kiểm tra booking-service, room-service và quyền lễ tân.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAvailability();
  }, []);

  const availableRooms = useMemo(
    () =>
      rooms.filter(
        (room) => room.id && !busyRoomIds.includes(room.id) && room.status !== "MAINTENANCE",
      ),
    [busyRoomIds, rooms],
  );
  const selectedRoom = availableRooms.find((room) => room.id === selectedRoomId);
  const nights = getStayNights(checkin, checkout);
  const roomPrice = Number(selectedRoom?.pricePerDay ?? 0);
  const totalRoomPrice = roomPrice * nights;

  async function submit(checkInNow: boolean) {
    if (!selectedRoom || !selectedRoom.id || submitting) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Vui lòng nhập tối thiểu tên khách và số điện thoại.");
      return;
    }
    if (new Date(checkin).getTime() >= new Date(checkout).getTime()) {
      setError("Ngày trả phòng phải sau ngày nhận phòng.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const created = await createRoomBooking({
        roomId: selectedRoom.id,
        checkin: normalizeLocalDateTime(checkin),
        checkout: normalizeLocalDateTime(checkout),
        bookingType: "OFFLINE",
        offlineSource,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerIdentityNumber: customerIdentityNumber.trim() || undefined,
        customerGender,
        customerDateOfBirth: customerDateOfBirth || undefined,
        roomPrice,
        totalRoomPrice,
        totalServicePrice: 0,
        totalExtraPrice: 0,
        totalPrice: totalRoomPrice,
        deposit: totalRoomPrice,
        discountAmount: 0,
        refundStatus: "NONE",
        refundAmount: 0,
      });

      if (checkInNow) {
        await checkInRoomBooking(created.id);
      }

      setMessage(
        checkInNow
          ? "Đã tạo booking walk-in và check-in ngay."
          : "Đã tạo booking offline cho khách.",
      );
      window.setTimeout(() => router.push(`/bookings/${created.id}`), 600);
    } catch {
      setError(
        "Không tạo được booking. Kiểm tra phòng còn trống, dữ liệu khách và quyền BOOKING_CREATE.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!canCreate) {
    return <PermissionDenied message="Chỉ lễ tân có quyền tạo booking walk-in/phone." />;
  }

  return (
    <div className="space-y-6">
      {message ? (
        <ToastBridge success={message} onClearSuccess={() => setMessage("")} />
      ) : null}
      {error ? <ToastBridge error={error} onClearError={() => setError("")} /> : null}

      <button
        type="button"
        onClick={() => router.push("/bookings")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#17213a] hover:text-[#9b5c24]"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách booking
      </button>

      <section className="rounded-3xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-[#9b5c24] uppercase">
              Lễ tân
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#17213a]">
              Tạo booking walk-in / qua điện thoại
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-[#6f5f50]">
              Dùng khi khách đến trực tiếp hoặc gọi điện đặt phòng. Booking offline được xác nhận
              thanh toán ngay, không cần luồng chuyển khoản online.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={loading || submitting}
            onClick={() => void loadAvailability()}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Kiểm tra phòng trống
          </Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-[#9b5c24]" />
              <h3 className="text-xl font-black text-[#17213a]">Thời gian lưu trú</h3>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
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
            </div>
            <p className="mt-3 text-sm font-semibold text-[#8a5724]">
              Thời lượng tính tiền: {nights} đêm
            </p>
          </div>

          <div className="rounded-3xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <UserRound className="h-5 w-5 text-[#9b5c24]" />
              <h3 className="text-xl font-black text-[#17213a]">Thông tin khách</h3>
            </div>
            <div className="mt-5 space-y-4">
              <Select
                value={offlineSource}
                onValueChange={(value) => setOfflineSource(value as OfflineSource)}
                options={[
                  { value: "WALK_IN", label: "Walk-in - khách đến trực tiếp" },
                  { value: "PHONE", label: "Phone - khách đặt qua điện thoại" },
                ]}
              />
              <Input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Tên khách"
              />
              <Input
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="Số điện thoại"
              />
              <Input
                value={customerIdentityNumber}
                onChange={(event) => setCustomerIdentityNumber(event.target.value)}
                placeholder="CCCD / hộ chiếu"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  value={customerGender}
                  onValueChange={setCustomerGender}
                  options={[
                    { value: "UNKNOWN", label: "Chưa xác định giới tính" },
                    { value: "MALE", label: "Nam" },
                    { value: "FEMALE", label: "Nữ" },
                  ]}
                />
                <Input
                  type="date"
                  value={customerDateOfBirth}
                  onChange={(event) => setCustomerDateOfBirth(event.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BedDouble className="h-5 w-5 text-[#9b5c24]" />
              <h3 className="text-xl font-black text-[#17213a]">Phòng còn trống</h3>
            </div>
            <span className="rounded-full bg-[#fff6df] px-3 py-1 text-xs font-bold text-[#8a5724]">
              {availableRooms.length} phòng
            </span>
          </div>

          <div className="mt-5 max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {loading ? (
              <EmptyState text="Đang kiểm tra phòng trống..." />
            ) : availableRooms.length === 0 ? (
              <EmptyState text="Không có phòng trống trong khung giờ đã chọn." />
            ) : (
              availableRooms.map((room) => {
                const active = selectedRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoomId(room.id ?? "")}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-[#c8792a] bg-[#fff6df]"
                        : "border-[#eadfcd] bg-[#fbf6ed] hover:border-[#c8792a]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-black text-[#17213a]">Phòng {room.name}</p>
                        <p className="text-sm font-semibold text-[#7c6f63]">
                          {room.roomTypes?.name || "Chưa rõ loại phòng"} - {room.roomSize}
                        </p>
                      </div>
                      {active ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : null}
                    </div>
                    <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                      <span className="font-bold text-[#8a5724]">
                        {formatMoney(room.pricePerDay)} / đêm
                      </span>
                      <span className="font-semibold text-[#6f5f50]">
                        Theo giờ: {formatMoney(room.pricePerHour)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-[#eadfcd] bg-[#fbf6ed] p-4">
            <p className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
              Tạm tính
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#6f5f50]">
                  {selectedRoom ? `Phòng ${selectedRoom.name} x ${nights} đêm` : "Chưa chọn phòng"}
                </p>
                <p className="mt-1 text-3xl font-black text-[#17213a]">
                  {formatMoney(totalRoomPrice)}
                </p>
              </div>
              <Phone className="h-8 w-8 text-[#9b5c24]" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              disabled={!selectedRoom || submitting}
              onClick={() => void submit(false)}
            >
              Tạo booking
            </Button>
            <Button
              type="button"
              disabled={!selectedRoom || submitting || offlineSource !== "WALK_IN"}
              onClick={() => void submit(true)}
            >
              Tạo & Check-in ngay
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
