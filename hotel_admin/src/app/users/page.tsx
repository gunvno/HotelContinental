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
import { TextField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  createStaffAccount,
  getPermissions,
  getStaffAccounts,
  type PermissionResponse,
  resetStaffPassword,
  type StaffAccountStatus,
  type StaffPermissionResponse,
  type StaffRoleName,
  updateStaffAccountStatus,
  updateStaffPermissions,
} from "@/services/permission-service";
import { useAuthStore } from "@/store/auth-store";

const staffRoleOptions: Array<{ value: StaffRoleName; label: string; desc: string }> = [
  { value: "ADMIN", label: "Admin", desc: "ToÃ n quyá»n há»‡ thá»‘ng" },
  { value: "MANAGER", label: "Manager", desc: "Quáº£n lÃ½ váº­n hÃ nh" },
  { value: "RECEPTIONIST", label: "Receptionist", desc: "Lá»… tÃ¢n" },
  {
    value: "CUSTOMER_SUPPORT",
    label: "Customer Support",
    desc: "ChÄƒm sÃ³c khÃ¡ch hÃ ng",
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
  { value: "ALL", label: "Táº¥t cáº£ tráº¡ng thÃ¡i" },
  { value: "ACTIVE", label: "Äang hoáº¡t Ä‘á»™ng" },
  { value: "UNACTIVE", label: "ÄÃ£ khÃ³a" },
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
        "KhÃ´ng thá»ƒ táº£i danh sÃ¡ch nhÃ¢n viÃªn hoáº·c quyá»n. Kiá»ƒm tra identity-service vÃ  quyá»n PERMISSION_MANAGE.",
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
        `ÄÃ£ cáº­p nháº­t quyá»n cho ${updated.fullName}. NhÃ¢n viÃªn cáº§n Ä‘Äƒng nháº­p láº¡i Ä‘á»ƒ token nháº­n quyá»n má»›i.`,
      );
    } catch {
      setMessage(
        "KhÃ´ng thá»ƒ lÆ°u quyá»n nhÃ¢n viÃªn. Kiá»ƒm tra quyá»n PERMISSION_MANAGE vÃ  dá»¯ liá»‡u quyá»n.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateAccount() {
    if (isActionBusy) return;
    if (!accountForm.username.trim() || !accountForm.password.trim()) {
      setMessage("Vui lÃ²ng nháº­p username vÃ  máº­t kháº©u.");
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
        `ÄÃ£ táº¡o tÃ i khoáº£n ${created.username} vá»›i role ${created.roleNames[0]}.`,
      );
      await loadData(created.accountId);
    } catch {
      setMessage(
        "KhÃ´ng thá»ƒ táº¡o tÃ i khoáº£n. Kiá»ƒm tra username/email Ä‘Ã£ tá»“n táº¡i hoáº·c quyá»n PERMISSION_MANAGE.",
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
          ? `ÄÃ£ má»Ÿ khÃ³a tÃ i khoáº£n ${updated.username}.`
          : `ÄÃ£ khÃ³a tÃ i khoáº£n ${updated.username}.`,
      );
    } catch {
      setMessage("KhÃ´ng thá»ƒ cáº­p nháº­t tráº¡ng thÃ¡i tÃ i khoáº£n.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    if (!selectedStaff || isActionBusy) return;
    if (!resetPasswordValue.trim()) {
      setMessage("Vui lÃ²ng nháº­p máº­t kháº©u má»›i.");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await resetStaffPassword(selectedStaff.accountId, resetPasswordValue);
      setResetPasswordValue("");
      setMessage(`ÄÃ£ reset máº­t kháº©u cho ${selectedStaff.username}.`);
    } catch {
      setMessage("KhÃ´ng thá»ƒ reset máº­t kháº©u tÃ i khoáº£n.");
    } finally {
      setSaving(false);
    }
  }

  if (!canManagePermissions) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        TÃ i khoáº£n hiá»‡n táº¡i khÃ´ng cÃ³ quyá»n PERMISSION_MANAGE Ä‘á»ƒ quáº£n lÃ½ phÃ¢n quyá»n nhÃ¢n
        viÃªn.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#decdb9] bg-white/85 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-[#9b5c24] uppercase">
              PhÃ¢n quyá»n
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17213a]">
              NhÃ¢n viÃªn & quyá»n chá»©c nÄƒng
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#7c6f63]">
              Táº¡o tÃ i khoáº£n ná»™i bá»™ vÃ  gÃ¡n role theo vá»‹ trÃ­. Quyá»n riÃªng á»Ÿ Ä‘Ã¢y sáº½ cá»™ng thÃªm
              cho tá»«ng nhÃ¢n viÃªn cá»¥ thá»ƒ.
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
              Táº¡o tÃ i khoáº£n
            </Button>
            <Button
              type="button"
              onClick={() => void loadData()}
              disabled={isActionBusy}
              className="gap-2"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Táº£i láº¡i
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
                Táº¡o tÃ i khoáº£n nhÃ¢n viÃªn
              </h3>
              <p className="text-sm text-[#7c6f63]">
                Chá»n role theo vá»‹ trÃ­ Ä‘á»ƒ há»‡ thá»‘ng tá»± gÃ¡n bá»™ quyá»n máº·c Ä‘á»‹nh.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setCreateOpen(false)}
              disabled={saving}
              variant="outline"
            >
              ÄÃ³ng
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Username"
              value={accountForm.username}
              onValueChange={(username) =>
                setAccountForm((prev) => ({ ...prev, username }))
              }
              placeholder="receptionist2"
            />
            <TextField
              label="Mật khẩu"
              type="password"
              value={accountForm.password}
              onValueChange={(password) =>
                setAccountForm((prev) => ({ ...prev, password }))
              }
              placeholder="Mật khẩu đăng nhập"
            />
            <TextField
              label="Email"
              value={accountForm.email}
              onValueChange={(email) => setAccountForm((prev) => ({ ...prev, email }))}
              placeholder="staff@hotelcontinental.local"
            />
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
            <TextField
              label="Tên"
              value={accountForm.firstName}
              onValueChange={(firstName) =>
                setAccountForm((prev) => ({ ...prev, firstName }))
              }
              placeholder="Front Desk"
            />
            <TextField
              label="Họ"
              value={accountForm.lastName}
              onValueChange={(lastName) =>
                setAccountForm((prev) => ({ ...prev, lastName }))
              }
              placeholder="Receptionist"
            />
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              onClick={() => void handleCreateAccount()}
              disabled={isActionBusy}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Táº¡o tÃ i khoáº£n
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard
          icon={<UserRound className="h-4 w-4" />}
          title="NhÃ¢n viÃªn"
          value={staffAccounts.length.toString()}
        />
        <InfoCard
          icon={<Shield className="h-4 w-4" />}
          title="Tá»•ng quyá»n"
          value={allPermissions.length.toString()}
        />
        <InfoCard
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Quyá»n riÃªng Ä‘ang chá»n"
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
              placeholder="TÃ¬m nhÃ¢n viÃªn..."
            />
          </div>

          <div className="mt-3 grid gap-2">
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
              options={[
                { value: "ALL", label: "Táº¥t cáº£ role" },
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
              <p className="py-8 text-center text-sm text-[#7c6f63]">Äang táº£i...</p>
            ) : null}
            {!loading && filteredStaff.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#7c6f63]">
                ChÆ°a cÃ³ nhÃ¢n viÃªn staff.
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
                  {staff.username} Â· {staff.email ?? "ChÆ°a cÃ³ email"}
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
              Chá»n má»™t nhÃ¢n viÃªn Ä‘á»ƒ phÃ¢n quyá»n.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#17213a]">
                    {selectedStaff.fullName}
                  </h3>
                  <p className="mt-1 text-sm text-[#7c6f63]">
                    {selectedStaff.username} Â· {selectedStaff.email ?? "ChÆ°a cÃ³ email"}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={isActionBusy}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  LÆ°u quyá»n riÃªng
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <div className="rounded-2xl border border-[#decdb9] bg-[#fbf6ed] p-4">
                  <p className="text-xs font-bold tracking-[0.14em] text-[#7c6f63] uppercase">
                    Tráº¡ng thÃ¡i tÃ i khoáº£n
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
                  {selectedStaff.accountStatus === "UNACTIVE" ? "Má»Ÿ khÃ³a" : "KhÃ³a"}
                </Button>
              </div>

              <div className="rounded-2xl border border-[#decdb9] bg-white p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                  <Field label="Reset máº­t kháº©u">
                    <Input
                      type="password"
                      value={resetPasswordValue}
                      onChange={(event) => setResetPasswordValue(event.target.value)}
                      placeholder="Nháº­p máº­t kháº©u má»›i"
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
                    <h4 className="font-bold text-[#17213a]">Role theo vá»‹ trÃ­</h4>
                    <p className="mt-1 text-sm text-[#7c6f63]">
                      Äá»•i role sáº½ thay bá»™ quyá»n máº·c Ä‘á»‹nh sau khi lÆ°u.
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
                title={`Quyá»n máº·c Ä‘á»‹nh tá»« role ${formatRoleName(selectedStaff.roleNames?.[0])}`}
                description="CÃ¡c quyá»n nÃ y Ä‘áº¿n tá»« cáº¥u hÃ¬nh role máº·c Ä‘á»‹nh, khÃ´ng chá»‰nh riÃªng táº¡i Ä‘Ã¢y."
                items={selectedStaff.rolePermissions}
                tone="muted"
              />

              <EditablePermissionGroup
                title="Quyá»n riÃªng Ä‘Ã£ gáº¯n cho nhÃ¢n viÃªn"
                description="CÃ¡c quyá»n nÃ y cá»™ng thÃªm vÃ o role khi nhÃ¢n viÃªn Ä‘Äƒng nháº­p."
                items={selectedDirectPermissions}
                checked
                disabled={isActionBusy}
                onToggle={togglePermission}
              />

              <EditablePermissionGroup
                title="Quyá»n chÆ°a Ä‘Æ°á»£c gáº¯n"
                description="Tick vÃ o quyá»n Ä‘á»ƒ thÃªm cho nhÃ¢n viÃªn nÃ y."
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
  return staffRoleOptions.find((role) => role.value === roleName)?.label ?? "ChÆ°a gÃ¡n";
}

function formatAccountStatus(status?: StaffAccountStatus) {
  return status === "UNACTIVE" ? "ÄÃ£ khÃ³a" : "Äang hoáº¡t Ä‘á»™ng";
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
          <span className="text-sm text-[#9f8a77]">KhÃ´ng cÃ³ quyá»n.</span>
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
          <span className="text-sm text-[#9f8a77]">KhÃ´ng cÃ³ quyá»n.</span>
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

