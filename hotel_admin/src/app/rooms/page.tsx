"use client";

import { BedDouble, CheckCircle2, Hotel, Layers3, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { Pagination } from "@/components/ui/pagination";
import { usePermission } from "@/hooks/use-permission";
import { getRoomBookings, type RoomBookingResponse } from "@/services/booking-service";
import {
  type BuildingResponse,
  type FloorResponse,
  getAllRooms,
  getBuildings,
  getFloorsByBuilding,
  type RoomResponse,
} from "@/services/room-service";

const ROOM_PAGE_SIZE = 10;

type RoomScheduleKind = "FREE" | "BUSY_NOW" | "UPCOMING" | "MAINTENANCE";

type RoomSchedule = {
  kind: RoomScheduleKind;
  label: string;
  description: string;
};

export default function RoomsPage() {
  const router = useRouter();
  const permission = usePermission();
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [roomPage, setRoomPage] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [bookings, setBookings] = useState<RoomBookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roomSchedules = useMemo(() => buildRoomSchedules(rooms, bookings), [rooms, bookings]);
  const availableRooms = rooms.filter((room) => {
    const schedule = room.id ? roomSchedules[room.id] : null;
    return schedule?.kind === "FREE";
  }).length;
  const canCreateRoom = permission.has("ROOM_CREATE");
  const canOpenRoomDetail = permission.hasAny(
    "ROOM_UPDATE",
    "ROOM_IMAGE_UPDATE",
    "ROOM_IMAGE_DELETE",
  );

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
      const [roomResult, buildingResult, bookingResult] = await Promise.all([
        getAllRooms(pageIndex, ROOM_PAGE_SIZE),
        getBuildings(),
        getRoomBookings().catch(() => []),
      ]);
      const floorEntries = await Promise.all(
        buildingResult.map(
          async (building) =>
            [building.id, await getFloorsByBuilding(building.id)] as const,
        ),
      );

      setRooms(roomResult.data);
      setTotalRooms(roomResult.total);
      setBuildings(buildingResult);
      setFloors(floorEntries.flatMap(([, buildingFloors]) => buildingFloors));
      setBookings(bookingResult);
    } catch (loadError) {
      console.error(loadError);
      setError(
        "KhÃ´ng táº£i Ä‘Æ°á»£c dá»¯ liá»‡u phÃ²ng. Kiá»ƒm tra gateway, room-service vÃ  token ADMIN.",
      );
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
            <p className="text-xs font-black tracking-[0.32em] text-[#e8c990] uppercase">
              Room inventory
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-none font-bold tracking-tight lg:text-7xl">
              Kho phÃ²ng
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#eadbc4]">
              Trang nÃ y chá»‰ quáº£n lÃ½ phÃ²ng váº­t lÃ½. Muá»‘n thÃªm phÃ²ng má»›i thÃ¬ chuyá»ƒn sang
              trang táº¡o riÃªng Ä‘á»ƒ khÃ´ng lÃ m rá»‘i danh sÃ¡ch.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void loadRooms(roomPage)}
            className="border-white/15 bg-white/10 text-white hover:bg-white/15"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            LÃ m má»›i
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard
          icon={<Hotel className="h-5 w-5" />}
          label="TÃ²a nhÃ "
          value={String(buildings.length)}
        />
        <MetricCard
          icon={<Layers3 className="h-5 w-5" />}
          label="Táº§ng"
          value={String(floors.length)}
        />
        <MetricCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Sáºµn sÃ ng bÃ¡n"
          value={String(availableRooms)}
        />
        <MetricCard
          icon={<BedDouble className="h-5 w-5" />}
          label="Tá»•ng phÃ²ng"
          value={String(totalRooms)}
        />
      </section>

      {error ? <Alert>{error}</Alert> : null}

      <RoomTableView
        rooms={rooms}
        roomSchedules={roomSchedules}
        buildings={buildings}
        floors={floors}
        isLoading={isLoading}
        page={roomPage}
        total={totalRooms}
        canCreate={canCreateRoom}
        canOpenDetail={canOpenRoomDetail}
        onCreate={() => router.push("/rooms/create")}
        onPageChange={setRoomPage}
        onOpen={(roomId) => router.push(`/rooms/${roomId}`)}
      />
    </div>
  );
}

