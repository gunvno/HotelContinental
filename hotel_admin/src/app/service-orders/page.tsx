"use client";

import { CheckCircle2, Loader2, Plus, RefreshCcw, Search, Trash2, Utensils } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/hooks/use-permission";
import { getRoomBookings, type RoomBookingResponse } from "@/services/booking-service";
import { getCatalogServices, type ServiceResponse } from "@/services/room-service";
import {
  createServiceOrderDetail,
  deleteServiceOrderDetail,
  getServiceOrderDetails,
  markServiceOrderServed,
  type ServiceOrderDetailResponse,
} from "@/services/service-order-service";

export default function ServiceOrdersPage() {
  const permission = usePermission();
  const canView = permission.has("SERVICE_ORDER_VIEW");
  const canCreate = permission.has("SERVICE_ORDER_CREATE");
  const canServe = permission.has("SERVICE_ORDER_SERVE");
  const canDelete = permission.has("SERVICE_ORDER_DELETE");

  const [bookings, setBookings] = useState<RoomBookingResponse[]>([]);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [items, setItems] = useState<ServiceOrderDetailResponse[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const serviceMap = useMemo(() => new Map(services.map((service) => [service.id, service])), [services]);
  const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId);
  const isBusy = actionId !== null;

  async function loadData(roomBookingId = selectedBookingId) {
    setLoading(true);
    setMessage(null);
    try {
      const [bookingData, serviceData, orderData] = await Promise.all([
        getRoomBookings(),
        getCatalogServices(0, 500),
        getServiceOrderDetails(roomBookingId || undefined),
      ]);

      setBookings(bookingData);
      setServices(serviceData.data);
      setItems(orderData);

      if (!roomBookingId) {
        const firstActive = bookingData.find((booking) => booking.status === "CHECKED_IN") ?? bookingData[0];
        if (firstActive) setSelectedBookingId(firstActive.id);
      }
    } catch {
      setMessage("Không tải được dữ liệu dịch vụ phát sinh. Kiểm tra billing-service, booking-service, catalog-service và quyền.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canView) return;
    void loadData("");
  }, [canView]);

  async function handleBookingChange(value: string) {
    setSelectedBookingId(value);
    await loadData(value);
  }

  async function handleCreate() {
    if (!canCreate || isBusy || !selectedBookingId || !serviceId || quantity <= 0) return;

    setActionId("create");
    setMessage(null);
    try {
      await createServiceOrderDetail({
        roomBookingId: selectedBookingId,
        serviceId,
        quantity,
        description: description.trim() || undefined,
      });
      setServiceId("");
      setQuantity(1);
      setDescription("");
      setMessage("Đã thêm dịch vụ phát sinh và cập nhật tổng tiền booking.");
      await loadData(selectedBookingId);
    } catch {
      setMessage("Không thể thêm dịch vụ. Booking phải có detail hợp lệ và tài khoản cần quyền SERVICE_ORDER_CREATE.");
    } finally {
      setActionId(null);
    }
  }

  async function handleServe(id: string) {
    if (!canServe || isBusy) return;

    setActionId(id);
    setMessage(null);
    try {
      const updated = await markServiceOrderServed(id);
      setItems((current) => current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
    } catch {
      setMessage("Không thể đánh dấu đã phục vụ. Kiểm tra quyền SERVICE_ORDER_SERVE.");
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!canDelete || isBusy) return;

    setActionId(id);
    setMessage(null);
    try {
      await deleteServiceOrderDetail(id);
      await loadData(selectedBookingId);
      setMessage("Đã xóa dịch vụ phát sinh và cập nhật lại tổng tiền booking.");
    } catch {
      setMessage("Không thể xóa dịch vụ phát sinh. Kiểm tra quyền SERVICE_ORDER_DELETE.");
    } finally {
      setActionId(null);
    }
  }

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((item) => {
      const service = serviceMap.get(item.serviceId);
      return `${service?.name ?? item.serviceName ?? ""} ${item.description ?? ""} ${item.serviceId}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [items, query, serviceMap]);

  if (!canView) {
    return <PermissionDenied message="Bạn không có quyền SERVICE_ORDER_VIEW để xem dịch vụ phát sinh." />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#decdb9] bg-white/85 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9b5c24]">Vận hành lưu trú</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17213a]">Dịch vụ phát sinh</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#7c6f63]">
              Thêm dịch vụ khách gọi riêng trong quá trình lưu trú. Dữ liệu này cộng vào tổng dịch vụ của booking.
            </p>
          </div>
          <Button type="button" onClick={() => void loadData(selectedBookingId)} disabled={loading || isBusy} className="gap-2">
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </Button>
        </div>
      </section>

      {message ? <div className="rounded-xl bg-[#fff6df] p-3 text-sm font-semibold text-[#8a5724]">{message}</div> : null}

      <section className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9b5c24] text-white">
              <Utensils className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold text-[#17213a]">Thêm dịch vụ</h3>
              <p className="text-sm text-[#7c6f63]">Chọn booking và dịch vụ trong catalog.</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#7c6f63]">Booking</span>
              <select
                value={selectedBookingId}
                onChange={(event) => void handleBookingChange(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-[#decdb9] bg-white px-3 text-sm"
              >
                <option value="">-- Chọn booking --</option>
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {shortCode(booking.id)} - {booking.status} - {booking.detailStatus ?? "N/A"}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#7c6f63]">Dịch vụ</span>
              <select
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
                disabled={services.length === 0}
                className="mt-2 h-11 w-full rounded-xl border border-[#decdb9] bg-white px-3 text-sm"
              >
                <option value="">-- Chọn dịch vụ --</option>
                {services.filter((service) => !service.deleted).map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {formatMoney(service.price ?? 0)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#7c6f63]">Số lượng</span>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                className="mt-2"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#7c6f63]">Ghi chú</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-[#decdb9] bg-white px-3 py-2 text-sm outline-none focus:border-[#c8792a]"
                placeholder="Ví dụ: giao lên phòng sau 20 phút"
              />
            </label>

            <div className="rounded-xl bg-[#fbf8f2] p-4 text-sm text-[#6f5f50]">
              <p>Booking đang chọn: <b>{selectedBooking ? shortCode(selectedBooking.id) : "Chưa chọn"}</b></p>
              <p>Tổng dịch vụ hiện tại: <b>{formatMoney(selectedBooking?.totalServicePrice ?? 0)}</b></p>
              <p>Tổng booking: <b>{formatMoney(selectedBooking?.totalPrice ?? 0)}</b></p>
            </div>

            <Button
              type="button"
              onClick={() => void handleCreate()}
              disabled={!canCreate || isBusy || !selectedBookingId || !serviceId}
              className="w-full gap-2"
            >
              {actionId === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Thêm dịch vụ
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-bold text-[#17213a]">Danh sách dịch vụ phát sinh</h3>
              <p className="text-sm text-[#7c6f63]">Theo booking đang chọn.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b5c24]" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm dịch vụ..." className="pl-9" />
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#decdb9]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fbf8f2] text-xs uppercase tracking-[0.14em] text-[#6f5f50]">
                <tr>
                  <th className="px-4 py-3">Dịch vụ</th>
                  <th className="px-4 py-3">SL</th>
                  <th className="px-4 py-3">Thành tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-[#7c6f63]">Đang tải...</td></tr>
                ) : filteredItems.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-[#7c6f63]">Chưa có dịch vụ phát sinh</td></tr>
                ) : (
                  filteredItems.map((item) => {
                    const service = serviceMap.get(item.serviceId);
                    const busy = actionId === item.id;
                    return (
                      <tr key={item.id} className="border-t border-[#ead8c4]">
                        <td className="px-4 py-3">
                          <div className="font-bold text-[#17213a]">{item.serviceName || service?.name || item.serviceId}</div>
                          <div className="text-xs text-[#8a7967]">{item.description || "Không có ghi chú"}</div>
                        </td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3 font-semibold">{formatMoney(item.totalPrice || item.price * item.quantity)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === "SERVED" ? "bg-emerald-50 text-emerald-700" : "bg-[#fff6df] text-[#9b5c24]"}`}>
                            {item.status === "SERVED" ? "Đã phục vụ" : "Đang chờ"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {item.status !== "SERVED" ? (
                              <button
                                type="button"
                                onClick={() => void handleServe(item.id)}
                                disabled={!canServe || isBusy}
                                className="inline-flex h-9 items-center gap-1 rounded-full border border-emerald-200 px-3 text-xs font-bold text-emerald-700 disabled:opacity-50"
                              >
                                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                Phục vụ
                              </button>
                            ) : null}
                            {canDelete ? (
                              <button
                                type="button"
                                onClick={() => void handleDelete(item.id)}
                                disabled={isBusy}
                                className="inline-flex h-9 items-center gap-1 rounded-full border border-red-200 px-3 text-xs font-bold text-red-700 disabled:opacity-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Xóa
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function shortCode(value?: string) {
  if (!value) return "N/A";
  return value.length > 8 ? value.slice(-8).toUpperCase() : value.toUpperCase();
}

function formatMoney(value: number) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}
