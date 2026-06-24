"use client";

import {
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Utensils,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { TextareaField, TextField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { QuickFilter, type QuickFilterOption } from "@/components/ui/quick-filter";
import { Select } from "@/components/ui/select";
import { usePermission } from "@/hooks/use-permission";
import { formatMoney } from "@/lib/format";
import { getRoomBookings, type RoomBookingResponse } from "@/services/booking-service";
import { getCatalogServices, type ServiceResponse } from "@/services/room-service";
import {
  createServiceOrderDetail,
  deleteServiceOrderDetail,
  ensureIncludedServiceOrderDetails,
  getServiceOrderDetails,
  markServiceOrderServed,
  type ServiceOrderDetailResponse,
  type ServiceOrderDetailStatus,
  type ServiceOrderSource,
} from "@/services/service-order-service";

const serviceOrderStatusOptions: QuickFilterOption<ServiceOrderDetailStatus | "ALL">[] = [
  { value: "ALL", label: "Táº¥t cáº£", desc: "ToÃ n bá»™ dá»‹ch vá»¥" },
  { value: "WAITING", label: "Äang chá»", desc: "Cáº§n phá»¥c vá»¥" },
  { value: "SERVED", label: "ÄÃ£ phá»¥c vá»¥", desc: "ÄÃ£ hoÃ n táº¥t" },
];

const serviceOrderSourceOptions: QuickFilterOption<ServiceOrderSource | "ALL">[] = [
  { value: "ALL", label: "Táº¥t cáº£", desc: "Má»i nguá»“n dá»‹ch vá»¥" },
  { value: "INCLUDED", label: "KÃ¨m phÃ²ng", desc: "CÃ³ trong loáº¡i phÃ²ng" },
  { value: "EXTRA", label: "Gá»i thÃªm", desc: "TÃ­nh thÃªm vÃ o bill" },
];

export default function ServiceOrdersPage() {
  const permission = usePermission();
  const canOpenPage = permission.hasAny("SERVICE_ORDER_VIEW", "BOOKING_VIEW");
  const canView = permission.has("SERVICE_ORDER_VIEW");
  const canCreate = permission.has("SERVICE_ORDER_CREATE");
  const canSyncIncluded = permission.has("SERVICE_ORDER_INCLUDED_SYNC");
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
  const [statusFilter, setStatusFilter] = useState<ServiceOrderDetailStatus | "ALL">(
    "ALL",
  );
  const [sourceFilter, setSourceFilter] = useState<ServiceOrderSource | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const serviceMap = useMemo(
    () => new Map(services.map((service) => [service.id, service])),
    [services],
  );
  const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId);
  const isBusy = actionId !== null;

  async function loadData(roomBookingId = selectedBookingId) {
    setLoading(true);
    setMessage(null);
    try {
      const [bookingData, serviceData] = await Promise.all([
        getRoomBookings(),
        getCatalogServices(0, 500),
      ]);

      const targetBookingId =
        roomBookingId ||
        bookingData.find((booking) => booking.status === "CHECKED_IN")?.id ||
        bookingData.find((booking) => booking.status === "DEPOSITED")?.id ||
        bookingData[0]?.id ||
        "";

      let orderData: ServiceOrderDetailResponse[] = [];
      if (targetBookingId) {
        try {
          orderData = canSyncIncluded
            ? await ensureIncludedServiceOrderDetails(targetBookingId)
            : await getServiceOrderDetails(targetBookingId);
        } catch {
          orderData = await getServiceOrderDetails(targetBookingId);
        }
      } else {
        orderData = await getServiceOrderDetails(undefined);
      }

      setBookings(bookingData);
      setServices(serviceData.data);
      setItems(orderData);
      setSelectedBookingId(targetBookingId);
    } catch {
      setMessage(
        "KhÃ´ng táº£i Ä‘Æ°á»£c dá»¯ liá»‡u dá»‹ch vá»¥ phÃ²ng. Kiá»ƒm tra billing-service, booking-service, catalog-service vÃ  quyá»n.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canOpenPage) return;
    void loadData("");
  }, [canOpenPage]);

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
      setMessage("ÄÃ£ thÃªm dá»‹ch vá»¥ phÃ¡t sinh vÃ  cáº­p nháº­t tá»•ng tiá»n booking.");
      await loadData(selectedBookingId);
    } catch {
      setMessage(
        "KhÃ´ng thá»ƒ thÃªm dá»‹ch vá»¥. Booking pháº£i cÃ³ detail há»£p lá»‡ vÃ  tÃ i khoáº£n cáº§n quyá»n SERVICE_ORDER_CREATE.",
      );
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
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
    } catch {
      setMessage("KhÃ´ng thá»ƒ Ä‘Ã¡nh dáº¥u Ä‘Ã£ phá»¥c vá»¥. Kiá»ƒm tra quyá»n SERVICE_ORDER_SERVE.");
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
      setMessage("ÄÃ£ xÃ³a dá»‹ch vá»¥ phÃ¡t sinh vÃ  cáº­p nháº­t láº¡i tá»•ng tiá»n booking.");
    } catch {
      setMessage("KhÃ´ng thá»ƒ xÃ³a dá»‹ch vá»¥ phÃ¡t sinh. Kiá»ƒm tra quyá»n SERVICE_ORDER_DELETE.");
    } finally {
      setActionId(null);
    }
  }

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      if (!matchesStatus) return false;
      const source = item.source ?? "EXTRA";
      const matchesSource = sourceFilter === "ALL" || source === sourceFilter;
      if (!matchesSource) return false;
      if (!normalized) return true;

      const service = serviceMap.get(item.serviceId);
      return `${service?.name ?? item.serviceName ?? ""} ${item.description ?? ""} ${item.serviceId} ${item.roomName ?? ""} ${item.roomId ?? ""}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [items, query, serviceMap, sourceFilter, statusFilter]);

  if (!canOpenPage) {
    return (
      <PermissionDenied message="Báº¡n khÃ´ng cÃ³ quyá»n BOOKING_VIEW Ä‘á»ƒ má»Ÿ trang dá»‹ch vá»¥ phÃ¡t sinh." />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#decdb9] bg-white/85 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-[#9b5c24] uppercase">
              Váº­n hÃ nh lÆ°u trÃº
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17213a]">
              Dá»‹ch vá»¥ phÃ²ng
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#7c6f63]">
              Theo dÃµi dá»‹ch vá»¥ kÃ¨m phÃ²ng vÃ  dá»‹ch vá»¥ khÃ¡ch gá»i thÃªm. Chá»‰ dá»‹ch vá»¥ gá»i thÃªm
              má»›i cá»™ng vÃ o tá»•ng bill.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => void loadData(selectedBookingId)}
            disabled={loading || isBusy}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Táº£i láº¡i
          </Button>
        </div>
      </section>

      {message ? (
        <div className="rounded-xl bg-[#fff6df] p-3 text-sm font-semibold text-[#8a5724]">
          {message}
        </div>
      ) : null}
      {!canView ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          Token hiá»‡n táº¡i chÆ°a cÃ³ quyá»n SERVICE_ORDER_VIEW. Restart identity-service rá»“i
          Ä‘Äƒng xuáº¥t vÃ  Ä‘Äƒng nháº­p láº¡i Ä‘á»ƒ dÃ¹ng Ä‘áº§y Ä‘á»§ chá»©c nÄƒng.
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9b5c24] text-white">
              <Utensils className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold text-[#17213a]">ThÃªm dá»‹ch vá»¥</h3>
              <p className="text-sm text-[#7c6f63]">
                Dá»‹ch vá»¥ gá»i thÃªm sáº½ Ä‘Æ°á»£c tÃ­nh tiá»n vÃ o booking.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
                Booking
              </span>
              <Select
                value={selectedBookingId}
                onValueChange={(value) => void handleBookingChange(value)}
                className="mt-2"
                placeholder="Chá»n booking"
                options={[
                  { value: "", label: "-- Chá»n booking --" },
                  ...bookings.map((booking) => ({
                    value: booking.id,
                    label: `${shortCode(booking.id)} - ${booking.status} - ${
                      booking.detailStatus ?? "N/A"
                    } - PhÃ²ng ${booking.roomId}`,
                  })),
                ]}
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
                Dá»‹ch vá»¥
              </span>
              <Select
                value={serviceId}
                onValueChange={setServiceId}
                disabled={services.length === 0}
                className="mt-2"
                placeholder="Chá»n dá»‹ch vá»¥"
                options={[
                  { value: "", label: "-- Chá»n dá»‹ch vá»¥ --" },
                  ...services
                    .filter((service) => !service.deleted)
                    .map((service) => ({
                      value: service.id,
                      label: `${service.name} - ${formatMoney(service.price ?? 0)}`,
                    })),
                ]}
              />
            </label>

            <TextField
              label="Sá»‘ lÆ°á»£ng"
              type="number"
              min={1}
              value={quantity}
              onValueChange={(value) => setQuantity(Math.max(1, Number(value) || 1))}
              labelClassName="tracking-[0.16em]"
            />

            <TextareaField
              label="Ghi chÃº"
              value={description}
              onValueChange={setDescription}
              placeholder="VÃ­ dá»¥: giao lÃªn phÃ²ng sau 20 phÃºt"
              labelClassName="tracking-[0.16em]"
            />

            <div className="rounded-xl bg-[#fbf8f2] p-4 text-sm text-[#6f5f50]">
              <p>
                Booking Ä‘ang chá»n:{" "}
                <b>{selectedBooking ? shortCode(selectedBooking.id) : "ChÆ°a chá»n"}</b>
              </p>
              <p>
                PhÃ²ng: <b>{selectedBooking?.roomId ?? "ChÆ°a chá»n"}</b>
              </p>
              <p>
                Tá»•ng dá»‹ch vá»¥ hiá»‡n táº¡i:{" "}
                <b>{formatMoney(selectedBooking?.totalServicePrice ?? 0)}</b>
              </p>
              <p>
                Tá»•ng booking: <b>{formatMoney(selectedBooking?.totalPrice ?? 0)}</b>
              </p>
            </div>

            <Button
              type="button"
              onClick={() => void handleCreate()}
              disabled={!canCreate || isBusy || !selectedBookingId || !serviceId}
              className="w-full gap-2"
            >
              {actionId === "create" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              ThÃªm dá»‹ch vá»¥
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-bold text-[#17213a]">Danh sÃ¡ch dá»‹ch vá»¥ cáº§n phá»¥c vá»¥</h3>
              <p className="text-sm text-[#7c6f63]">
                Dá»‹ch vá»¥ kÃ¨m phÃ²ng Ä‘Æ°á»£c Ä‘á»“ng bá»™ tá»« loáº¡i phÃ²ng.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
              <div className="relative w-full md:w-72">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9b5c24]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="TÃ¬m dá»‹ch vá»¥..."
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <QuickFilter
              title="Lá»c tráº¡ng thÃ¡i"
              value={statusFilter}
              options={serviceOrderStatusOptions}
              onChange={setStatusFilter}
              columnsClassName="sm:grid-cols-3"
              className="bg-white/70 shadow-none"
            />
            <QuickFilter
              title="Lá»c nguá»“n dá»‹ch vá»¥"
              value={sourceFilter}
              options={serviceOrderSourceOptions}
              onChange={setSourceFilter}
              columnsClassName="sm:grid-cols-3"
              className="bg-white/70 shadow-none"
            />
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#decdb9]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fbf8f2] text-xs tracking-[0.14em] text-[#6f5f50] uppercase">
                <tr>
                  <th className="px-4 py-3">Dá»‹ch vá»¥</th>
                  <th className="px-4 py-3">PhÃ²ng</th>
                  <th className="px-4 py-3">Nguá»“n</th>
                  <th className="px-4 py-3">SL</th>
                  <th className="px-4 py-3">ThÃ nh tiá»n</th>
                  <th className="px-4 py-3">Tráº¡ng thÃ¡i</th>
                  <th className="px-4 py-3 text-right">HÃ nh Ä‘á»™ng</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[#7c6f63]">
                      Äang táº£i...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[#7c6f63]">
                      KhÃ´ng cÃ³ dá»‹ch vá»¥ phÃ²ng phÃ¹ há»£p bá»™ lá»c
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const service = serviceMap.get(item.serviceId);
                    const busy = actionId === item.id;
                    const source = item.source ?? "EXTRA";
                    return (
                      <tr key={item.id} className="border-t border-[#ead8c4]">
                        <td className="px-4 py-3">
                          <div className="font-bold text-[#17213a]">
                            {item.serviceName || service?.name || item.serviceId}
                          </div>
                          <div className="text-xs text-[#8a7967]">
                            {item.description || "KhÃ´ng cÃ³ ghi chÃº"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-[#17213a]">
                            {item.roomName ||
                              item.roomId ||
                              selectedBooking?.roomId ||
                              "N/A"}
                          </div>
                          <div className="text-xs text-[#8a7967]">
                            {shortCode(item.roomBookingId || selectedBookingId)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              source === "INCLUDED"
                                ? "bg-sky-50 text-sky-700"
                                : "bg-[#fff6df] text-[#9b5c24]"
                            }`}
                          >
                            {source === "INCLUDED" ? "KÃ¨m phÃ²ng" : "Gá»i thÃªm"}
                          </span>
                        </td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3 font-semibold">
                          {item.chargeable === false
                            ? "Miá»…n phÃ­"
                            : formatMoney(item.totalPrice || item.price * item.quantity)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === "SERVED" ? "bg-emerald-50 text-emerald-700" : "bg-[#fff6df] text-[#9b5c24]"}`}
                          >
                            {item.status === "SERVED" ? "ÄÃ£ phá»¥c vá»¥" : "Äang chá»"}
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
                                {busy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                Phá»¥c vá»¥
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
                                XÃ³a
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