function RoomTableView({
  rooms,
  roomSchedules,
  buildings,
  floors,
  isLoading,
  page,
  total,
  canCreate,
  canOpenDetail,
  onCreate,
  onPageChange,
  onOpen,
}: {
  rooms: RoomResponse[];
  roomSchedules: Record<string, RoomSchedule>;
  buildings: BuildingResponse[];
  floors: FloorResponse[];
  isLoading: boolean;
  page: number;
  total: number;
  canCreate: boolean;
  canOpenDetail: boolean;
  onCreate: () => void;
  onPageChange: (page: number) => void;
  onOpen: (roomId: string) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / ROOM_PAGE_SIZE));

  if (isLoading) {
    return (
      <div className="rounded-[1.75rem] border border-[#decdb9] bg-white/72 p-10 text-center font-bold text-[#75695d]">
        Äang táº£i danh sÃ¡ch phÃ²ng...
      </div>
    );
  }

  return (
    <section className="rounded-[1.75rem] border border-[#decdb9] bg-white/78 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#eadfcd] px-6 py-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.28em] text-[#9b5c24] uppercase">
            Danh sÃ¡ch phÃ²ng
          </p>
          <h3 className="mt-2 font-serif text-3xl font-bold text-[#211a14]">
            PhÃ²ng váº­t lÃ½
          </h3>
          <p className="mt-1 text-sm text-[#75695d]">
            Hiá»ƒn thá»‹ {rooms.length} / {total} phÃ²ng. Báº¥m vÃ o má»™t dÃ²ng Ä‘á»ƒ xem chi tiáº¿t hoáº·c
            sá»­a áº£nh.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canCreate ? (
            <Button type="button" onClick={onCreate}>
              <Plus className="mr-2 h-4 w-4" />
              ThÃªm phÃ²ng
            </Button>
          ) : null}
          <div className="rounded-full border border-[#eadfcd] bg-[#fffaf2] px-4 py-2 text-sm font-black text-[#9b5c24]">
            Trang {page + 1} / {totalPages}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#eadfcd] text-xs tracking-[0.18em] text-[#9b8c7d] uppercase">
              <th className="px-6 py-4 font-black">PhÃ²ng</th>
              <th className="px-4 py-4 font-black">TÃ²a nhÃ </th>
              <th className="px-4 py-4 font-black">Táº§ng</th>
              <th className="px-4 py-4 font-black">Loáº¡i phÃ²ng</th>
              <th className="px-4 py-4 font-black">Diá»‡n tÃ­ch</th>
              <th className="px-4 py-4 font-black">GiÃ¡ ngÃ y</th>
              <th className="px-4 py-4 font-black">GiÃ¡ giá»</th>
              <th className="px-4 py-4 font-black">Lá»‹ch Ä‘áº·t</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-sm font-bold text-[#75695d]"
                >
                  ChÆ°a cÃ³ phÃ²ng. Báº¥m â€œThÃªm phÃ²ngâ€ Ä‘á»ƒ táº¡o phÃ²ng váº­t lÃ½ Ä‘áº§u tiÃªn.
                </td>
              </tr>
            ) : (
              rooms.map((room) => {
                const location = resolveRoomLocationParts(room, buildings, floors);
                const schedule = room.id ? roomSchedules[room.id] : freeSchedule();

                return (
                  <tr
                    key={room.id || room.name}
                    onClick={() => room.id && canOpenDetail && onOpen(room.id)}
                    className={`border-b border-[#f0e6d8] transition last:border-b-0 ${
                      canOpenDetail ? "cursor-pointer hover:bg-[#fff6e8]" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-11 place-items-center overflow-hidden rounded-2xl bg-[#eadfcd] text-[#9b5c24]">
                          {room.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={room.image}
                              alt={room.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <BedDouble className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-[#211a14]">{room.name}</p>
                          <p className="mt-1 line-clamp-1 max-w-[220px] text-xs text-[#75695d]">
                            {room.description || "ChÆ°a cÃ³ mÃ´ táº£"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#4d4035]">
                      {location.buildingName}
                    </td>
                    <td className="px-4 py-4 text-[#4d4035]">{location.floorName}</td>
                    <td className="px-4 py-4 font-semibold text-[#211a14]">
                      {room.roomTypes?.name || "ChÆ°a gÃ¡n"}
                    </td>
                    <td className="px-4 py-4 text-[#4d4035]">{room.roomSize || "-"}</td>
                    <td className="px-4 py-4 font-black text-[#9b5c24]">
                      {formatCurrency(room.pricePerDay)}
                    </td>
                    <td className="px-4 py-4 text-[#4d4035]">
                      {formatCurrency(room.pricePerHour)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getScheduleClassName(schedule.kind)}`}
                      >
                        {schedule.label}
                      </span>
                      <div className="mt-1 max-w-[220px] text-xs leading-5 text-[#75695d]">
                        {schedule.description}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={ROOM_PAGE_SIZE}
        total={total}
        itemLabel="phÃ²ng"
        onPageChange={onPageChange}
      />
    </section>
  );
}

function resolveRoomLocationParts(
  room: RoomResponse,
  buildings: BuildingResponse[],
  floors: FloorResponse[],
) {
  const floor = floors.find((item) => item.id === room.floorId);
  const building = buildings.find((item) => item.id === floor?.buildingId);

  return {
    buildingName: building?.name || "ChÆ°a gÃ¡n",
    floorName: floor ? `Táº§ng ${floor.floorNumber}` : "ChÆ°a gÃ¡n",
  };
}

function buildRoomSchedules(
  rooms: RoomResponse[],
  bookings: RoomBookingResponse[],
): Record<string, RoomSchedule> {
  const now = Date.now();

  return Object.fromEntries(
    rooms
      .filter((room): room is RoomResponse & { id: string } => Boolean(room.id))
      .map((room) => {
        if (room.status === "MAINTENANCE") {
          return [
            room.id,
            {
              kind: "MAINTENANCE",
              label: "Báº£o trÃ¬",
              description: "PhÃ²ng Ä‘ang báº£o trÃ¬, khÃ´ng má»Ÿ bÃ¡n theo má»i khung giá».",
            },
          ];
        }

        const activeBookings = bookings
          .filter((booking) => booking.roomId === room.id && isBlockingBooking(booking))
          .map((booking) => ({
            booking,
            checkin: new Date(booking.checkin ?? "").getTime(),
            checkout: new Date(booking.checkout ?? "").getTime(),
          }))
          .filter(
            (item) =>
              Number.isFinite(item.checkin) &&
              Number.isFinite(item.checkout) &&
              item.checkout > now,
          )
          .sort((left, right) => left.checkin - right.checkin);

        const current = activeBookings.find(
          (item) => item.checkin <= now && item.checkout > now,
        );
        if (current) {
          return [
            room.id,
            {
              kind: "BUSY_NOW",
              label: "Äang cÃ³ khÃ¡ch",
              description: `Äáº¿n ${formatDateTime(current.booking.checkout)}.`,
            },
          ];
        }

        const next = activeBookings[0];
        if (next) {
          return [
            room.id,
            {
              kind: "UPCOMING",
              label: "CÃ³ lá»‹ch sáº¯p tá»›i",
              description: `${formatDateTime(next.booking.checkin)} -> ${formatDateTime(
                next.booking.checkout,
              )}.`,
            },
          ];
        }

        return [room.id, freeSchedule()];
      }),
  );
}

function freeSchedule(): RoomSchedule {
  return {
    kind: "FREE",
    label: "Trá»‘ng theo lá»‹ch",
    description: "KhÃ´ng cÃ³ booking cháº·n á»Ÿ hiá»‡n táº¡i hoáº·c tÆ°Æ¡ng lai gáº§n.",
  };
}

function isBlockingBooking(booking: RoomBookingResponse) {
  if (booking.status === "CANCEL" || booking.status === "CANCEL_REQUESTED") {
    return false;
  }
  if (booking.detailStatus === "CANCELED" || booking.detailStatus === "NO_SHOW") {
    return false;
  }
  if (booking.status === "DONE" || booking.detailStatus === "CHECKED_OUT") {
    return false;
  }
  return booking.status === "DEPOSITED" || booking.detailStatus === "BOOKED" || booking.detailStatus === "CHECKED_IN";
}

function getScheduleClassName(kind: RoomScheduleKind) {
  switch (kind) {
    case "FREE":
      return "bg-emerald-50 text-emerald-700";
    case "BUSY_NOW":
      return "bg-blue-50 text-blue-700";
    case "UPCOMING":
      return "bg-amber-50 text-amber-700";
    case "MAINTENANCE":
      return "bg-red-50 text-red-700";
  }
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
      {children}
    </div>
  );
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
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

