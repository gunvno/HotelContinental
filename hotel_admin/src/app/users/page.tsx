"use client";

import {
  Plus,
  RefreshCcw,
  Save,
  Search,
  Shield,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createStaffAccount,
  getPermissions,
  getStaffAccounts,
  resetStaffPassword,
  type StaffAccountStatus,
  type PermissionResponse,
  type StaffRoleName,
  type StaffPermissionResponse,
  updateStaffAccountStatus,
  updateStaffPermissions,
} from "@/services/permission-service";
import { useAuthStore } from "@/store/auth-store";

const staffRoleOptions: Array<{ value: StaffRoleName; label: string; desc: string }> = [
  { value: "ADMIN", label: "Admin", desc: "Toàn quyền hệ thống" },
  { value: "MANAGER", label: "Manager", desc: "Quản lý vận hành" },
  { value: "RECEPTIONIST", label: "Receptionist", desc: "Lễ tân" },
  {
    value: "CUSTOMER_SUPPORT",
    label: "Customer Support",
    desc: "Chăm sóc khách hàng",
  },
];

const initialAccountForm = {
  username: "",
  password: "",
  email: "",
  firstName: "",
  lastName: "",
  roleName: "RECEPTIONIST" as StaffRoleName,
};

const statusOptions: Array<{ value: StaffAccountStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "UNACTIVE", label: "Đã khóa" },
];

