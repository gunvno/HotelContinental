"use client";

import {
  Brush,
  CheckCircle2,
  ClipboardCheck,
  RefreshCcw,
  Search,
  UserCheck,
  Wrench,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuickFilter, type QuickFilterOption } from "@/components/ui/quick-filter";
import { Select } from "@/components/ui/select";
import { ToastBridge } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import { formatDateTime } from "@/lib/format";
import {
  assignRoomHousekeepingTask,
  completeRoomHousekeepingTask,
  getAllRooms,
  updateRoomHousekeepingStatus,
  type HousekeepingStatus,
  type RoomResponse,
} from "@/services/room-service";
import {
  getStaffActivitySessions,
  type StaffActivitySessionResponse,
} from "@/services/staff-activity-service";
import { selectUserName, useAuthStore } from "@/store/auth-store";

const housekeepingOptions: QuickFilterOption<HousekeepingStatus | "ALL">[] = [
  { value: "ALL", label: "Tất cả", desc: "Mọi trạng thái" },
  { value: "DIRTY", label: "Cần dọn", desc: "Ưu tiên xử lý" },
  { value: "CLEANING", label: "Đang dọn", desc: "Đang xử lý" },
  { value: "INSPECTION", label: "Chờ kiểm tra", desc: "Cần xác nhận" },
  { value: "CLEAN", label: "Đã sạch", desc: "Sẵn sàng bán" },
  { value: "MAINTENANCE", label: "Bảo trì", desc: "Có sự cố" },
];

