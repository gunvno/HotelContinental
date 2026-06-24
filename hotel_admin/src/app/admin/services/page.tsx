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

const statusOptions: QuickFilterOption<ServiceStatusFilter>[] = [
  { value: "ALL", label: "Táº¥t cáº£", desc: "ToÃ n bá»™ dá»‹ch vá»¥ gá»‘c" },
  { value: "AVAILABLE", label: "Hoáº¡t Ä‘á»™ng", desc: "Äang bÃ¡n Ä‘Æ°á»£c" },
  { value: "UNAVAILABLE", label: "Táº¡m ngÆ°ng", desc: "KhÃ´ng cho bÃ¡n" },
  { value: "MAINTENANCE", label: "Báº£o trÃ¬", desc: "Äang xá»­ lÃ½" },
  { value: "DELETED", label: "ÄÃ£ xÃ³a", desc: "áº¨n khá»i luá»“ng bÃ¡n" },
];

const statusLabel: Record<string, string> = {
  AVAILABLE: "Hoáº¡t Ä‘á»™ng",
  UNAVAILABLE: "Táº¡m ngÆ°ng",
  MAINTENANCE: "Báº£o trÃ¬",
};

const initialForm: CatalogServicePayload = {
  name: "",
  description: "",
  price: 0,
  image: "",
  status: "AVAILABLE",
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
      setError("KhÃ´ng thá»ƒ táº£i danh sÃ¡ch dá»‹ch vá»¥. Kiá»ƒm tra catalog-service vÃ  quyá»n tÃ i khoáº£n.");
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
      image: service.image ?? "",
      status: service.status ?? "AVAILABLE",
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
      setError("Vui lÃ²ng nháº­p tÃªn dá»‹ch vá»¥.");
      return;
    }
    if (price < 0) {
      setError("GiÃ¡ dá»‹ch vá»¥ khÃ´ng Ä‘Æ°á»£c Ã¢m.");
      return;
    }

    const payload: CatalogServicePayload = {
      name,
      description: form.description?.trim() || undefined,
      price,
      image: form.image?.trim() || undefined,
      status: form.status ?? "AVAILABLE",
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
        setMessage("ÄÃ£ cáº­p nháº­t dá»‹ch vá»¥ gá»‘c.");
      } else {
        const created = await createCatalogService(payload);
        setServices((items) => [created, ...items]);
        setMessage("ÄÃ£ táº¡o dá»‹ch vá»¥ gá»‘c. CÃ³ thá»ƒ Ä‘em gÃ¡n vÃ o loáº¡i phÃ²ng hoáº·c thÃªm vÃ o booking.");
      }
      setModalOpen(false);
      setEditingService(null);
      setForm(initialForm);
    } catch {
      setError("KhÃ´ng thá»ƒ lÆ°u dá»‹ch vá»¥. Kiá»ƒm tra dá»¯ liá»‡u vÃ  catalog-service.");
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
      setMessage(`ÄÃ£ xÃ³a dá»‹ch vá»¥ "${deleteTarget.name}".`);
      setDeleteTarget(null);
    } catch {
      setError("KhÃ´ng thá»ƒ xÃ³a dá»‹ch vá»¥ nÃ y.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!canView) {
    return (
      <PermissionDenied message="Báº¡n khÃ´ng cÃ³ quyá»n SERVICE_VIEW Ä‘á»ƒ xem danh sÃ¡ch dá»‹ch vá»¥." />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <section className="rounded-2xl border border-[#decdb9] bg-white/86 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-[#9b5c24] uppercase">
              Quáº£n lÃ½ dá»‹ch vá»¥ gá»‘c
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#17213a]">
              Danh sÃ¡ch dá»‹ch vá»¥
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-[#75695d]">
              Táº¡o dá»‹ch vá»¥ riÃªng biá»‡t trÆ°á»›c, sau Ä‘Ã³ má»›i Ä‘em gÃ¡n vÃ o loáº¡i phÃ²ng hoáº·c thÃªm
              vÃ o booking phÃ¡t sinh.
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
              Táº£i láº¡i
            </Button>
            {canCreate ? (
              <Button type="button" onClick={openCreateModal} className="gap-2">
                <Plus className="h-4 w-4" />
                ThÃªm dá»‹ch vá»¥
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-[#decdb9] bg-white/86 p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[360px_1fr] xl:items-end">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9b5c24]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="TÃ¬m theo tÃªn, mÃ´ táº£, mÃ£ dá»‹ch vá»¥..."
              className="pl-10"
            />
          </div>
          <QuickFilter
            title="Lá»c nhanh"
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
                <th className="px-5 py-4">Dá»‹ch vá»¥</th>
                <th className="px-5 py-4">GiÃ¡</th>
                <th className="px-5 py-4">Tráº¡ng thÃ¡i</th>
                <th className="px-5 py-4">MÃ£</th>
                <th className="px-5 py-4 text-right">HÃ nh Ä‘á»™ng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee3d5]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center font-semibold text-[#75695d]">
                    Äang táº£i danh sÃ¡ch dá»‹ch vá»¥...
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center font-semibold text-[#75695d]">
                    ChÆ°a cÃ³ dá»‹ch vá»¥ phÃ¹ há»£p.
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
                          {service.image ? (
                            <img
                              src={service.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Utensils className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-[#17213a]">{service.name}</p>
                          <p className="mt-1 max-w-xl truncate text-xs text-[#75695d]">
                            {service.description || "KhÃ´ng cÃ³ mÃ´ táº£"}
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
                          ? "ÄÃ£ xÃ³a"
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
                          Sá»­a
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
                            XÃ³a
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
              {editingService ? "Sá»­a dá»‹ch vá»¥" : "ThÃªm dá»‹ch vá»¥"}
            </h3>
            <p className="mt-1 text-sm text-[#75695d]">
              GiÃ¡ vÃ  tráº¡ng thÃ¡i á»Ÿ Ä‘Ã¢y lÃ  nguá»“n gá»‘c Ä‘á»ƒ tÃ­nh khi thÃªm dá»‹ch vá»¥ vÃ o booking.
            </p>

            <div className="mt-5 space-y-4">
              <TextField
                label="TÃªn dá»‹ch vá»¥"
                value={form.name}
                onValueChange={(name) => setForm({ ...form, name })}
                placeholder="VÃ­ dá»¥: Massage thÆ° giÃ£n 60 phÃºt"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="GiÃ¡"
                  type="number"
                  min="0"
                  value={form.price}
                  onValueChange={(price) =>
                    setForm({ ...form, price: Number(price) || 0 })
                  }
                />
                <Select
                  label="Tráº¡ng thÃ¡i"
                  value={form.status ?? "AVAILABLE"}
                  onValueChange={(value) => setForm({ ...form, status: value })}
                  options={[
                    { value: "AVAILABLE", label: "Hoáº¡t Ä‘á»™ng" },
                    { value: "UNAVAILABLE", label: "Táº¡m ngÆ°ng" },
                    { value: "MAINTENANCE", label: "Báº£o trÃ¬" },
                  ]}
                />
              </div>

              <TextField
                label="áº¢nh"
                value={form.image ?? ""}
                onValueChange={(image) => setForm({ ...form, image })}
                placeholder="URL áº£nh dá»‹ch vá»¥"
              />

              <TextareaField
                label="MÃ´ táº£"
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
                Há»§y
              </Button>
              <Button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="flex-1"
              >
                LÆ°u
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="XÃ³a dá»‹ch vá»¥"
        description={`Báº¡n cháº¯c cháº¯n muá»‘n xÃ³a dá»‹ch vá»¥ "${deleteTarget?.name ?? ""}"? Dá»‹ch vá»¥ sáº½ bá»‹ áº©n khá»i luá»“ng bÃ¡n má»›i.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}