export default function UsersPage() {
  const permissions = useAuthStore((state) => state.permissions);
  const canManagePermissions = permissions.includes("PERMISSION_MANAGE");

  const [staffAccounts, setStaffAccounts] = useState<StaffPermissionResponse[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionResponse[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedRoleName, setSelectedRoleName] = useState<StaffRoleName>("RECEPTIONIST");
  const [selectedDirectPermissions, setSelectedDirectPermissions] = useState<string[]>(
    [],
  );
  const [accountForm, setAccountForm] = useState(initialAccountForm);
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<StaffRoleName | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<StaffAccountStatus | "ALL">("ALL");
  const [resetPasswordValue, setResetPasswordValue] = useState("");
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
    return staffAccounts.filter((staff) => {
      const matchesQuery =
        staff.fullName.toLowerCase().includes(normalizedQuery) ||
        staff.username.toLowerCase().includes(normalizedQuery) ||
        (staff.email ?? "").toLowerCase().includes(normalizedQuery);
      const matchesRole = roleFilter === "ALL" || staff.roleNames?.[0] === roleFilter;
      const matchesStatus =
        statusFilter === "ALL" || (staff.accountStatus ?? "ACTIVE") === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, staffAccounts, statusFilter]);

  const availableToAdd = useMemo(() => {
    if (!selectedStaff) return [];
    const blocked = new Set([
      ...selectedStaff.rolePermissions,
      ...selectedDirectPermissions,
    ]);
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
      const [permissionData, staffData] = await Promise.all([
        getPermissions(),
        getStaffAccounts(),
      ]);
      setAllPermissions(permissionData);
      setStaffAccounts(staffData);

      const nextId = nextSelectedId || selectedAccountId || staffData[0]?.accountId || "";
      setSelectedAccountId(nextId);
      const nextStaff =
        staffData.find((staff) => staff.accountId === nextId) ?? staffData[0] ?? null;
      setSelectedDirectPermissions(nextStaff?.directPermissions ?? []);
      setSelectedRoleName(nextStaff?.roleNames?.[0] ?? "RECEPTIONIST");
    } catch {
      setMessage(
        "Không thể tải danh sách nhân viên hoặc quyền. Kiểm tra identity-service và quyền PERMISSION_MANAGE.",
      );
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
    setSelectedRoleName(selectedStaff.roleNames?.[0] ?? "RECEPTIONIST");
    setResetPasswordValue("");
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
      const updated = await updateStaffPermissions(
        selectedStaff.accountId,
        selectedDirectPermissions,
        selectedRoleName,
      );
      setStaffAccounts((items) =>
        items.map((item) => (item.accountId === updated.accountId ? updated : item)),
      );
      setSelectedDirectPermissions(updated.directPermissions);
      setSelectedRoleName(updated.roleNames?.[0] ?? selectedRoleName);
      setMessage(
        `Đã cập nhật quyền cho ${updated.fullName}. Nhân viên cần đăng nhập lại để token nhận quyền mới.`,
      );
    } catch {
      setMessage(
        "Không thể lưu quyền nhân viên. Kiểm tra quyền PERMISSION_MANAGE và dữ liệu quyền.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateAccount() {
    if (isActionBusy) return;
    if (!accountForm.username.trim() || !accountForm.password.trim()) {
      setMessage("Vui lòng nhập username và mật khẩu.");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const created = await createStaffAccount({
        username: accountForm.username.trim(),
        password: accountForm.password,
        email: accountForm.email.trim() || undefined,
        firstName: accountForm.firstName.trim() || undefined,
        lastName: accountForm.lastName.trim() || undefined,
        roleName: accountForm.roleName,
      });
      setCreateOpen(false);
      setAccountForm(initialAccountForm);
      setMessage(
        `Đã tạo tài khoản ${created.username} với role ${created.roleNames[0]}.`,
      );
      await loadData(created.accountId);
    } catch {
      setMessage(
        "Không thể tạo tài khoản. Kiểm tra username/email đã tồn tại hoặc quyền PERMISSION_MANAGE.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus() {
    if (!selectedStaff || isActionBusy) return;
    const nextStatus: StaffAccountStatus =
      selectedStaff.accountStatus === "UNACTIVE" ? "ACTIVE" : "UNACTIVE";

    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateStaffAccountStatus(selectedStaff.accountId, nextStatus);
      setStaffAccounts((items) =>
        items.map((item) => (item.accountId === updated.accountId ? updated : item)),
      );
      setMessage(
        nextStatus === "ACTIVE"
          ? `Đã mở khóa tài khoản ${updated.username}.`
          : `Đã khóa tài khoản ${updated.username}.`,
      );
    } catch {
      setMessage("Không thể cập nhật trạng thái tài khoản.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    if (!selectedStaff || isActionBusy) return;
    if (!resetPasswordValue.trim()) {
      setMessage("Vui lòng nhập mật khẩu mới.");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await resetStaffPassword(selectedStaff.accountId, resetPasswordValue);
      setResetPasswordValue("");
      setMessage(`Đã reset mật khẩu cho ${selectedStaff.username}.`);
    } catch {
      setMessage("Không thể reset mật khẩu tài khoản.");
    } finally {
      setSaving(false);
    }
  }

  if (!canManagePermissions) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        Tài khoản hiện tại không có quyền PERMISSION_MANAGE để quản lý phân quyền nhân
        viên.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#decdb9] bg-white/85 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-[#9b5c24] uppercase">
              Phân quyền
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17213a]">
              Nhân viên & quyền chức năng
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#7c6f63]">
              Tạo tài khoản nội bộ và gán role theo vị trí. Quyền riêng ở đây sẽ cộng thêm
              cho từng nhân viên cụ thể.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={() => {
                setAccountForm(initialAccountForm);
                setCreateOpen(true);
              }}
              disabled={isActionBusy}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tạo tài khoản
            </Button>
            <Button
              type="button"
              onClick={() => void loadData()}
              disabled={isActionBusy}
              className="gap-2"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Tải lại
            </Button>
          </div>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl bg-[#fff6df] p-3 text-sm text-[#8a5724]">
          {message}
        </div>
      ) : null}

      {createOpen ? (
        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#17213a]">
                Tạo tài khoản nhân viên
              </h3>
              <p className="text-sm text-[#7c6f63]">
                Chọn role theo vị trí để hệ thống tự gán bộ quyền mặc định.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setCreateOpen(false)}
              disabled={saving}
              variant="outline"
            >
              Đóng
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Username">
              <Input
                value={accountForm.username}
                onChange={(event) =>
                  setAccountForm((prev) => ({
                    ...prev,
                    username: event.target.value,
                  }))
                }
                placeholder="receptionist2"
              />
            </Field>
            <Field label="Mật khẩu">
              <Input
                type="password"
                value={accountForm.password}
                onChange={(event) =>
                  setAccountForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                placeholder="Mật khẩu đăng nhập"
              />
            </Field>
            <Field label="Email">
              <Input
                value={accountForm.email}
                onChange={(event) =>
                  setAccountForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="staff@hotelcontinental.local"
              />
            </Field>
            <Field label="Role">
              <Select
                value={accountForm.roleName}
                onValueChange={(roleName) =>
                  setAccountForm((prev) => ({ ...prev, roleName }))
                }
                options={staffRoleOptions.map((role) => ({
                  value: role.value,
                  label: `${role.label} - ${role.desc}`,
                }))}
              />
            </Field>
            <Field label="Tên">
              <Input
                value={accountForm.firstName}
                onChange={(event) =>
                  setAccountForm((prev) => ({
                    ...prev,
                    firstName: event.target.value,
                  }))
                }
                placeholder="Front Desk"
              />
            </Field>
            <Field label="Họ">
              <Input
                value={accountForm.lastName}
                onChange={(event) =>
                  setAccountForm((prev) => ({
                    ...prev,
                    lastName: event.target.value,
                  }))
                }
                placeholder="Receptionist"
              />
            </Field>
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              onClick={() => void handleCreateAccount()}
              disabled={isActionBusy}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tạo tài khoản
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard
          icon={<UserRound className="h-4 w-4" />}
          title="Nhân viên"
          value={staffAccounts.length.toString()}
        />
        <InfoCard
          icon={<Shield className="h-4 w-4" />}
          title="Tổng quyền"
          value={allPermissions.length.toString()}
        />
        <InfoCard
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Quyền riêng đang chọn"
          value={selectedDirectPermissions.length.toString()}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-2xl border border-[#decdb9] bg-white/90 p-4 shadow-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9b5c24]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
              placeholder="Tìm nhân viên..."
            />
          </div>

          <div className="mt-3 grid gap-2">
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
              options={[
                { value: "ALL", label: "Tất cả role" },
                ...staffRoleOptions.map((role) => ({
                  value: role.value,
                  label: role.label,
                })),
              ]}
            />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={statusOptions}
            />
          </div>

          <div className="mt-4 space-y-2">
            {loading ? (
              <p className="py-8 text-center text-sm text-[#7c6f63]">Đang tải...</p>
            ) : null}
            {!loading && filteredStaff.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#7c6f63]">
                Chưa có nhân viên staff.
              </p>
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
                <span className="mt-1 block text-xs opacity-75">
                  {staff.username} · {staff.email ?? "Chưa có email"}
                </span>
                <span className="mt-2 inline-flex rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-bold text-[#8a5724]">
                  {formatRoleName(staff.roleNames?.[0])}
                </span>
                <span
                  className={`mt-2 ml-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    staff.accountStatus === "UNACTIVE"
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {formatAccountStatus(staff.accountStatus)}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
          {!selectedStaff ? (
            <p className="py-12 text-center text-sm text-[#7c6f63]">
              Chọn một nhân viên để phân quyền.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#17213a]">
                    {selectedStaff.fullName}
                  </h3>
                  <p className="mt-1 text-sm text-[#7c6f63]">
                    {selectedStaff.username} · {selectedStaff.email ?? "Chưa có email"}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={isActionBusy}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Lưu quyền riêng
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <div className="rounded-2xl border border-[#decdb9] bg-[#fbf6ed] p-4">
                  <p className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
                    Trạng thái tài khoản
                  </p>
                  <p
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                      selectedStaff.accountStatus === "UNACTIVE"
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {formatAccountStatus(selectedStaff.accountStatus)}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => void handleToggleStatus()}
                  disabled={isActionBusy}
                  variant="outline"
                  className={
                    selectedStaff.accountStatus === "UNACTIVE"
                      ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      : "border-red-200 text-red-700 hover:bg-red-50"
                  }
                >
                  {selectedStaff.accountStatus === "UNACTIVE" ? "Mở khóa" : "Khóa"}
                </Button>
              </div>

              <div className="rounded-2xl border border-[#decdb9] bg-white p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                  <Field label="Reset mật khẩu">
                    <Input
                      type="password"
                      value={resetPasswordValue}
                      onChange={(event) => setResetPasswordValue(event.target.value)}
                      placeholder="Nhập mật khẩu mới"
                    />
                  </Field>
                  <Button
                    type="button"
                    onClick={() => void handleResetPassword()}
                    disabled={isActionBusy || !resetPasswordValue.trim()}
                    variant="outline"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-[#decdb9] bg-[#fbf6ed] p-4">
                <div className="grid gap-4 md:grid-cols-[260px_1fr] md:items-center">
                  <div>
                    <h4 className="font-bold text-[#17213a]">Role theo vị trí</h4>
                    <p className="mt-1 text-sm text-[#7c6f63]">
                      Đổi role sẽ thay bộ quyền mặc định sau khi lưu.
                    </p>
                  </div>
                  <Select
                    value={selectedRoleName}
                    onValueChange={setSelectedRoleName}
                    disabled={isActionBusy}
                    options={staffRoleOptions.map((role) => ({
                      value: role.value,
                      label: `${role.label} - ${role.desc}`,
                    }))}
                  />
                </div>
              </div>

              <PermissionGroup
                title={`Quyền mặc định từ role ${formatRoleName(selectedStaff.roleNames?.[0])}`}
                description="Các quyền này đến từ cấu hình role mặc định, không chỉnh riêng tại đây."
                items={selectedStaff.rolePermissions}
                tone="muted"
              />

              <EditablePermissionGroup
                title="Quyền riêng đã gắn cho nhân viên"
                description="Các quyền này cộng thêm vào role khi nhân viên đăng nhập."
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

function formatRoleName(roleName?: StaffRoleName) {
  return staffRoleOptions.find((role) => role.value === roleName)?.label ?? "Chưa gán";
}

function formatAccountStatus(status?: StaffAccountStatus) {
  return status === "UNACTIVE" ? "Đã khóa" : "Đang hoạt động";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="block text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
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
        {items.length === 0 ? (
          <span className="text-sm text-[#9f8a77]">Không có quyền.</span>
        ) : null}
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-[#f4eadc] px-3 py-1 text-xs font-semibold text-[#5f5144]"
          >
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
        {items.length === 0 ? (
          <span className="text-sm text-[#9f8a77]">Không có quyền.</span>
        ) : null}
        {items.map((item) => (
          <label
            key={item}
            className={`flex items-center gap-2 rounded-xl border border-[#decdb9] bg-[#fbf6ed] px-3 py-2 text-sm font-semibold text-[#17213a] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
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
