"use client";

import {
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  UserCheck,
  Utensils,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { TextareaField, TextField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { QuickFilter, type QuickFilterOption } from "@/components/ui/quick-filter";
import { Select } from "@/components/ui/select";
import { ToastBridge } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import { formatMoney } from "@/lib/format";
import { getRoomBookings, type RoomBookingResponse } from "@/services/booking-service";
import { getCatalogServices, type ServiceResponse } from "@/services/room-service";
import {
  assignServiceOrder,
  approveServiceOrder,
  createServiceOrderDetail,
  ensureIncludedServiceOrderDetails,
  getServiceOrderDetails,
  markServiceOrderServed,
  rejectServiceOrder,
  type ServiceOrderDetailResponse,
  type ServiceOrderApprovalStatus,
  type ServiceOrderDetailStatus,
  type ServiceOrderPaymentStatus,
} from "@/services/service-order-service";

const serviceOrderStatusOptions: QuickFilterOption<ServiceOrderDetailStatus>[] = [
  { value: "WAITING", label: "Chưa phục vụ", desc: "Cần xử lý" },
  { value: "SERVED", label: "Đã phục vụ", desc: "Đã hoàn tất" },
];

export default function ServiceOrdersPage() {
  const permission = usePermission();
  const canOpenPage = permission.has("SERVICE_ORDER_VIEW");
  const canView = permission.has("SERVICE_ORDER_VIEW");
  const isAdmin = permission.has("ROLE_ADMIN");
  const isManager = permission.has("ROLE_MANAGER");
  const isReceptionist = permission.has("ROLE_RECEPTIONIST");
  const isHousekeeping = permission.has("ROLE_HOUSEKEEPING");
  const canCreate = permission.has("SERVICE_ORDER_CREATE") && (isManager || isReceptionist);
  const canSyncIncluded = permission.has("SERVICE_ORDER_INCLUDED_SYNC");
  const canServe = permission.has("SERVICE_ORDER_SERVE") && isHousekeeping;
  const canManageApproval = permission.has("SERVICE_ORDER_DELETE") && isManager;

  const [bookings, setBookings] = useState<RoomBookingResponse[]>([]);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [items, setItems] = useState<ServiceOrderDetailResponse[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceOrderDetailStatus>("WAITING");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const initialLoadRef = useRef(false);

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
        "Không tải được dữ liệu dịch vụ phòng. Kiểm tra billing-service, booking-service, catalog-service và quyền.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canOpenPage) return;
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;
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
      setMessage("Đã thêm dịch vụ phát sinh và cập nhật tổng tiền booking.");
      await loadData(selectedBookingId);
    } catch {
      setMessage(
        "Không thể thêm dịch vụ. Booking phải có detail hợp lệ và tài khoản cần quyền SERVICE_ORDER_CREATE.",
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
      setMessage("Chỉ nhân viên phục vụ phòng mới được đánh dấu đã phục vụ.");
    } finally {
      setActionId(null);
    }
  }

  async function handleAssign(id: string) {
    if (!canServe || isBusy) return;

    setActionId(id);
    setMessage(null);
    try {
      const updated = await assignServiceOrder(id);
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
      setMessage("Đã nhận việc phục vụ dịch vụ.");
    } catch {
      setMessage("Chỉ nhân viên phục vụ phòng mới được nhận việc dịch vụ.");
    } finally {
      setActionId(null);
    }
  }

  async function handleApprove(id: string) {
    if (!canManageApproval || isBusy) return;

    setActionId(id);
    setMessage(null);
    try {
      const updated = await approveServiceOrder(id);
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
      setMessage("Đã duyệt yêu cầu dịch vụ.");
    } catch {
      setMessage("Không thể duyệt yêu cầu dịch vụ. Chỉ quản lý có quyền duyệt.");
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: string) {
    if (!canManageApproval || isBusy) return;

    setActionId(id);
    setMessage(null);
    try {
      const updated = await rejectServiceOrder(id);
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
      setMessage("Đã từ chối yêu cầu dịch vụ.");
    } catch {
      setMessage("Không thể từ chối yêu cầu dịch vụ. Chỉ quản lý có quyền từ chối.");
    } finally {
      setActionId(null);
    }
  }

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return items.filter((item) => {
      const paymentStatus = item.paymentStatus ?? "POST_TO_ROOM";
      if (paymentStatus === "PENDING_PAYMENT") return false;
      if (item.status !== statusFilter) return false;
      const approvalStatus = item.approvalStatus ?? "NOT_REQUIRED";
      if (!normalized) return true;

      const service = serviceMap.get(item.serviceId);
      return `${service?.name ?? item.serviceName ?? ""} ${item.description ?? ""} ${item.serviceId} ${item.roomName ?? ""} ${item.roomId ?? ""} ${approvalStatus} ${paymentStatus}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [items, query, serviceMap, statusFilter]);

  if (!canOpenPage) {
    return (
      <PermissionDenied message="Bạn không có quyền SERVICE_ORDER_VIEW để mở trang dịch vụ phát sinh." />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#decdb9] bg-white/85 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-[#9b5c24] uppercase">
              Vận hành lưu trú
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17213a]">
              Dịch vụ phòng
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#7c6f63]">
              Theo dõi dịch vụ kèm phòng và dịch vụ khách gọi thêm. Chỉ dịch vụ gọi thêm
              mới cộng vào tổng bill.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => void loadData(selectedBookingId)}
            disabled={loading || isBusy}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </Button>
        </div>
      </section>

      {message ? (
        <ToastBridge success={message} onClearSuccess={() => setMessage(null)} />
      ) : null}
      {!canView ? (
        <ToastBridge
          error="Token hiện tại chưa có quyền SERVICE_ORDER_VIEW. Restart identity-service rồi đăng xuất và đăng nhập lại để dùng đầy đủ chức năng."
        />
      ) : null}

      <section
        className={`grid gap-5 ${
          canCreate ? "xl:grid-cols-[420px_minmax(0,1fr)]" : "xl:grid-cols-1"
        }`}
      >
        {canCreate ? (
        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9b5c24] text-white">
              <Utensils className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold text-[#17213a]">Thêm dịch vụ</h3>
              <p className="text-sm text-[#7c6f63]">
                Dịch vụ gọi thêm sẽ được tính tiền vào booking.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <span className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
                Booking
              </span>
              <div className="mt-2 max-h-[260px] space-y-2 overflow-y-auto pr-1">
                {bookings.map((booking) => {
                  const selected = booking.id === selectedBookingId;
                  return (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => void handleBookingChange(booking.id)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        selected
                          ? "border-[#a46522] bg-[#fff6df] shadow-sm"
                          : "border-[#ead8c4] bg-white hover:border-[#c8792a]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-[#17213a]">{shortCode(booking.id)}</p>
                          <p className="mt-1 text-xs font-semibold text-[#7c6f63]">
                            Phòng {shortRoomId(booking.roomId)}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {bookingStatusLabel(booking.status)}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-1 text-xs text-[#7c6f63]">
                        <p>{formatBookingDateRange(booking.checkin, booking.checkout)}</p>
                        <p className="font-bold text-[#8a5724]">
                          Tổng: {formatMoney(booking.totalPrice ?? 0)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="hidden">
              <span className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
                Booking
              </span>
              <Select
                value={selectedBookingId}
                onValueChange={(value) => void handleBookingChange(value)}
                className="mt-2"
                placeholder="Chọn booking"
                options={[
                  { value: "", label: "-- Chọn booking --" },
                  ...bookings.map((booking) => ({
                    value: booking.id,
                    label: `${shortCode(booking.id)} - ${booking.status} - ${
                      booking.detailStatus ?? "N/A"
                    } - Phòng ${booking.roomId}`,
                  })),
                ]}
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold tracking-[0.16em] text-[#7c6f63] uppercase">
                Dịch vụ
              </span>
              <Select
                value={serviceId}
                onValueChange={setServiceId}
                disabled={services.length === 0}
                className="mt-2"
                placeholder="Chọn dịch vụ"
                options={[
                  { value: "", label: "-- Chọn dịch vụ --" },
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
              label="Số lượng"
              type="number"
              min={1}
              value={quantity}
              onValueChange={(value) => setQuantity(Math.max(1, Number(value) || 1))}
              labelClassName="tracking-[0.16em]"
            />

            <TextareaField
              label="Ghi chú"
              value={description}
              onValueChange={setDescription}
              placeholder="Ví dụ: giao lên phòng sau 20 phút"
              labelClassName="tracking-[0.16em]"
            />

            <div className="rounded-xl bg-[#fbf8f2] p-4 text-sm text-[#6f5f50]">
              <p>
                Booking đang chọn:{" "}
                <b>{selectedBooking ? shortCode(selectedBooking.id) : "Chưa chọn"}</b>
              </p>
              <p>
                Phòng: <b>{selectedBooking?.roomId ?? "Chưa chọn"}</b>
              </p>
              <p>
                Tổng dịch vụ hiện tại:{" "}
                <b>{formatMoney(selectedBooking?.totalServicePrice ?? 0)}</b>
              </p>
              <p>
                Tổng booking: <b>{formatMoney(selectedBooking?.totalPrice ?? 0)}</b>
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
              Thêm dịch vụ
            </Button>
          </div>
        </div>
        ) : null}

        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-bold text-[#17213a]">Danh sách dịch vụ cần phục vụ</h3>
              <p className="text-sm text-[#7c6f63]">
                Dịch vụ kèm phòng được đồng bộ từ loại phòng.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
              <div className="relative w-full md:w-72">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9b5c24]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm dịch vụ..."
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <QuickFilter
              title="Trạng thái phục vụ"
              value={statusFilter}
              options={serviceOrderStatusOptions}
              onChange={setStatusFilter}
              columnsClassName="grid-cols-2"
              className="bg-white/70 shadow-none"
            />
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#decdb9]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fbf8f2] text-xs tracking-[0.14em] text-[#6f5f50] uppercase">
                <tr>
                  <th className="px-4 py-3">Dịch vụ</th>
                  <th className="px-4 py-3">Phòng</th>
                  <th className="px-4 py-3">Nguồn</th>
                  <th className="px-4 py-3">SL</th>
                  <th className="px-4 py-3">Thành tiền</th>
                  <th className="px-4 py-3">Phân công</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Duyệt</th>
                  <th className="px-4 py-3">Thanh toán</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-[#7c6f63]">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-[#7c6f63]">
                      Không có dịch vụ phòng phù hợp bộ lọc
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
                            {item.description || "Không có ghi chú"}
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
                            {source === "INCLUDED" ? "Kèm phòng" : "Gọi thêm"}
                          </span>
                        </td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3 font-semibold">
                          {item.chargeable === false
                            ? "Miễn phí"
                            : formatMoney(item.totalPrice || item.price * item.quantity)}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#6f5f50]">
                          <p>
                            <span className="font-bold">Nhân viên:</span>{" "}
                            {item.assignedTo
                              ? `${item.assignedTo} - ${formatTaskTime(item.assignedTime)}`
                              : "Chưa có"}
                          </p>
                          <p className="mt-1">
                            <span className="font-bold">Hoàn thành:</span>{" "}
                            {item.servedBy
                              ? `${item.servedBy} - ${formatTaskTime(item.servedTime)}`
                              : "Chưa có"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === "SERVED" ? "bg-emerald-50 text-emerald-700" : "bg-[#fff6df] text-[#9b5c24]"}`}
                          >
                            {item.status === "SERVED" ? "Đã phục vụ" : "Đang chờ"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <ApprovalBadge status={item.approvalStatus ?? "NOT_REQUIRED"} />
                        </td>
                        <td className="px-4 py-3">
                          <PaymentBadge status={item.paymentStatus ?? "POST_TO_ROOM"} />
                          {item.paymentTime ? (
                            <p className="mt-1 text-xs text-[#8a7967]">
                              {new Date(item.paymentTime).toLocaleString("vi-VN")}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {item.approvalStatus === "PENDING" && canManageApproval ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void handleApprove(item.id)}
                                  disabled={!canManageApproval || isBusy}
                                  className="inline-flex h-9 items-center gap-1 rounded-full border border-emerald-200 px-3 text-xs font-bold text-emerald-700 disabled:opacity-50"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Duyệt
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleReject(item.id)}
                                  disabled={!canManageApproval || isBusy}
                                  className="inline-flex h-9 items-center gap-1 rounded-full border border-red-200 px-3 text-xs font-bold text-red-700 disabled:opacity-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Từ chối
                                </button>
                              </>
                            ) : canServe &&
                              item.status !== "SERVED" &&
                              item.approvalStatus !== "PENDING" &&
                              item.approvalStatus !== "REJECTED" ? (
                              <>
                                {!item.assignedTo ? (
                                  <button
                                    type="button"
                                    onClick={() => void handleAssign(item.id)}
                                    disabled={!canServe || isBusy}
                                    className="inline-flex h-9 items-center gap-1 rounded-full border border-sky-200 px-3 text-xs font-bold text-sky-700 disabled:opacity-50"
                                  >
                                    {busy ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <UserCheck className="h-3.5 w-3.5" />
                                    )}
                                    Nhận
                                  </button>
                                ) : null}
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
                                  Phục vụ
                                </button>
                              </>
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

function ApprovalBadge({ status }: { status: ServiceOrderApprovalStatus }) {
  const config: Record<ServiceOrderApprovalStatus, { label: string; className: string }> = {
    NOT_REQUIRED: {
      label: "Không cần duyệt",
      className: "bg-slate-100 text-slate-700",
    },
    PENDING: {
      label: "Chờ duyệt",
      className: "bg-amber-50 text-amber-700",
    },
    APPROVED: {
      label: "Đã duyệt",
      className: "bg-emerald-50 text-emerald-700",
    },
    REJECTED: {
      label: "Từ chối",
      className: "bg-red-50 text-red-700",
    },
  };
  const item = config[status] ?? config.NOT_REQUIRED;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.className}`}>
      {item.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: ServiceOrderPaymentStatus }) {
  const config: Record<ServiceOrderPaymentStatus, { label: string; className: string }> = {
    POST_TO_ROOM: {
      label: "Thu checkout",
      className: "bg-[#fff6df] text-[#9b5c24]",
    },
    PENDING_PAYMENT: {
      label: "Chờ PayOS",
      className: "bg-sky-50 text-sky-700",
    },
    PAID: {
      label: "Đã thanh toán",
      className: "bg-emerald-50 text-emerald-700",
    },
  };
  const item = config[status] ?? config.POST_TO_ROOM;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.className}`}>
      {item.label}
    </span>
  );
}

function formatTaskTime(value?: string) {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
}

function shortCode(value?: string) {
  if (!value) return "N/A";
  return value.length > 8 ? value.slice(-8).toUpperCase() : value.toUpperCase();
}

function shortRoomId(value?: string) {
  if (!value) return "N/A";
  return value.length > 10 ? `${value.slice(0, 8)}...` : value;
}

function bookingStatusLabel(status?: RoomBookingResponse["status"]) {
  switch (status) {
    case "CHECKED_IN":
      return "Đang lưu trú";
    case "DEPOSITED":
      return "Đã thanh toán";
    case "CANCEL_REQUESTED":
      return "Chờ duyệt hủy";
    case "DONE":
      return "Đã trả phòng";
    case "CANCEL":
      return "Đã hủy";
    default:
      return "Chờ thanh toán";
  }
}

function formatBookingDateRange(checkin?: string, checkout?: string) {
  return `${formatBookingDateTime(checkin)} -> ${formatBookingDateTime(checkout)}`;
}

function formatBookingDateTime(value?: string) {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
