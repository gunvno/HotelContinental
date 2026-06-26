"use client";

import { CalendarDays, Plus, RefreshCcw, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { ToastBridge } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import {
  createRoomRateRule,
  deleteRoomRateRule,
  getRoomRateRules,
  getRoomTypes,
  type RoomRateRulePayload,
  type RoomRateRuleResponse,
  type RoomRateRuleType,
  type RoomTypeResponse,
  updateRoomRateRule,
} from "@/services/room-service";

const dayOptions = [
  { value: "MONDAY", label: "T2" },
  { value: "TUESDAY", label: "T3" },
  { value: "WEDNESDAY", label: "T4" },
  { value: "THURSDAY", label: "T5" },
  { value: "FRIDAY", label: "T6" },
  { value: "SATURDAY", label: "T7" },
  { value: "SUNDAY", label: "CN" },
];

const initialForm: RoomRateRulePayload = {
  roomTypeId: "",
  name: "",
  ruleType: "WEEKEND",
  startDate: "",
  endDate: "",
  daysOfWeek: "SATURDAY,SUNDAY",
  multiplier: 1.1,
  priority: 10,
  note: "",
  active: true,
};

export default function AdminRoomRateRulesPage() {
  const permission = usePermission();
  const [rules, setRules] = useState<RoomRateRuleResponse[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [form, setForm] = useState<RoomRateRulePayload>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canView = permission.has("ROOM_RATE_RULE_VIEW");
  const canCreate = permission.has("ROOM_RATE_RULE_CREATE");
  const canUpdate = permission.has("ROOM_RATE_RULE_UPDATE");
  const canDelete = permission.has("ROOM_RATE_RULE_DELETE");
  const isActionBusy = isLoading || isSaving;
  const selectedDays = useMemo(
    () => new Set((form.daysOfWeek || "").split(",").filter(Boolean)),
    [form.daysOfWeek],
  );

  async function loadData() {
    setIsLoading(true);
    setMessage(null);
    try {
      const [rulePage, roomTypePage] = await Promise.all([
        getRoomRateRules(0, 200),
        getRoomTypes(0, 500),
      ]);
      setRules(rulePage.data);
      setRoomTypes(roomTypePage.data.filter((roomType) => !roomType.deleted));
    } catch {
      setMessage("Không thể tải dữ liệu hệ số giá.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isActionBusy || (!editingId && !canCreate) || (editingId && !canUpdate)) return;

    setIsSaving(true);
    setMessage(null);

    const payload: RoomRateRulePayload = {
      ...form,
      roomTypeId: form.roomTypeId || null,
      daysOfWeek: form.daysOfWeek || null,
      multiplier: Number(form.multiplier),
      priority: Number(form.priority),
      active: form.active !== false,
    };

    try {
      if (editingId) {
        await updateRoomRateRule(editingId, payload);
        setMessage("Đã cập nhật hệ số giá.");
      } else {
        await createRoomRateRule(payload);
        setMessage("Đã tạo hệ số giá.");
      }
      resetForm();
      await loadData();
    } catch {
      setMessage("Không thể lưu hệ số giá. Kiểm tra ngày, hệ số và quyền thao tác.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (isActionBusy || !canDelete) return;
    setIsSaving(true);
    setMessage(null);
    try {
      await deleteRoomRateRule(id);
      setMessage("Đã xóa hệ số giá.");
      await loadData();
    } catch {
      setMessage("Không thể xóa hệ số giá.");
    } finally {
      setIsSaving(false);
    }
  }

  function editRule(rule: RoomRateRuleResponse) {
    if (!canUpdate) return;
    setEditingId(rule.id);
    setForm({
      roomTypeId: rule.roomTypeId || "",
      name: rule.name,
      ruleType: rule.ruleType,
      startDate: rule.startDate,
      endDate: rule.endDate,
      daysOfWeek: rule.daysOfWeek || "",
      multiplier: Number(rule.multiplier),
      priority: Number(rule.priority),
      note: rule.note || "",
      active: rule.active !== false,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  function toggleDay(day: string) {
    const next = new Set(selectedDays);
    if (next.has(day)) {
      next.delete(day);
    } else {
      next.add(day);
    }
    setForm((prev) => ({ ...prev, daysOfWeek: Array.from(next).join(",") }));
  }

  if (!canView) {
    return (
      <PermissionDenied message="Bạn không có quyền ROOM_RATE_RULE_VIEW để xem hệ số giá." />
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[1.5rem] border border-[#decdb9] bg-white/75 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-[#9b5c24] uppercase">
              Quản trị giá
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#17213a]">
              Hệ số giá phòng theo ngày
            </h2>
            <p className="mt-1 text-sm text-[#7c6f63]">
              Tạo rule như cuối tuần x1.1 hoặc ngày lễ x1.5. Rule có ưu tiên cao hơn sẽ
              được áp dụng trước.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={isActionBusy}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#decdb9] px-5 text-sm font-semibold text-[#5f5144]"
          >
            <RefreshCcw className="h-4 w-4" />
            Tải lại
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
        {canCreate || canUpdate ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.5rem] border border-[#decdb9] bg-white/80 p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#9b5c24] text-white">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#17213a]">
                  {editingId ? "Cập nhật rule giá" : "Thêm rule giá"}
                </h3>
                <p className="text-sm text-[#7c6f63]">
                  Để trống loại phòng nếu muốn áp dụng toàn hệ thống.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Field label="Tên rule">
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                  placeholder="Ví dụ: Cuối tuần, Lễ Quốc khánh"
                  className="h-11 w-full rounded-xl border border-[#decdb9] bg-white px-3 text-sm outline-none focus:border-[#9b5c24]"
                />
              </Field>

              <Field label="Loại phòng">
                <Select
                  value={form.roomTypeId || ""}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, roomTypeId: value }))
                  }
                  options={[
                    { value: "", label: "Tất cả loại phòng" },
                    ...roomTypes.map((roomType) => ({
                      value: roomType.id,
                      label: roomType.name,
                    })),
                  ]}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Loại rule">
                  <Select
                    value={form.ruleType}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        ruleType: value as RoomRateRuleType,
                      }))
                    }
                    options={[
                      { value: "WEEKEND", label: "Cuối tuần" },
                      { value: "HOLIDAY", label: "Ngày lễ" },
                      { value: "SEASON", label: "Mùa cao điểm" },
                      { value: "MANUAL", label: "Tùy chỉnh" },
                    ]}
                  />
                </Field>

                <Field label="Trạng thái">
                  <Select
                    value={form.active ? "true" : "false"}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        active: value === "true",
                      }))
                    }
                    options={[
                      { value: "true", label: "Đang áp dụng" },
                      { value: "false", label: "Tạm tắt" },
                    ]}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ngày bắt đầu">
                  <DatePicker
                    value={form.startDate}
                    onChange={(startDate) => setForm((prev) => ({ ...prev, startDate }))}
                    required
                  />
                </Field>
                <Field label="Ngày kết thúc">
                  <DatePicker
                    value={form.endDate}
                    onChange={(endDate) => setForm((prev) => ({ ...prev, endDate }))}
                    required
                  />
                </Field>
              </div>

              <Field label="Ngày trong tuần">
                <div className="flex flex-wrap gap-2">
                  {dayOptions.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`h-9 rounded-full border px-3 text-xs font-bold ${
                        selectedDays.has(day.value)
                          ? "border-[#9b5c24] bg-[#9b5c24] text-white"
                          : "border-[#decdb9] bg-white text-[#5f5144]"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[#7c6f63]">
                  Không chọn ngày nào thì rule áp dụng cho mọi ngày trong khoảng.
                </p>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Hệ số nhân">
                  <input
                    type="number"
                    min="0.1"
                    step="0.01"
                    value={form.multiplier}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        multiplier: Number(event.target.value),
                      }))
                    }
                    required
                    className="h-11 w-full rounded-xl border border-[#decdb9] bg-white px-3 text-sm outline-none focus:border-[#9b5c24]"
                  />
                </Field>
                <Field label="Ưu tiên">
                  <input
                    type="number"
                    value={form.priority}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        priority: Number(event.target.value),
                      }))
                    }
                    required
                    className="h-11 w-full rounded-xl border border-[#decdb9] bg-white px-3 text-sm outline-none focus:border-[#9b5c24]"
                  />
                </Field>
              </div>

              <Field label="Ghi chú">
                <textarea
                  value={form.note || ""}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, note: event.target.value }))
                  }
                  rows={3}
                  className="min-h-[88px] w-full resize-none rounded-xl border border-[#decdb9] bg-white px-3 py-2 text-sm outline-none focus:border-[#9b5c24]"
                />
              </Field>
            </div>

            {message ? (
              <ToastBridge success={message} onClearSuccess={() => setMessage(null)} />
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isActionBusy}
                  className="h-11 flex-1 rounded-full border border-[#decdb9] px-5 text-sm font-bold text-[#5f5144] disabled:opacity-60"
                >
                  Hủy sửa
                </button>
              ) : null}
              <button
                type="submit"
                disabled={isActionBusy}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#9b5c24] px-5 text-sm font-bold tracking-[0.12em] text-white uppercase disabled:opacity-60"
              >
                {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {isSaving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Thêm rule"}
              </button>
            </div>
          </form>
        ) : (
          <PermissionDenied message="Bạn không có quyền tạo hoặc sửa hệ số giá." />
        )}

        <div className="rounded-[1.5rem] border border-[#decdb9] bg-white/80 p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#decdb9] text-xs tracking-[0.14em] text-[#7c6f63] uppercase">
                  <th className="pb-3">Rule</th>
                  <th className="pb-3">Loại phòng</th>
                  <th className="pb-3">Khoảng ngày</th>
                  <th className="pb-3">Ngày áp dụng</th>
                  <th className="pb-3">H? s?</th>
                  <th className="pb-3">Trạng thái</th>
                  <th className="pb-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[#7c6f63]">
                      Đang tải...
                    </td>
                  </tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[#7c6f63]">
                      Chưa có rule giá.
                    </td>
                  </tr>
                ) : (
                  rules.map((rule) => (
                    <tr key={rule.id} className="border-b border-[#eee3d5] last:border-0">
                      <td className="py-4">
                        <button
                          type="button"
                          onClick={() => editRule(rule)}
                          className="text-left font-bold text-[#17213a] hover:text-[#9b5c24]"
                        >
                          {rule.name}
                        </button>
                        <p className="mt-1 text-xs text-[#7c6f63]">{rule.ruleType}</p>
                      </td>
                      <td className="py-4 text-[#17213a]">
                        {rule.roomTypeName || "Tất cả loại phòng"}
                      </td>
                      <td className="py-4 text-[#7c6f63]">
                        {formatDate(rule.startDate)} - {formatDate(rule.endDate)}
                      </td>
                      <td className="py-4 text-[#7c6f63]">
                        {formatDays(rule.daysOfWeek)}
                      </td>
                      <td className="py-4 font-bold text-[#9b5c24]">
                        x{Number(rule.multiplier).toFixed(2)}
                        <span className="ml-2 text-xs text-[#7c6f63]">
                          P{rule.priority}
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            rule.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-[#eee3d5] text-[#7c6f63]"
                          }`}
                        >
                          {rule.active ? "Đang áp dụng" : "Tạm tắt"}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => void handleDelete(rule.id)}
                            disabled={isActionBusy}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-red-200 px-3 text-xs font-bold text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Xóa
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-bold tracking-[0.14em] text-[#5f5144] uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDays(value?: string | null) {
  if (!value) return "Mọi ngày";
  const labels = new Map(dayOptions.map((day) => [day.value, day.label]));
  return value
    .split(",")
    .map((day) => labels.get(day) ?? day)
    .join(", ");
}
