"use client";

import {
  Clock,
  Loader2,
  PackagePlus,
  ReceiptText,
  RefreshCcw,
  Settings,
  UserRound,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Container } from "@/components/ui/container";
import {
  getMyRoomBookings,
  type RoomBookingResponse,
} from "@/services/booking-service";
import { getCatalogServices, type ServiceResponse } from "@/services/room-service";
import {
  createMyServiceOrderDetail,
  getMyServiceOrderDetails,
  type ServiceOrderDetailResponse,
} from "@/services/service-order-service";
import { useAuthStore } from "@/store/auth-store";

const currency = new Intl.NumberFormat("vi-VN");

function formatMoney(value?: number) {
  return `${currency.format(Number(value ?? 0))}đ`;
}

function shortCode(id?: string) {
  return id ? id.slice(0, 8).toUpperCase() : "N/A";
}

function statusLabel(status?: RoomBookingResponse["status"]) {
  switch (status) {
    case "CHECKED_IN":
      return "Đang lưu trú";
    case "DEPOSITED":
      return "Đã thanh toán";
    case "CANCEL_REQUESTED":
      return "Yêu cầu hủy";
    case "DONE":
      return "Đã trả phòng";
    case "CANCEL":
      return "Đã hủy";
    default:
      return "Chờ thanh toán";
  }
}

