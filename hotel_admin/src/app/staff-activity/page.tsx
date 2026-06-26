"use client";

import { Clock3, LogIn, LogOut, RefreshCcw, Search, UserCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuickFilter, type QuickFilterOption } from "@/components/ui/quick-filter";
import { ToastBridge } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import { formatDateTime } from "@/lib/format";
import {
  checkInStaffActivity,
  checkOutStaffActivity,
  getMyStaffActivitySessions,
  getStaffActivitySessions,
  type StaffActivitySessionResponse,
  type StaffActivityStatus,
} from "@/services/staff-activity-service";
import { useAuthStore } from "@/store/auth-store";

const statusOptions: QuickFilterOption<StaffActivityStatus | "ALL">[] = [
  { value: "ALL", label: "Tất cả", desc: "Mọi phiên làm việc" },
  { value: "ACTIVE", label: "Đang mở", desc: "Chưa đăng xuất" },
  { value: "COMPLETED", label: "Đã đóng", desc: "Đã đăng xuất" },
];

const roleOptions: QuickFilterOption<string>[] = [
  { value: "ALL", label: "Tất cả", desc: "Mọi vị trí" },
  { value: "ADMIN", label: "Admin", desc: "Quản trị" },
  { value: "MANAGER", label: "Manager", desc: "Quản lý" },
  { value: "RECEPTIONIST", label: "Lễ tân", desc: "Front desk" },
  { value: "CUSTOMER_SUPPORT", label: "CSKH", desc: "Hỗ trợ khách" },
  { value: "HOUSEKEEPING", label: "Lao công", desc: "Phục vụ phòng" },
];

