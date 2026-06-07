"use client";

import { BedDouble, CheckCircle2, Hotel, Layers3, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  type BuildingResponse,
  type FloorResponse,
  getAllRooms,
  getBuildings,
  getFloorsByBuilding,
  type RoomResponse,
} from "@/services/room-service";

const statusLabel: Record<string, string> = {
  AVAILABLE: "Sẵn sàng",
  OCCUPIED: "Đang ở",
  RESERVED: "Đã giữ",
  MAINTENANCE: "Bảo trì",
};

const ROOM_PAGE_SIZE = 10;

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [roomPage, setRoomPage] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availableRooms = rooms.filter((room) => room.status === "AVAILABLE").length;

  useEffect(() => {
    void loadRooms(roomPage);
  }, [roomPage]);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setError(null);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [error]);

  const loadRooms = async (pageIndex = roomPage) => {
    try {
      setIsLoading(true);
      setError(null);
      const [roomResult, buildingResult] = await Promise.all([getAllRooms(pageIndex, ROOM_PAGE_SIZE), getBuildings()]);
      const floorEntries = await Promise.all(
        buildingResult.map(async (building) => [building.id, await getFloorsByBuilding(building.id)] as const),
      );

      setRooms(roomResult.data);
      setTotalRooms(roomResult.total);
      setBuildings(buildingResult);
      setFloors(floorEntries.flatMap(([, buildingFloors]) => buildingFloors));
    } catch (loadError) {
      console.error(loadError);
      setError("Không tải được dữ liệu phòng. Kiểm tra gateway, room-service và token ADMIN.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#decdb9] bg-[#21170f] p-6 text-white shadow-[0_30px_80px_-52px_rgba(33,23,15,0.95)] lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(232,201,144,0.33),transparent_28%),radial-gradient(circle_at_88%_6%,rgba(255,255,255,0.12),transparent_24%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#e8c990]">Room inventory</p>
            <h2 className="mt-3 font-serif text-5xl font-bold leading-none tracking-tight lg:text-7xl">
              Kho phòng
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#eadbc4]">
              Trang này chỉ quản lý phòng vật lý. Muốn thêm phòng mới thì chuyển sang trang tạo riêng để không làm rối danh sách.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void loadRooms(roomPage)}
            className="border-white/15 bg-white/10 text-white hover:bg-white/15"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={<Hotel className="h-5 w-5" />} label="Tòa nhà" value={String(buildings.length)} />
        <MetricCard icon={<Layers3 className="h-5 w-5" />} label="Tầng" value={String(floors.length)} />
        <MetricCard icon={<CheckCircle2 className="h-5 w-5" />} label="Sẵn sàng bán" value={String(availableRooms)} />
        <MetricCard icon={<BedDouble className="h-5 w-5" />} label="Tổng phòng" value={String(totalRooms)} />
      </section>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <RoomTableView
        rooms={rooms}
        buildings={buildings}
        floors={floors}
        isLoading={isLoading}
        page={roomPage}
        total={totalRooms}
        onCreate={() => router.push("/rooms/create")}
        onPageChange={setRoomPage}
        onOpen={(roomId) => router.push(`/rooms/${roomId}`)}
      />
    </div>
  );
}

