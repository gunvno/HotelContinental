"use client";

import { Pencil, Plus, RefreshCcw, Search, Trash2, Utensils } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TextareaField, TextField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { QuickFilter, type QuickFilterOption } from "@/components/ui/quick-filter";
import { Select } from "@/components/ui/select";
import { ToastBridge } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import { formatMoney } from "@/lib/format";
import {
  type CatalogServicePayload,
  createCatalogService,
  deleteCatalogService,
  getCatalogServices,
  type ServiceResponse,
  updateCatalogService,
} from "@/services/room-service";

type ServiceStatusFilter = "ALL" | "AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE" | "DELETED";
type ServiceOrderMode = "CUSTOMER_INSTANT" | "CUSTOMER_REQUEST" | "STAFF_ONLY";

const statusOptions: QuickFilterOption<ServiceStatusFilter>[] = [
  { value: "ALL", label: "Tất cả", desc: "Toàn bộ dịch vụ gốc" },
  { value: "AVAILABLE", label: "Hoạt động", desc: "Đang bán được" },
  { value: "UNAVAILABLE", label: "Tạm ngưng", desc: "Không cho bán" },
  { value: "MAINTENANCE", label: "Bảo trì", desc: "Đang xử lý" },
  { value: "DELETED", label: "Đã xóa", desc: "Ẩn khỏi luồng bán" },
];

const statusLabel: Record<string, string> = {
  AVAILABLE: "Hoạt động",
  UNAVAILABLE: "Tạm ngưng",
  MAINTENANCE: "Bảo trì",
};

const orderModeLabel: Record<ServiceOrderMode, string> = {
  CUSTOMER_INSTANT: "Khách tự đặt",
  CUSTOMER_REQUEST: "Cần lễ tân duyệt",
  STAFF_ONLY: "Chỉ nhân viên thêm",
};

const initialForm: CatalogServicePayload = {
  name: "",
  description: "",
  price: 0,
  status: "AVAILABLE",
  orderMode: "CUSTOMER_INSTANT",
};