export default function StaffActivityPage() {
  const permission = usePermission();
  const canViewAll = permission.has("STAFF_ACTIVITY_VIEW");
  const canCheck = permission.has("STAFF_ATTENDANCE_UPDATE");
  const userInfo = useAuthStore((state) => state.userInfo);

  const [items, setItems] = useState<StaffActivitySessionResponse[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StaffActivityStatus | "ALL">("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const currentUsername =
    userInfo?.preferred_username ||
    (typeof userInfo?.username === "string" ? userInfo.username : undefined) ||
    userInfo?.name;
  const latestMine = items.find(
    (item) => item.status === "ACTIVE" && (!currentUsername || item.username === currentUsername),
  );
  const checkedIn = Boolean(latestMine?.workCheckInTime && !latestMine.workCheckOutTime);

  async function loadData() {
    setLoading(true);
    setMessage(null);
    try {
      setItems(canViewAll ? await getStaffActivitySessions() : await getMyStaffActivitySessions());
    } catch {
      setMessage("Không tải được lịch sử nhân viên. Kiểm tra identity-service và quyền.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canViewAll && !canCheck) return;
    void loadData();
  }, [canViewAll, canCheck]);

  async function handleCheckIn() {
    if (!canCheck || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      await checkInStaffActivity();
      setMessage("Đã check-in ca làm việc.");
      await loadData();
    } catch {
      setMessage("Không thể check-in ca làm việc.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckOut() {
    if (!canCheck || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      await checkOutStaffActivity();
      setMessage("Đã check-out ca làm việc.");
      await loadData();
    } catch {
      setMessage("Không thể check-out ca làm việc.");
    } finally {
      setBusy(false);
    }
  }

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (roleFilter !== "ALL" && item.primaryRole !== roleFilter) return false;
      if (!normalized) return true;
      return `${item.username} ${item.fullName ?? ""} ${item.primaryRole ?? ""}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [items, query, roleFilter, statusFilter]);

  if (!canViewAll && !canCheck) {
    return (
      <PermissionDenied message="Bạn không có quyền STAFF_ACTIVITY_VIEW hoặc STAFF_ATTENDANCE_UPDATE để mở lịch sử nhân viên." />
    );
  }

  return (
    <div className="space-y-6">
      {message ? (
        <ToastBridge success={message} onClearSuccess={() => setMessage(null)} />
      ) : null}

      <section className="rounded-2xl border border-[#decdb9] bg-white/85 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-[#9b5c24] uppercase">
              ERP nhân sự
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17213a]">
              Lịch sử đăng nhập và chấm công
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#7c6f63]">
              Theo dõi phiên đăng nhập, check-in/check-out ca làm việc để quản lý
              nhân viên trong mô hình một khách sạn.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canCheck ? (
              <>
                <Button
                  type="button"
                  onClick={() => void handleCheckIn()}
                  disabled={busy || checkedIn}
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Check-in ca
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleCheckOut()}
                  disabled={busy || !checkedIn}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Check-out ca
                </Button>
              </>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadData()}
              disabled={loading || busy}
              className="gap-2"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Tải lại
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9b5c24] text-white">
              <UserCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold text-[#17213a]">Bộ lọc</h3>
              <p className="text-sm text-[#7c6f63]">Lọc theo nhân viên hoặc trạng thái phiên.</p>
            </div>
          </div>

          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9b5c24]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm nhân viên, role..."
              className="pl-10"
            />
          </label>

          <QuickFilter
            title="Trạng thái"
            value={statusFilter}
            options={statusOptions}
            onChange={setStatusFilter}
            columnsClassName="grid-cols-1"
          />
          <QuickFilter
            title="Role"
            value={roleFilter}
            options={roleOptions}
            onChange={setRoleFilter}
            columnsClassName="sm:grid-cols-2"
          />

          <div className="rounded-2xl bg-[#fbf5ed] p-4 text-sm text-[#6f5f50]">
            <p>
              Phiên hiển thị: <b>{filteredItems.length}</b>
            </p>
            <p>
              Đang mở: <b>{items.filter((item) => item.status === "ACTIVE").length}</b>
            </p>
          </div>
        </aside>

        <section className="overflow-hidden rounded-2xl border border-[#decdb9] bg-white/90 shadow-sm">
          <div className="border-b border-[#ead8c4] bg-[#fbf5ed] px-5 py-4">
            <h3 className="font-bold text-[#17213a]">Lịch sử gần nhất</h3>
            <p className="mt-1 text-sm text-[#7c6f63]">
              Admin/manager xem toàn bộ; nhân viên dùng nút check-in/check-out ca.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="text-xs tracking-[0.14em] text-[#6f5f50] uppercase">
                <tr>
                  <th className="px-5 py-3">Nhân viên</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Đăng nhập</th>
                  <th className="px-5 py-3">Đăng xuất</th>
                  <th className="px-5 py-3">Check-in ca</th>
                  <th className="px-5 py-3">Check-out ca</th>
                  <th className="px-5 py-3">Thời gian</th>
                  <th className="px-5 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-[#7c6f63]">
                      Đang tải lịch sử...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-[#7c6f63]">
                      Chưa có dữ liệu phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="border-t border-[#ead8c4]">
                      <td className="px-5 py-4">
                        <p className="font-bold text-[#17213a]">
                          {item.fullName || item.username}
                        </p>
                        <p className="mt-1 text-xs text-[#7c6f63]">{item.username}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#6f5f50]">
                        {formatRole(item.primaryRole)}
                      </td>
                      <td className="px-5 py-4">{formatDateTime(item.loginTime)}</td>
                      <td className="px-5 py-4">{formatDateTime(item.logoutTime)}</td>
                      <td className="px-5 py-4">{formatDateTime(item.workCheckInTime)}</td>
                      <td className="px-5 py-4">{formatDateTime(item.workCheckOutTime)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-[#6f5f50]">
                          <Clock3 className="h-4 w-4 text-[#9b5c24]" />
                          <span>
                            Login {formatMinutes(item.loginDurationMinutes)} / Ca{" "}
                            {formatMinutes(item.workDurationMinutes)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            item.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.status === "ACTIVE" ? "Đang mở" : "Đã đóng"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  );
}

function formatMinutes(value?: number) {
  if (value == null) return "-";
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  if (hours <= 0) return `${minutes} phút`;
  return `${hours} giờ ${minutes} phút`;
}

function formatRole(role?: string) {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "MANAGER":
      return "Manager";
    case "RECEPTIONIST":
      return "Lễ tân";
    case "CUSTOMER_SUPPORT":
      return "CSKH";
    case "HOUSEKEEPING":
      return "Lao công";
    default:
      return role || "-";
  }
}