export default function AccountServicesPage() {
  const token = useAuthStore((state) => state.token);
  const [bookings, setBookings] = useState<RoomBookingResponse[]>([]);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [items, setItems] = useState<ServiceOrderDetailResponse[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId);
  const selectedService = services.find((service) => service.id === serviceId);
  const canOrderService =
    selectedBooking?.status === "CHECKED_IN" &&
    selectedBooking?.detailStatus === "CHECKED_IN";
  const projectedTotal =
    Number(selectedService?.price ?? 0) * quantity + Number(selectedBooking?.totalPrice ?? 0);

  const activeBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        ["CHECKED_IN", "DEPOSITED", "PENDING"].includes(booking.status),
      ),
    [bookings],
  );

  async function loadData(targetBookingId = selectedBookingId) {
    setLoading(true);
    setMessage(null);

    try {
      const [bookingData, serviceData] = await Promise.all([
        getMyRoomBookings(),
        getCatalogServices(0, 500),
      ]);
      const active = bookingData.filter(
        (booking) => booking.status !== "CANCEL" && booking.status !== "CANCEL_REQUESTED",
      );
      const nextBooking =
        active.find((booking) => booking.id === targetBookingId) ??
        active.find((booking) => booking.status === "CHECKED_IN") ??
        active[0];

      setBookings(active);
      setServices(serviceData.filter((service) => !service.deleted));
      setSelectedBookingId(nextBooking?.id ?? "");

      if (nextBooking) {
        setItems(await getMyServiceOrderDetails(nextBooking.id));
      } else {
        setItems([]);
      }
    } catch {
      setMessage("Không thể tải dữ liệu dịch vụ. Vui lòng đăng nhập lại hoặc thử sau.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    void loadData("");
  }, [token]);

  async function handleBookingChange(value: string) {
    setSelectedBookingId(value);
    setMessage(null);

    if (!value) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      setItems(await getMyServiceOrderDetails(value));
    } catch {
      setMessage("Không thể tải danh sách dịch vụ của booking này.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (submitting || !canOrderService || !selectedBookingId || !serviceId || quantity <= 0) {
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await createMyServiceOrderDetail({
        roomBookingId: selectedBookingId,
        serviceId,
        quantity,
        description: description.trim() || undefined,
      });
      setServiceId("");
      setQuantity(1);
      setDescription("");
      setMessage("Đã gửi yêu cầu dịch vụ. Lễ tân sẽ xử lý trong thời gian sớm nhất.");
      await loadData(selectedBookingId);
    } catch {
      setMessage(
        "Không thể gửi yêu cầu. Chỉ booking đang check-in mới được gọi dịch vụ phát sinh.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
      <section className="min-h-screen bg-[#fffaf3]">
        <Container className="py-12 md:py-20 lg:py-24">
          <div className="flex flex-col items-start gap-12 md:flex-row">
            <aside className="flex w-full shrink-0 flex-col gap-8 md:sticky md:top-32 md:w-[260px]">
              <div>
                <h2 className="font-serif text-[28px] font-bold text-[#1f1a17]">
                  Tài khoản
                </h2>
                <p className="mt-2 text-sm text-[#8c8277]">
                  Quản lý lưu trú và dịch vụ của bạn
                </p>
              </div>

              <nav className="flex flex-col gap-5 text-[15px]">
                <Link
                  href="/account"
                  className="flex items-center gap-4 text-[#8c8277] transition-colors hover:text-[#1f1a17]"
                >
                  <UserRound className="h-[18px] w-[18px]" />
                  Hồ sơ cá nhân
                </Link>
                <Link
                  href="/account/invoices"
                  className="flex items-center gap-4 text-[#8c8277] transition-colors hover:text-[#1f1a17]"
                >
                  <ReceiptText className="h-[18px] w-[18px]" />
                  Lịch sử hóa đơn
                </Link>
                <Link
                  href="/account/services"
                  className="flex items-center gap-4 font-semibold text-[#b87932] transition-colors"
                >
                  <Utensils className="h-[18px] w-[18px]" />
                  Gọi thêm dịch vụ
                </Link>
                <button
                  type="button"
                  className="flex items-center gap-4 text-[#8c8277] transition-colors hover:text-[#1f1a17]"
                >
                  <Settings className="h-[18px] w-[18px]" />
                  Cài đặt chung
                </button>
              </nav>
            </aside>

            <div className="w-full flex-1 space-y-6">
              <div className="rounded-3xl border border-[#ead8c4] bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-bold tracking-[0.22em] text-[#a66724] uppercase">
                      Dịch vụ lưu trú
                    </p>
                    <h1 className="mt-2 font-serif text-[40px] font-bold text-[#1f1a17]">
                      Gọi thêm dịch vụ
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f6257]">
                      Chọn booking đang lưu trú, chọn dịch vụ cần dùng và gửi yêu cầu cho
                      lễ tân. Chi phí sẽ được cộng vào hóa đơn khi trả phòng.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadData(selectedBookingId)}
                    disabled={loading || submitting}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#a46522] px-5 text-sm font-bold text-white disabled:opacity-60"
                  >
                    <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Tải lại
                  </button>
                </div>
              </div>

              {message ? (
                <div className="rounded-2xl border border-[#ead8c4] bg-white p-4 text-sm font-semibold text-[#8a5724]">
                  {message}
                </div>
              ) : null}

              <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                <section className="rounded-3xl border border-[#ead8c4] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#a46522] text-white">
                      <PackagePlus className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-bold text-[#1f1a17]">Tạo yêu cầu</h2>
                      <p className="text-sm text-[#7c6f63]">
                        Chỉ áp dụng cho booking đã check-in.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <label className="block">
                      <span className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
                        Booking
                      </span>
                      <select
                        value={selectedBookingId}
                        onChange={(event) => void handleBookingChange(event.target.value)}
                        className="mt-2 h-12 w-full rounded-xl border border-[#decdb9] bg-white px-3 text-sm outline-none focus:border-[#c8792a]"
                      >
                        <option value="">-- Chọn booking --</option>
                        {activeBookings.map((booking) => (
                          <option key={booking.id} value={booking.id}>
                            {shortCode(booking.id)} - {statusLabel(booking.status)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
                        Dịch vụ
                      </span>
                      <select
                        value={serviceId}
                        onChange={(event) => setServiceId(event.target.value)}
                        className="mt-2 h-12 w-full rounded-xl border border-[#decdb9] bg-white px-3 text-sm outline-none focus:border-[#c8792a]"
                      >
                        <option value="">-- Chọn dịch vụ --</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {formatMoney(service.price)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
                        Số lượng
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(event) =>
                          setQuantity(Math.max(1, Number(event.target.value) || 1))
                        }
                        className="mt-2 h-12 w-full rounded-xl border border-[#decdb9] bg-white px-3 text-sm outline-none focus:border-[#c8792a]"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
                        Ghi chú
                      </span>
                      <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={3}
                        placeholder="Ví dụ: giao lên phòng sau 20 phút"
                        className="mt-2 w-full resize-none rounded-xl border border-[#decdb9] bg-white px-3 py-2 text-sm outline-none focus:border-[#c8792a]"
                      />
                    </label>

                    <div className="rounded-2xl bg-[#fbf5ed] p-4 text-sm text-[#6f5f50]">
                      <p>
                        Booking:{" "}
                        <b>{selectedBooking ? shortCode(selectedBooking.id) : "Chưa chọn"}</b>
                      </p>
                      <p>
                        Trạng thái: <b>{statusLabel(selectedBooking?.status)}</b>
                      </p>
                      <p>
                        Tổng sau khi thêm: <b>{formatMoney(projectedTotal)}</b>
                      </p>
                    </div>

                    {!canOrderService && selectedBooking ? (
                      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                        Booking này chưa check-in nên chưa thể gọi dịch vụ phát sinh.
                      </p>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => void handleCreate()}
                      disabled={submitting || !canOrderService || !serviceId}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#a46522] to-[#e7a849] text-sm font-bold text-white shadow-[0_16px_34px_-22px_rgba(164,101,34,0.9)] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <PackagePlus className="h-4 w-4" />
                      )}
                      Gửi yêu cầu dịch vụ
                    </button>
                  </div>
                </section>

                <section className="rounded-3xl border border-[#ead8c4] bg-white p-6 shadow-sm">
                  <div>
                    <h2 className="font-bold text-[#1f1a17]">Dịch vụ đã gọi</h2>
                    <p className="mt-1 text-sm text-[#7c6f63]">
                      Danh sách yêu cầu theo booking đang chọn.
                    </p>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-2xl border border-[#ead8c4]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#fbf5ed] text-xs tracking-[0.14em] text-[#6f5f50] uppercase">
                        <tr>
                          <th className="px-4 py-3">Dịch vụ</th>
                          <th className="px-4 py-3">SL</th>
                          <th className="px-4 py-3">Thành tiền</th>
                          <th className="px-4 py-3">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-10 text-center text-[#7c6f63]">
                              Đang tải...
                            </td>
                          </tr>
                        ) : items.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-10 text-center text-[#7c6f63]">
                              Chưa có dịch vụ phát sinh
                            </td>
                          </tr>
                        ) : (
                          items.map((item) => (
                            <tr key={item.id} className="border-t border-[#ead8c4]">
                              <td className="px-4 py-3">
                                <div className="font-bold text-[#1f1a17]">
                                  {item.serviceName || item.serviceId}
                                </div>
                                <div className="mt-1 flex items-center gap-1 text-xs text-[#8a7967]">
                                  <Clock className="h-3.5 w-3.5" />
                                  {item.description || "Không có ghi chú"}
                                </div>
                              </td>
                              <td className="px-4 py-3">{item.quantity}</td>
                              <td className="px-4 py-3 font-semibold">
                                {formatMoney(item.totalPrice || item.price * item.quantity)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                    item.status === "SERVED"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-[#fff6df] text-[#9b5c24]"
                                  }`}
                                >
                                  {item.status === "SERVED" ? "Đã phục vụ" : "Đang chờ"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </ProtectedRoute>
  );
}
