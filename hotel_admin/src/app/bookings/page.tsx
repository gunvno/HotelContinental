"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BadgeDollarSign, CalendarDays, Filter, Search, UserRound, BedDouble } from "lucide-react";

type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";

type Booking = {
  id: string;
  code: string;
  guestName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  total: string;
  status: BookingStatus;
};

const sampleBookings: Booking[] = [
  { id: "1", code: "BK-2026-001", guestName: "Nguyễn Văn A", roomName: "Deluxe City View", checkIn: "2026-04-14", checkOut: "2026-04-16", total: "4,200,000", status: "CONFIRMED" },
  { id: "2", code: "BK-2026-002", guestName: "Trần Thị B", roomName: "Suite Ocean", checkIn: "2026-04-15", checkOut: "2026-04-18", total: "9,600,000", status: "CHECKED_IN" },
  { id: "3", code: "BK-2026-003", guestName: "Lê C", roomName: "Family Room", checkIn: "2026-04-20", checkOut: "2026-04-22", total: "3,100,000", status: "PENDING" },
  { id: "4", code: "BK-2026-004", guestName: "Phạm D", roomName: "Standard Twin", checkIn: "2026-04-10", checkOut: "2026-04-12", total: "2,800,000", status: "CANCELLED" },
];

const statusLabel: Record<BookingStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đang ở",
  CHECKED_OUT: "Đã trả phòng",
  CANCELLED: "Đã hủy",
};

export default function BookingsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    return sampleBookings.filter((booking) => {
      const matchesQuery =
        booking.code.toLowerCase().includes(query.toLowerCase()) ||
        booking.guestName.toLowerCase().includes(query.toLowerCase()) ||
        booking.roomName.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "ALL" || booking.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg dark:border-gray-700">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-300/80">Quản lý đặt phòng</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Bookings</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Theo dõi trạng thái đặt phòng, lọc theo nhu cầu và xử lý nhanh trên cùng một màn hình.</p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-white text-slate-900 hover:bg-slate-100">
              Xuất báo cáo
            </Button>
            <Button className="bg-sky-600 text-white hover:bg-sky-500">
              + Tạo booking
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Tổng booking" value="128" icon={<CalendarDays className="h-4 w-4" />} sub="+12 hôm nay" />
        <MetricCard title="Đang ở" value="34" icon={<BedDouble className="h-4 w-4" />} sub="8 phòng sắp checkout" />
        <MetricCard title="Doanh thu" value="245.8M" icon={<BadgeDollarSign className="h-4 w-4" />} sub="+18% so với tháng trước" />
        <MetricCard title="Khách mới" value="57" icon={<UserRound className="h-4 w-4" />} sub="Check-in trong tuần" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Danh sách đặt phòng</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tìm kiếm, lọc trạng thái và xem nhanh booking.</p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative w-full md:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm theo mã, khách, phòng..."
                  className="pl-9"
                />
              </div>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as BookingStatus | "ALL")}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="CHECKED_IN">Đang ở</option>
                <option value="CHECKED_OUT">Đã trả phòng</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <th className="py-3 pr-4 font-medium">Mã</th>
                  <th className="py-3 pr-4 font-medium">Khách</th>
                  <th className="py-3 pr-4 font-medium">Phòng</th>
                  <th className="py-3 pr-4 font-medium">Nhận / Trả</th>
                  <th className="py-3 pr-4 font-medium">Tổng tiền</th>
                  <th className="py-3 pr-4 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 last:border-b-0 dark:border-gray-800">
                    <td className="py-4 pr-4 font-medium text-gray-900 dark:text-white">{booking.code}</td>
                    <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">{booking.guestName}</td>
                    <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">{booking.roomName}</td>
                    <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">
                      <div>{booking.checkIn}</div>
                      <div className="text-xs text-gray-400">→ {booking.checkOut}</div>
                    </td>
                    <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">{booking.total} VND</td>
                    <td className="py-4 pr-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(booking.status)}`}>
                        {statusLabel[booking.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-10 text-center text-gray-500">Không tìm thấy booking nào phù hợp.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Filter className="h-4 w-4" /> Bộ lọc nhanh
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {statusButtons.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setStatus(item.value)}
                  className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                    status === item.value
                      ? "border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-900/20 dark:text-sky-300"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-xs opacity-70">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Booking đang chú ý</h3>
            <div className="mt-4 space-y-4">
              {sampleBookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{booking.guestName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{booking.roomName}</div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(booking.status)}`}>
                      {statusLabel[booking.status]}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{booking.checkIn}</span>
                    <span>{booking.total} VND</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, sub, icon }: { title: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div className="rounded-full bg-sky-100 p-2 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">{icon}</div>
      </div>
      <div className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</p>
    </div>
  );
}

const statusButtons = [
  { value: "ALL" as const, label: "Tất cả", desc: "Xem toàn bộ booking" },
  { value: "PENDING" as const, label: "Chờ xác nhận", desc: "Cần duyệt" },
  { value: "CONFIRMED" as const, label: "Đã xác nhận", desc: "Sẵn sàng check-in" },
  { value: "CHECKED_IN" as const, label: "Đang ở", desc: "Khách đang lưu trú" },
  { value: "CHECKED_OUT" as const, label: "Đã trả phòng", desc: "Hoàn tất" },
  { value: "CANCELLED" as const, label: "Đã hủy", desc: "Booking bị hủy" },
];

function badgeClass(status: BookingStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case "CONFIRMED":
      return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300";
    case "CHECKED_IN":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "CHECKED_OUT":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    case "CANCELLED":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  }
}