export default function HousekeepingPage() {
  const permission = usePermission();
  const currentUsername = useAuthStore(selectUserName);
  const isCoordinator = permission.has("ROLE_MANAGER");
  const isHousekeeping = permission.has("ROLE_HOUSEKEEPING");
  const canOpen = isCoordinator || isHousekeeping;

  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [staffSessions, setStaffSessions] = useState<StaffActivitySessionResponse[]>([]);
  const [assignmentByRoom, setAssignmentByRoom] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<HousekeepingStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onlineHousekeepers = useMemo(
    () =>
      staffSessions
        .filter((session) => session.status === "ACTIVE" && session.primaryRole === "HOUSEKEEPING")
        .filter(
          (session, index, all) =>
            all.findIndex((item) => item.username === session.username) === index,
        ),
    [staffSessions],
  );

  async function loadData() {
    if (!canOpen) return;
    setLoading(true);
    setMessage(null);
    try {
      const [roomData, staffData] = await Promise.all([
        getAllRooms(0, 500),
        isCoordinator ? getStaffActivitySessions().catch(() => []) : Promise.resolve([]),
      ]);
      setRooms(roomData.data);
      setStaffSessions(staffData);
    } catch {
      setMessage("Không tải được danh sách phòng cần dọn. Kiểm tra room-service, identity-service và quyền.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [canOpen, isCoordinator]);

  async function updateHousekeeping(room: RoomResponse, housekeepingStatus: HousekeepingStatus) {
    if (!room.id || actionId) return;
    setActionId(room.id);
    setMessage(null);
    try {
      const updated = await updateRoomHousekeepingStatus(room.id, {
        housekeepingStatus,
        note: defaultNote(housekeepingStatus),
      });
      setRooms((current) =>
        current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
      setMessage(`Đã cập nhật phòng ${room.name} sang ${housekeepingLabel(housekeepingStatus)}.`);
    } catch {
      setMessage("Không thể cập nhật trạng thái dọn phòng.");
    } finally {
      setActionId(null);
    }
  }

  async function assignHousekeeping(room: RoomResponse, assigneeUsername?: string) {
    if (!room.id || actionId) return;
    if (isCoordinator && !assigneeUsername) {
      setMessage("Hãy chọn nhân viên dọn phòng đang online để phân công.");
      return;
    }

    setActionId(room.id);
    setMessage(null);
    try {
      const updated = await assignRoomHousekeepingTask(room.id, assigneeUsername);
      setRooms((current) =>
        current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
      setMessage(
        assigneeUsername
          ? `Đã phân công phòng ${room.name} cho ${assigneeUsername}.`
          : `Đã nhận việc dọn phòng ${room.name}.`,
      );
    } catch {
      setMessage(assigneeUsername ? "Không thể phân công phòng." : "Không thể nhận việc dọn phòng.");
    } finally {
      setActionId(null);
    }
  }

  async function completeHousekeeping(room: RoomResponse) {
    if (!room.id || actionId) return;
    setActionId(room.id);
    setMessage(null);
    try {
      const updated = await completeRoomHousekeepingTask(room.id);
      setRooms((current) =>
        current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
      setMessage(`Đã hoàn thành dọn phòng ${room.name}, chờ quản lý kiểm tra.`);
    } catch {
      setMessage("Không thể hoàn thành việc dọn phòng.");
    } finally {
      setActionId(null);
    }
  }

  const filteredRooms = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rooms.filter((room) => {
      const housekeepingStatus = room.housekeepingStatus ?? "CLEAN";
      if (statusFilter !== "ALL" && housekeepingStatus !== statusFilter) return false;
      if (isHousekeeping && !isCoordinator) {
        const assignedToMe = room.housekeepingAssignedTo === currentUsername;
        const availableTask = !room.housekeepingAssignedTo && housekeepingStatus !== "CLEAN";
        if (!assignedToMe && !availableTask) return false;
      }
      if (!normalized) return true;
      return `${room.name} ${room.roomTypes?.name ?? ""} ${roomStatusLabel(room.status)} ${housekeepingLabel(housekeepingStatus)}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [currentUsername, isCoordinator, isHousekeeping, query, rooms, statusFilter]);

  const dirtyCount = rooms.filter((room) => (room.housekeepingStatus ?? "CLEAN") === "DIRTY").length;
  const cleaningCount = rooms.filter((room) => room.housekeepingStatus === "CLEANING").length;
  const cleanCount = rooms.filter((room) => (room.housekeepingStatus ?? "CLEAN") === "CLEAN").length;

  if (!canOpen) {
    return (
      <PermissionDenied message="Trang dọn phòng chỉ dành cho quản lý điều phối và nhân viên dọn phòng." />
    );
  }

  return (
    <div className="space-y-6">
      {message ? <ToastBridge success={message} onClearSuccess={() => setMessage(null)} /> : null}

      <section className="rounded-2xl border border-[#decdb9] bg-white/85 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-[#9b5c24] uppercase">
              Dọn phòng
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17213a]">
              Phân công và kiểm tra phòng
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#7c6f63]">
              Quản lý phân công phòng cho nhân viên đang online; nhân viên dọn xong thì chuyển
              sang chờ kiểm tra.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadData()}
            disabled={loading || Boolean(actionId)}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Tải lại
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <HousekeepingMetric label="Cần dọn" value={dirtyCount} tone="bg-amber-50 text-amber-700" />
        <HousekeepingMetric label="Đang dọn" value={cleaningCount} tone="bg-sky-50 text-sky-700" />
        <HousekeepingMetric label="Đã sạch" value={cleanCount} tone="bg-emerald-50 text-emerald-700" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9b5c24] text-white">
              <Brush className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold text-[#17213a]">Bộ lọc</h3>
              <p className="text-sm text-[#7c6f63]">Lọc nhanh phòng theo trạng thái dọn.</p>
            </div>
          </div>

          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9b5c24]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm phòng, loại phòng..."
              className="pl-10"
            />
          </label>

          <QuickFilter
            title="Trạng thái dọn"
            value={statusFilter}
            options={housekeepingOptions}
            onChange={setStatusFilter}
            columnsClassName="sm:grid-cols-2"
          />

          {isCoordinator ? (
            <div className="rounded-2xl bg-[#fbf5ed] p-4 text-sm text-[#6f5f50]">
              <p className="font-bold text-[#17213a]">Nhân viên dọn phòng online</p>
              <p className="mt-1">{onlineHousekeepers.length} người có thể nhận việc.</p>
            </div>
          ) : null}
        </aside>

        <section className="rounded-2xl border border-[#decdb9] bg-white/90 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-[#17213a]">Danh sách phòng</h3>
              <p className="mt-1 text-sm text-[#7c6f63]">
                Sau checkout, phòng tự chuyển sang Cần dọn.
              </p>
            </div>
            <span className="rounded-full bg-[#fbf5ed] px-3 py-1 text-sm font-bold text-[#8a5724]">
              {filteredRooms.length} phòng
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {loading ? (
              <div className="col-span-full rounded-2xl border border-[#ead8c4] p-10 text-center text-[#7c6f63]">
                Đang tải danh sách phòng...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-[#ead8c4] p-10 text-center text-[#7c6f63]">
                Không có phòng phù hợp bộ lọc.
              </div>
            ) : (
              filteredRooms.map((room) => (
                <RoomHousekeepingCard
                  key={room.id}
                  room={room}
                  busy={actionId === room.id}
                  isCoordinator={isCoordinator}
                  isHousekeeping={isHousekeeping}
                  currentUsername={currentUsername}
                  selectedAssignee={assignmentByRoom[room.id ?? ""] ?? ""}
                  onlineHousekeepers={onlineHousekeepers}
                  onAssigneeChange={(value) =>
                    setAssignmentByRoom((current) => ({ ...current, [room.id ?? ""]: value }))
                  }
                  onUpdate={(status) => void updateHousekeeping(room, status)}
                  onAssign={(assigneeUsername) => void assignHousekeeping(room, assigneeUsername)}
                  onComplete={() => void completeHousekeeping(room)}
                />
              ))
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

function RoomHousekeepingCard({
  room,
  busy,
  isCoordinator,
  isHousekeeping,
  currentUsername,
  selectedAssignee,
  onlineHousekeepers,
  onAssigneeChange,
  onUpdate,
  onAssign,
  onComplete,
}: {
  room: RoomResponse;
  busy: boolean;
  isCoordinator: boolean;
  isHousekeeping: boolean;
  currentUsername: string | null;
  selectedAssignee: string;
  onlineHousekeepers: StaffActivitySessionResponse[];
  onAssigneeChange: (value: string) => void;
  onUpdate: (status: HousekeepingStatus) => void;
  onAssign: (assigneeUsername?: string) => void;
  onComplete: () => void;
}) {
  const status = room.housekeepingStatus ?? "CLEAN";
  const assignedToMe = room.housekeepingAssignedTo === currentUsername;
  const canSelfAssign = isHousekeeping && !room.housekeepingAssignedTo && status !== "CLEAN";
  const canComplete = isHousekeeping && (assignedToMe || !room.housekeepingAssignedTo) && status === "CLEANING";

  return (
    <article className="rounded-2xl border border-[#ead8c4] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-black text-[#17213a]">{room.name}</p>
          <p className="mt-1 text-sm text-[#7c6f63]">
            {room.roomTypes?.name ?? "Chưa rõ loại phòng"} - {roomStatusLabel(room.status)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${housekeepingTone(status)}`}>
          {housekeepingLabel(status)}
        </span>
      </div>

      <div className="mt-4 rounded-2xl bg-[#fbf5ed] p-3 text-sm text-[#6f5f50]">
        <p>{room.housekeepingNote || "Chưa có ghi chú dọn phòng."}</p>
        <p className="mt-2 text-xs font-semibold">
          Cập nhật: {formatDateTime(room.housekeepingUpdatedTime)}{" "}
          {room.housekeepingUpdatedBy ? `bởi ${room.housekeepingUpdatedBy}` : ""}
        </p>
        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
          <p>
            <span className="font-bold">Phân công:</span>{" "}
            {room.housekeepingAssignedTo
              ? `${room.housekeepingAssignedTo} - ${formatDateTime(room.housekeepingAssignedTime)}`
              : "Chưa có"}
          </p>
          <p>
            <span className="font-bold">Hoàn thành:</span>{" "}
            {room.housekeepingCompletedBy
              ? `${room.housekeepingCompletedBy} - ${formatDateTime(room.housekeepingCompletedTime)}`
              : "Chưa có"}
          </p>
        </div>
      </div>

      {isCoordinator ? (
        <div className="mt-4 space-y-3">
          <Select
            value={selectedAssignee}
            onValueChange={onAssigneeChange}
            placeholder="Chọn nhân viên online"
            disabled={busy || onlineHousekeepers.length === 0 || status === "CLEAN"}
            options={[
              { value: "", label: "-- Chọn nhân viên --" },
              ...onlineHousekeepers.map((staff) => ({
                value: staff.username,
                label: `${staff.fullName || staff.username} (${staff.username})`,
              })),
            ]}
          />
          <div className="grid gap-2 sm:grid-cols-3">
            <ActionButton
              disabled={busy || !selectedAssignee || status === "CLEAN"}
              onClick={() => onAssign(selectedAssignee)}
              icon={<UserCheck className="h-4 w-4" />}
              label="Phân công"
            />
            <ActionButton
              disabled={busy || status === "CLEAN"}
              onClick={() => onUpdate("CLEAN")}
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Đã sạch"
            />
            <ActionButton
              disabled={busy || status === "MAINTENANCE"}
              onClick={() => onUpdate("MAINTENANCE")}
              icon={<Wrench className="h-4 w-4" />}
              label="Bảo trì"
            />
          </div>
        </div>
      ) : null}

      {!isCoordinator && isHousekeeping ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <ActionButton
            disabled={busy || !canSelfAssign}
            onClick={() => onAssign()}
            icon={<UserCheck className="h-4 w-4" />}
            label="Nhận việc"
          />
          <ActionButton
            disabled={busy || !canComplete}
            onClick={onComplete}
            icon={<ClipboardCheck className="h-4 w-4" />}
            label="Hoàn thành"
          />
        </div>
      ) : null}
    </article>
  );
}

function ActionButton({
  disabled,
  onClick,
  icon,
  label,
}: {
  disabled: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#decdb9] bg-white px-3 text-xs font-bold text-[#17213a] transition hover:border-[#9b5c24] hover:text-[#9b5c24] disabled:cursor-not-allowed disabled:opacity-45"
    >
      {icon}
      {label}
    </button>
  );
}

function HousekeepingMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className={`rounded-2xl border border-[#decdb9] p-5 shadow-sm ${tone}`}>
      <p className="text-sm font-bold">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function housekeepingLabel(status: HousekeepingStatus) {
  switch (status) {
    case "DIRTY":
      return "Cần dọn";
    case "CLEANING":
      return "Đang dọn";
    case "INSPECTION":
      return "Chờ kiểm tra";
    case "MAINTENANCE":
      return "Bảo trì";
    default:
      return "Đã sạch";
  }
}

function housekeepingTone(status: HousekeepingStatus) {
  switch (status) {
    case "DIRTY":
      return "bg-amber-50 text-amber-700";
    case "CLEANING":
      return "bg-sky-50 text-sky-700";
    case "INSPECTION":
      return "bg-violet-50 text-violet-700";
    case "MAINTENANCE":
      return "bg-red-50 text-red-700";
    default:
      return "bg-emerald-50 text-emerald-700";
  }
}

function defaultNote(status: HousekeepingStatus) {
  switch (status) {
    case "DIRTY":
      return "Phòng cần dọn.";
    case "CLEANING":
      return "Nhân viên đã bắt đầu dọn phòng.";
    case "INSPECTION":
      return "Phòng đã dọn xong, chờ kiểm tra.";
    case "MAINTENANCE":
      return "Phòng có sự cố, cần bảo trì.";
    default:
      return "Phòng đã sạch và sẵn sàng.";
  }
}

function roomStatusLabel(status?: RoomResponse["status"]) {
  switch (status) {
    case "OCCUPIED":
      return "Đang ở";
    case "RESERVED":
      return "Đã đặt";
    case "MAINTENANCE":
      return "Bảo trì";
    case "AVAILABLE":
      return "Sẵn sàng";
    default:
      return "Chưa rõ trạng thái";
  }
}
