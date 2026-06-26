"use client";

import { Plus, RefreshCcw, TicketPercent } from "lucide-react";
import { useEffect, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { ToastBridge } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import {
  createVoucher,
  type DiscountType,
  getVouchers,
  type VoucherResponse,
} from "@/services/promotion-service";

const initialForm = {
  name: "",
  description: "",
  code: "",
  discountType: "FIXED" as DiscountType,
  discountValue: 0,
  startDate: "",
  endDate: "",
};

export default function AdminVouchersPage() {
  const permission = usePermission();
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const currency = new Intl.NumberFormat("vi-VN");
  const canViewVouchers = permission.has("VOUCHER_VIEW");
  const canCreateVoucher = permission.has("VOUCHER_CREATE");
  const isActionBusy = isLoading || isSaving;

  async function loadVouchers() {
    if (isSaving) return;
    setIsLoading(true);
    setMessage(null);
    try {
      setVouchers(await getVouchers());
    } catch {
      setMessage("Không thể tải danh sách voucher.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadVouchers();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isActionBusy) return;
    setIsSaving(true);
    setMessage(null);

    try {
      await createVoucher({
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        startDate: toLocalDateTime(form.startDate),
        endDate: toLocalDateTime(form.endDate),
      });
      setForm(initialForm);
      setMessage("Đã tạo voucher.");
      await loadVouchers();
    } catch {
      setMessage(
        "Không thể tạo voucher. Kiểm tra mã trùng, ngày hiệu lực hoặc giá trị giảm.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!canViewVouchers) {
    return <PermissionDenied message="Bạn không có quyền VOUCHER_VIEW để xem voucher." />;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[1.5rem] border border-[#decdb9] bg-white/75 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-[#9b5c24] uppercase">
              Khuyến mãi
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#17213a]">Quản lý voucher</h2>
            <p className="mt-1 text-sm text-[#7c6f63]">
              Tạo mã giảm giá để khách nhập ở trang thanh toán. Mỗi mã chỉ dùng được một
              lần.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadVouchers()}
            disabled={isActionBusy}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#decdb9] px-5 text-sm font-semibold text-[#5f5144]"
          >
            <RefreshCcw className="h-4 w-4" />
            Tải lại
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        {canCreateVoucher ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.5rem] border border-[#decdb9] bg-white/80 p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#9b5c24] text-white">
                <TicketPercent className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#17213a]">Thêm voucher</h3>
                <p className="text-sm text-[#7c6f63]">Mã sẽ tự chuyển thành chữ hoa.</p>
              </div>
            </div>

            <div className="space-y-4">
              <Field label="Tên voucher">
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                  className="h-11 w-full rounded-xl border border-[#decdb9] bg-white px-3 text-sm outline-none focus:border-[#9b5c24]"
                />
              </Field>

              <Field label="Mã voucher">
                <input
                  value={form.code}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                  required
                  className="h-11 w-full rounded-xl border border-[#decdb9] bg-white px-3 text-sm outline-none focus:border-[#9b5c24]"
                />
              </Field>

              <Field label="Mô tả">
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#decdb9] bg-white px-3 py-2 text-sm outline-none focus:border-[#9b5c24]"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kiểu giảm">
                  <Select
                    value={form.discountType}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        discountType: value as DiscountType,
                      }))
                    }
                    options={[
                      { value: "FIXED", label: "Giảm tiền" },
                      { value: "PERCENT", label: "Giảm phần trăm" },
                    ]}
                  />
                </Field>
                <Field label={form.discountType === "PERCENT" ? "Phần trăm" : "Số tiền"}>
                  <input
                    type="number"
                    min={1}
                    max={form.discountType === "PERCENT" ? 100 : undefined}
                    value={form.discountValue || ""}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        discountValue: Number(event.target.value),
                      }))
                    }
                    required
                    className="h-11 w-full rounded-xl border border-[#decdb9] bg-white px-3 text-sm outline-none focus:border-[#9b5c24]"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Bắt đầu">
                  <DateTimePicker
                    value={form.startDate}
                    onChange={(startDate) => setForm((prev) => ({ ...prev, startDate }))}
                    required
                  />
                </Field>
                <Field label="Kết thúc">
                  <DateTimePicker
                    value={form.endDate}
                    onChange={(endDate) => setForm((prev) => ({ ...prev, endDate }))}
                    required
                  />
                </Field>
              </div>
            </div>

            {message ? (
              <ToastBridge success={message} onClearSuccess={() => setMessage(null)} />
            ) : null}

            <button
              type="submit"
              disabled={isActionBusy}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#9b5c24] px-5 text-sm font-bold tracking-[0.12em] text-white uppercase disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {isSaving ? "Đang lưu..." : "Thêm voucher"}
            </button>
          </form>
        ) : (
          <PermissionDenied message="Bạn không có quyền VOUCHER_CREATE để tạo voucher mới." />
        )}

        <div className="rounded-[1.5rem] border border-[#decdb9] bg-white/80 p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#decdb9] text-xs tracking-[0.14em] text-[#7c6f63] uppercase">
                  <th className="pb-3">Mã</th>
                  <th className="pb-3">Tên</th>
                  <th className="pb-3">Giảm</th>
                  <th className="pb-3">Hiệu lực</th>
                  <th className="pb-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#7c6f63]">
                      Đang tải...
                    </td>
                  </tr>
                ) : vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#7c6f63]">
                      Chưa có voucher.
                    </td>
                  </tr>
                ) : (
                  vouchers.map((voucher) => (
                    <tr
                      key={voucher.detailId}
                      className="border-b border-[#eee3d5] last:border-0"
                    >
                      <td className="py-4 font-bold text-[#17213a]">{voucher.code}</td>
                      <td className="py-4 text-[#17213a]">{voucher.name}</td>
                      <td className="py-4 text-[#9b5c24]">
                        {voucher.discountType === "PERCENT"
                          ? `${voucher.discountValue}%`
                          : `${currency.format(voucher.discountValue)}đ`}
                      </td>
                      <td className="py-4 text-[#7c6f63]">
                        {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                      </td>
                      <td className="py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${voucher.roomBookingId ? "bg-[#eee3d5] text-[#7c6f63]" : "bg-emerald-50 text-emerald-700"}`}
                        >
                          {voucher.roomBookingId ? "Đã dùng" : "Có thể dùng"}
                        </span>
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

function toLocalDateTime(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

function formatDate(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