function RoomTableView({
  rooms,
  buildings,
  floors,
  isLoading,
  page,
  total,
  onCreate,
  onPageChange,
  onOpen,
}: {
  rooms: RoomResponse[];
  buildings: BuildingResponse[];
  floors: FloorResponse[];
  isLoading: boolean;
  page: number;
  total: number;
  onCreate: () => void;
  onPageChange: (page: number) => void;
  onOpen: (roomId: string) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / ROOM_PAGE_SIZE));

  if (isLoading) {
    return (
      <div className="rounded-[1.75rem] border border-[#decdb9] bg-white/72 p-10 text-center font-bold text-[#75695d]">
        Đang tải danh sách phòng...
      </div>
    );
  }

  return (
    <section className="rounded-[1.75rem] border border-[#decdb9] bg-white/78 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#eadfcd] px-6 py-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#9b5c24]">Danh sách phòng</p>
          <h3 className="mt-2 font-serif text-3xl font-bold text-[#211a14]">Phòng vật lý</h3>
          <p className="mt-1 text-sm text-[#75695d]">
            Hiển thị {rooms.length} / {total} phòng. Bấm vào một dòng để xem chi tiết hoặc sửa ảnh.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm phòng
          </Button>
          <div className="rounded-full border border-[#eadfcd] bg-[#fffaf2] px-4 py-2 text-sm font-black text-[#9b5c24]">
            Trang {page + 1} / {totalPages}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#eadfcd] text-xs uppercase tracking-[0.18em] text-[#9b8c7d]">
              <th className="px-6 py-4 font-black">Phòng</th>
              <th className="px-4 py-4 font-black">Tòa nhà</th>
              <th className="px-4 py-4 font-black">Tầng</th>
              <th className="px-4 py-4 font-black">Loại phòng</th>
              <th className="px-4 py-4 font-black">Diện tích</th>
              <th className="px-4 py-4 font-black">Giá ngày</th>
              <th className="px-4 py-4 font-black">Giá giờ</th>
              <th className="px-4 py-4 font-black">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm font-bold text-[#75695d]">
                  Chưa có phòng. Bấm “Thêm phòng” để tạo phòng vật lý đầu tiên.
                </td>
              </tr>
            ) : (
              rooms.map((room) => {
                const location = resolveRoomLocationParts(room, buildings, floors);

                return (
                  <tr
                    key={room.id || room.name}
                    onClick={() => room.id && onOpen(room.id)}
                    className="cursor-pointer border-b border-[#f0e6d8] transition last:border-b-0 hover:bg-[#fff6e8]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-11 place-items-center overflow-hidden rounded-2xl bg-[#eadfcd] text-[#9b5c24]">
                          {room.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={room.image} alt={room.name} className="size-full object-cover" />
                          ) : (
                            <BedDouble className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-[#211a14]">{room.name}</p>
                          <p className="mt-1 line-clamp-1 max-w-[220px] text-xs text-[#75695d]">{room.description || "Chưa có mô tả"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#4d4035]">{location.buildingName}</td>
                    <td className="px-4 py-4 text-[#4d4035]">{location.floorName}</td>
                    <td className="px-4 py-4 font-semibold text-[#211a14]">{room.roomTypes?.name || "Chưa gán"}</td>
                    <td className="px-4 py-4 text-[#4d4035]">{room.roomSize || "-"}</td>
                    <td className="px-4 py-4 font-black text-[#9b5c24]">{formatCurrency(room.pricePerDay)}</td>
                    <td className="px-4 py-4 text-[#4d4035]">{formatCurrency(room.pricePerHour)}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${getStatusClassName(room.status)}`}>
                        {statusLabel[room.status] || room.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={ROOM_PAGE_SIZE} total={total} itemLabel="phòng" onPageChange={onPageChange} />
    </section>
  );
}

function resolveRoomLocationParts(room: RoomResponse, buildings: BuildingResponse[], floors: FloorResponse[]) {
  const floor = floors.find((item) => item.id === room.floorId);
  const building = buildings.find((item) => item.id === floor?.buildingId);

  return {
    buildingName: building?.name || "Chưa gán",
    floorName: floor ? `Tầng ${floor.floorNumber}` : "Chưa gán",
  };
}

function getStatusClassName(status: string) {
  switch (status) {
    case "AVAILABLE":
      return "bg-emerald-50 text-emerald-700";
    case "OCCUPIED":
      return "bg-blue-50 text-blue-700";
    case "RESERVED":
      return "bg-amber-50 text-amber-700";
    case "MAINTENANCE":
      return "bg-red-50 text-red-700";
    default:
      return "bg-[#f3eadf] text-[#75695d]";
  }
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#decdb9] bg-white/72 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-[#75695d]">{label}</p>
        <div className="rounded-2xl bg-[#eadfcd] p-3 text-[#9b5c24]">{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight">{value}</p>
    </div>
  );
}

function Alert({ tone, children }: { tone: "error"; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
      {children}
    </div>
  );
}

function formatCurrency(value: number | string) {
  const numericValue = Number(value || 0);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "0 VND";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numericValue);
}