export default function AdminServicesPage() {
  const permission = usePermission();
  const canView = permission.has("SERVICE_VIEW");
  const canCreate = permission.has("SERVICE_CREATE");
  const canUpdate = permission.has("SERVICE_UPDATE");
  const canDelete = permission.has("SERVICE_DELETE");

  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ServiceStatusFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceResponse | null>(null);
  const [form, setForm] = useState<CatalogServicePayload>(initialForm);
  const [deleteTarget, setDeleteTarget] = useState<ServiceResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadServices() {
    if (!canView) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await getCatalogServices(0, 1000);
      setServices(data);
    } catch {
      setError("Không thể tải danh sách dịch vụ. Kiểm tra catalog-service và quyền tài khoản.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadServices();
  }, [canView]);

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return services.filter((service) => {
      const matchesQuery =
        !normalizedQuery ||
        service.name.toLowerCase().includes(normalizedQuery) ||
        service.description?.toLowerCase().includes(normalizedQuery) ||
        service.id.toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        status === "ALL" ||
        (status === "DELETED" ? service.deleted : service.status === status && !service.deleted);
      return matchesQuery && matchesStatus;
    });
  }, [query, services, status]);

  function openCreateModal() {
    setEditingService(null);
    setForm(initialForm);
    setModalOpen(true);
    setError(null);
    setMessage(null);
  }

  function openEditModal(service: ServiceResponse) {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description ?? "",
      price: service.price ?? 0,
      status: service.status ?? "AVAILABLE",
      orderMode: service.orderMode ?? "CUSTOMER_INSTANT",
      deleted: service.deleted,
    });
    setModalOpen(true);
    setError(null);
    setMessage(null);
  }

  async function handleSave() {
    const name = form.name.trim();
    const price = Number(form.price) || 0;
    if (!name) {
      setError("Vui lòng nhập tên dịch vụ.");
      return;
    }
    if (price < 0) {
      setError("Giá dịch vụ không được âm.");
      return;
    }

    const payload: CatalogServicePayload = {
      name,
      description: form.description?.trim() || undefined,
      price,
      status: form.status ?? "AVAILABLE",
      orderMode: form.orderMode ?? "CUSTOMER_INSTANT",
      deleted: form.deleted,
    };

    setIsSaving(true);
    setError(null);
    try {
      if (editingService) {
        const updated = await updateCatalogService(editingService.id, payload);
        setServices((items) =>
          items.map((item) => (item.id === updated.id ? updated : item)),
        );
        setMessage("Đã cập nhật dịch vụ gốc.");
      } else {
        const created = await createCatalogService(payload);
        setServices((items) => [created, ...items]);
        setMessage("Đã tạo dịch vụ gốc. Có thể đem gán vào loại phòng hoặc thêm vào booking.");
      }
      setModalOpen(false);
      setEditingService(null);
      setForm(initialForm);
    } catch {
      setError("Không thể lưu dịch vụ. Kiểm tra dữ liệu và catalog-service.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsSaving(true);
    setError(null);
    try {
      await deleteCatalogService(deleteTarget.id);
      setServices((items) =>
        items.map((item) =>
          item.id === deleteTarget.id ? { ...item, deleted: true } : item,
        ),
      );
      setMessage(`Đã xóa dịch vụ "${deleteTarget.name}".`);
      setDeleteTarget(null);
    } catch {
      setError("Không thể xóa dịch vụ này.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!canView) {
    return (
      <PermissionDenied message="Bạn không có quyền SERVICE_VIEW để xem danh sách dịch vụ." />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <section className="rounded-2xl border border-[#decdb9] bg-white/86 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-[#9b5c24] uppercase">
              Quản lý dịch vụ gốc
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#17213a]">
              Danh sách dịch vụ
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-[#75695d]">
              Tạo dịch vụ riêng biệt trước, sau đó mới đem gán vào loại phòng hoặc thêm
              vào booking phát sinh.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadServices()}
              disabled={isLoading || isSaving}
              className="gap-2"
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Tải lại
            </Button>
            {canCreate ? (
              <Button type="button" onClick={openCreateModal} className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm dịch vụ
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {message ? (
        <ToastBridge
          success={message}
          onClearSuccess={() => setMessage(null)}
        />
      ) : null}
      {error ? (
        <ToastBridge
          error={error}
          onClearError={() => setError(null)}
        />
      ) : null}

      <section className="rounded-2xl border border-[#decdb9] bg-white/86 p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[360px_1fr] xl:items-end">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9b5c24]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên, mô tả, mã dịch vụ..."
              className="pl-10"
            />
          </div>
          <QuickFilter
            title="Lọc nhanh"
            value={status}
            onChange={setStatus}
            options={statusOptions}
            columnsClassName="sm:grid-cols-2 lg:grid-cols-5"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#decdb9] bg-white/90 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbf6ed] text-xs font-bold tracking-[0.14em] text-[#75695d] uppercase">
              <tr>
                <th className="px-5 py-4">Dịch vụ</th>
                <th className="px-5 py-4">Giá</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4">Mã</th>
                <th className="px-5 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee3d5]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center font-semibold text-[#75695d]">
                    Đang tải danh sách dịch vụ...
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center font-semibold text-[#75695d]">
                    Chưa có dịch vụ phù hợp.
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr
                    key={service.id}
                    className={service.deleted ? "bg-red-50/40" : "hover:bg-[#fbf6ed]"}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-[#fff6df] text-[#9b5c24]">
                          <Utensils className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-[#17213a]">{service.name}</p>
                          <p className="mt-1 max-w-xl truncate text-xs text-[#75695d]">
                            {service.description || "Không có mô tả"}
                          </p>
                          <p className="mt-2 inline-flex rounded-full bg-[#fff6df] px-2.5 py-1 text-xs font-bold text-[#8a5724]">
                            {orderModeLabel[(service.orderMode ?? "CUSTOMER_INSTANT") as ServiceOrderMode]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-black text-[#8a5724]">
                      {formatMoney(service.price)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          service.deleted
                            ? "bg-red-100 text-red-700"
                            : service.status === "AVAILABLE"
                              ? "bg-green-100 text-green-700"
                              : service.status === "MAINTENANCE"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {service.deleted
                          ? "Đã xóa"
                          : statusLabel[service.status ?? ""] ?? service.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs break-all text-[#75695d]">
                      {service.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!canUpdate || isSaving}
                          onClick={() => openEditModal(service)}
                          className="h-9 gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Sửa
                        </Button>
                        {!service.deleted ? (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!canDelete || isSaving}
                            onClick={() => setDeleteTarget(service)}
                            className="h-9 gap-2 border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Xóa
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-black text-[#17213a]">
              {editingService ? "Sửa dịch vụ" : "Thêm dịch vụ"}
            </h3>
            <p className="mt-1 text-sm text-[#75695d]">
              Giá và trạng thái ở đây là nguồn gốc để tính khi thêm dịch vụ vào booking.
            </p>

            <div className="mt-5 space-y-4">
              <TextField
                label="Tên dịch vụ"
                value={form.name}
                onValueChange={(name) => setForm({ ...form, name })}
                placeholder="Ví dụ: Massage thư giãn 60 phút"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Giá"
                  type="number"
                  min="0"
                  value={form.price}
                  onValueChange={(price) =>
                    setForm({ ...form, price: Number(price) || 0 })
                  }
                />
                <Select
                  label="Trạng thái"
                  value={form.status ?? "AVAILABLE"}
                  onValueChange={(value) => setForm({ ...form, status: value })}
                  options={[
                    { value: "AVAILABLE", label: "Hoạt động" },
                    { value: "UNAVAILABLE", label: "Tạm ngưng" },
                    { value: "MAINTENANCE", label: "Bảo trì" },
                  ]}
                />
              </div>

              <Select
                label="Kiểu đặt dịch vụ"
                value={form.orderMode ?? "CUSTOMER_INSTANT"}
                onValueChange={(value) =>
                  setForm({ ...form, orderMode: value as ServiceOrderMode })
                }
                options={[
                  { value: "CUSTOMER_INSTANT", label: "Khách tự đặt và có thể thanh toán ngay" },
                  { value: "CUSTOMER_REQUEST", label: "Khách gửi yêu cầu, lễ tân xác nhận" },
                  { value: "STAFF_ONLY", label: "Chỉ nhân viên thêm vào booking" },
                ]}
              />

              <TextareaField
                label="Mô tả"
                value={form.description ?? ""}
                onValueChange={(description) => setForm({ ...form, description })}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={isSaving}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="flex-1"
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa dịch vụ"
        description={`Bạn chắc chắn muốn xóa dịch vụ "${deleteTarget?.name ?? ""}"? Dịch vụ sẽ bị ẩn khỏi luồng bán mới.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}


