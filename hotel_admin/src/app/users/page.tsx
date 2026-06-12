"use client";

import { RefreshCcw, Save, Search, Shield, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getPermissions,
  getStaffAccounts,
  updateStaffPermissions,
  type PermissionResponse,
  type StaffPermissionResponse,
} from "@/services/permission-service";
import { useAuthStore } from "@/store/auth-store";

export default function UsersPage() {
  const permissions = useAuthStore((state) => state.permissions);
  const canManagePermissions = permissions.includes("PERMISSION_MANAGE");

  const [staffAccounts, setStaffAccounts] = useState<StaffPermissionResponse[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionResponse[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedDirectPermissions, setSelectedDirectPermissions] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isActionBusy = loading || saving;

  const selectedStaff = useMemo(
    () => staffAccounts.find((staff) => staff.accountId === selectedAccountId) ?? null,
    [selectedAccountId, staffAccounts],
  );

  const filteredStaff = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return staffAccounts.filter((staff) =>
      staff.fullName.toLowerCase().includes(normalizedQuery) ||
      staff.username.toLowerCase().includes(normalizedQuery) ||
      (staff.email ?? "").toLowerCase().includes(normalizedQuery),
    );
  }, [query, staffAccounts]);

  const availableToAdd = useMemo(() => {
    if (!selectedStaff) return [];
    const blocked = new Set([...selectedStaff.rolePermissions, ...selectedDirectPermissions]);
    return allPermissions.filter((permission) => !blocked.has(permission.name));
  }, [allPermissions, selectedDirectPermissions, selectedStaff]);

  async function loadData(nextSelectedId?: string) {
    if (!canManagePermissions) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const [permissionData, staffData] = await Promise.all([getPermissions(), getStaffAccounts()]);
      setAllPermissions(permissionData);
      setStaffAccounts(staffData);

      const nextId = nextSelectedId || selectedAccountId || staffData[0]?.accountId || "";
      setSelectedAccountId(nextId);
      const nextStaff = staffData.find((staff) => staff.accountId === nextId) ?? staffData[0] ?? null;
      setSelectedDirectPermissions(nextStaff?.directPermissions ?? []);
    } catch {
      setMessage("Không thể tải danh sách nhân viên hoặc quyền. Kiểm tra identity-service và quyền PERMISSION_MANAGE.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [canManagePermissions]);

  useEffect(() => {
    if (!selectedStaff) return;
    setSelectedDirectPermissions(selectedStaff.directPermissions);
  }, [selectedStaff]);

  function togglePermission(permissionName: string) {
    if (isActionBusy) return;
    setSelectedDirectPermissions((items) =>
      items.includes(permissionName)
        ? items.filter((item) => item !== permissionName)
        : [...items, permissionName].sort(),
    );
  }

  async function handleSave() {
    if (!selectedStaff || isActionBusy) return;

    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateStaffPermissions(selectedStaff.accountId, selectedDirectPermissions);
      setStaffAccounts((items) => items.map((item) => (item.accountId === updated.accountId ? updated : item)));
      setSelectedDirectPermissions(updated.directPermissions);
      setMessage(`Đã cập nhật quyền cho ${updated.fullName}. Nhân viên cần đăng nhập lại để token nhận quyền mới.`);
    } catch {
      setMessage("Không thể lưu quyền nhân viên. Kiểm tra quyền PERMISSION_MANAGE và dữ liệu quyền.");
    } finally {
      setSaving(false);
    }
  }

  if (!canManagePermissions) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Tài khoản hiện tại không có quyền PERMISSION_MANAGE để quản lý phân quyền nhân viên.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#decdb9] bg-white/85 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#9b5c24]">Phân quyền</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17213a]">Nhân viên & quyền chức năng</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#7c6f63]">
              Role STAFF giữ quyền mặc định. Quyền gán riêng ở đây sẽ cộng thêm cho từng nhân viên cụ thể.
            </p>
          </div>
          <Button type="button" onClick={() => void loadData()} disabled={isActionBusy} className="gap-2">
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </Button>
        </div>
      </div>

      {message ? <div className="rounded-xl bg-[#fff6df] p-3 text-sm text-[#8a5724]">{message}</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard icon={<UserRound className="h-4 w-4" />} title="Nhân viên" value={staffAccounts.length.toString()} />
        <InfoCard icon={<Shield className="h-4 w-4" />} title="Tổng quyền" value={allPermissions.length.toString()} />
        <InfoCard icon={<ShieldCheck className="h-4 w-4" />} title="Quyền riêng đang chọn" value={selectedDirectPermissions.length.toString()} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-2xl border border-[#decdb9] bg-white/90 p-4 shadow-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b5c24]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
              placeholder="Tìm nhân viên..."
            />
          </div>

          <div className="mt-4 space-y-2">
            {loading ? <p className="py-8 text-center text-sm text-[#7c6f63]">Đang tải...</p> : null}
            {!loading && filteredStaff.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#7c6f63]">Chưa có nhân viên staff.</p>
            ) : null}
            {filteredStaff.map((staff) => (
              <button
                key={staff.accountId}
                type="button"
                onClick={() => setSelectedAccountId(staff.accountId)}
                disabled={saving}
                className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                  selectedAccountId === staff.accountId
                    ? "bg-[#9b5c24] text-white"
                    : "bg-[#fbf6ed] text-[#17213a] hover:bg-[#f4eadc]"
                }`}
              >
                <span className="block font-semibold">{staff.fullName}</span>
                <span className="mt-1 block text-xs opacity-75">{staff.username} · {staff.email ?? "Chưa có email"}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
          {!selectedStaff ? (
            <p className="py-12 text-center text-sm text-[#7c6f63]">Chọn một nhân viên để phân quyền.</p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#17213a]">{selectedStaff.fullName}</h3>
                  <p className="mt-1 text-sm text-[#7c6f63]">
                    {selectedStaff.username} · {selectedStaff.email ?? "Chưa có email"}
                  </p>
                </div>
                <Button type="button" onClick={() => void handleSave()} disabled={isActionBusy} className="gap-2">
                  <Save className="h-4 w-4" />
                  Lưu quyền riêng
                </Button>
              </div>

              <PermissionGroup
                title="Quyền mặc định từ role STAFF"
                description="Các quyền này đến từ YAML staff-permission, không chỉnh riêng tại đây."
                items={selectedStaff.rolePermissions}
                tone="muted"
              />

              <EditablePermissionGroup
                title="Quyền riêng đã gắn cho nhân viên"
                description="Các quyền này cộng thêm vào role STAFF khi nhân viên đăng nhập."
                items={selectedDirectPermissions}
                checked
                disabled={isActionBusy}
                onToggle={togglePermission}
              />

              <EditablePermissionGroup
                title="Quyền chưa được gắn"
                description="Tick vào quyền để thêm cho nhân viên này."
                items={availableToAdd.map((permission) => permission.name)}
                checked={false}
                disabled={isActionBusy}
                onToggle={togglePermission}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
      <div className="flex items-center justify-between text-[#7c6f63]">
        <span>{title}</span>
        {icon}
      </div>
      <div className="mt-3 text-2xl font-bold text-[#17213a]">{value}</div>
    </div>
  );
}

function PermissionGroup({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
  tone?: "muted";
}) {
  return (
    <div>
      <h4 className="font-bold text-[#17213a]">{title}</h4>
      <p className="mt-1 text-sm text-[#7c6f63]">{description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length === 0 ? <span className="text-sm text-[#9f8a77]">Không có quyền.</span> : null}
        {items.map((item) => (
          <span key={item} className="rounded-full bg-[#f4eadc] px-3 py-1 text-xs font-semibold text-[#5f5144]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function EditablePermissionGroup({
  title,
  description,
  items,
  checked,
  disabled = false,
  onToggle,
}: {
  title: string;
  description: string;
  items: string[];
  checked: boolean;
  disabled?: boolean;
  onToggle: (permissionName: string) => void;
}) {
  return (
    <div>
      <h4 className="font-bold text-[#17213a]">{title}</h4>
      <p className="mt-1 text-sm text-[#7c6f63]">{description}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 ? <span className="text-sm text-[#9f8a77]">Không có quyền.</span> : null}
        {items.map((item) => (
          <label key={item} className={`flex items-center gap-2 rounded-xl border border-[#decdb9] bg-[#fbf6ed] px-3 py-2 text-sm font-semibold text-[#17213a] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={() => onToggle(item)}
              className="h-4 w-4 accent-[#9b5c24]"
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
