"use client";

import { Building2, Layers3, Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePermission } from "@/hooks/use-permission";
import {
  type BuildingResponse,
  type FloorResponse,
  getBuildings,
  getFloorsByBuilding,
  getRoomTypes,
  type RoomTypeResponse,
  setupBuilding,
} from "@/services/room-service";

type SetupFormState = {
  buildingName: string;
  description: string;
  address: string;
  floorStart: string;
  floorEnd: string;
  roomsPerFloor: string;
  roomNumberPattern: string;
  defaultRoomTypeId: string;
  defaultPricePerDay: string;
  defaultPricePerHour: string;
  defaultRoomSize: string;
  skipRoomNumbers: string;
};

const defaultFormState: SetupFormState = {
  buildingName: "",
  description: "",
  address: "",
  floorStart: "1",
  floorEnd: "5",
  roomsPerFloor: "10",
  roomNumberPattern: "{floor}{room:02}",
  defaultRoomTypeId: "",
  defaultPricePerDay: "",
  defaultPricePerHour: "",
  defaultRoomSize: "32m2",
  skipRoomNumbers: "",
};

export default function BuildingsPage() {
  const permission = usePermission();
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [floorsByBuilding, setFloorsByBuilding] = useState<
    Record<string, FloorResponse[]>
  >({});
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [form, setForm] = useState<SetupFormState>(defaultFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalFloors = useMemo(
    () => Object.values(floorsByBuilding).reduce((sum, floors) => sum + floors.length, 0),
    [floorsByBuilding],
  );

  const canSetupBuilding = permission.has("BUILDING_SETUP");

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!message && !error) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMessage(null);
      setError(null);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [error, message]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [buildingResult, roomTypeResult] = await Promise.all([
        getBuildings(),
        getRoomTypes(0, 200),
      ]);
      const floorEntries = await Promise.all(
        buildingResult.map(
          async (building) =>
            [building.id, await getFloorsByBuilding(building.id)] as const,
        ),
      );
      setBuildings(buildingResult);
      setFloorsByBuilding(Object.fromEntries(floorEntries));
      setRoomTypes(roomTypeResult.data);
      setForm((prev) => ({
        ...prev,
        defaultRoomTypeId: prev.defaultRoomTypeId || roomTypeResult.data[0]?.id || "",
      }));
    } catch (loadError) {
      console.error(loadError);
      setError(
        "Không tải được danh sách tòa nhà. Kiểm tra gateway, room-service và token ADMIN.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onChange = (key: keyof SetupFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const floorStart = Number(form.floorStart);
    const floorEnd = Number(form.floorEnd);
    const roomsPerFloor = Number(form.roomsPerFloor);
    const defaultPricePerDay = Number(form.defaultPricePerDay);
    const defaultPricePerHour = Number(form.defaultPricePerHour);

    if (
      !form.buildingName.trim() ||
      !form.defaultRoomTypeId ||
      !form.defaultRoomSize.trim()
    ) {
      setError("Vui lòng nhập tên tòa, loại phòng mặc định và diện tích mặc định.");
      return;
    }
    if (
      !Number.isFinite(floorStart) ||
      !Number.isFinite(floorEnd) ||
      floorStart > floorEnd
    ) {
      setError("Khoảng tầng không hợp lệ.");
      return;
    }
    if (!Number.isFinite(roomsPerFloor) || roomsPerFloor <= 0) {
      setError("Số phòng mỗi tầng phải lớn hơn 0.");
      return;
    }
    if (
      !Number.isFinite(defaultPricePerDay) ||
      defaultPricePerDay <= 0 ||
      !Number.isFinite(defaultPricePerHour) ||
      defaultPricePerHour <= 0
    ) {
      setError("Giá mặc định phải là số lớn hơn 0.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await setupBuilding({
        buildingName: form.buildingName.trim(),
        description: form.description.trim() || undefined,
        address: form.address.trim() || undefined,
        floorStart,
        floorEnd,
        roomsPerFloor,
        roomNumberPattern: form.roomNumberPattern.trim() || "{floor}{room:02}",
        defaultRoomTypeId: form.defaultRoomTypeId,
        defaultPricePerDay,
        defaultPricePerHour,
        defaultRoomSize: form.defaultRoomSize.trim(),
        skipRoomNumbers: form.skipRoomNumbers
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      setMessage(
        `Đã tạo ${result.createdFloorCount} tầng và ${result.createdRoomCount} phòng cho ${result.building.name}.`,
      );
      setForm({ ...defaultFormState, defaultRoomTypeId: roomTypes[0]?.id || "" });
      await loadData();
    } catch (submitError) {
      console.error(submitError);
      setError(
        "Không thể khởi tạo tòa nhà. Kiểm tra dữ liệu, token ADMIN và room-service.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canSetupBuilding) {
    return (
      <PermissionDenied message="Bạn không có quyền BUILDING_SETUP để quản lý tòa nhà và tầng." />
    );
  }

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#decdb9] bg-[#21170f] p-6 text-white shadow-[0_30px_80px_-52px_rgba(33,23,15,0.95)] lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(232,201,144,0.3),transparent_30%),radial-gradient(circle_at_88%_10%,rgba(255,255,255,0.13),transparent_24%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.32em] text-[#e8c990] uppercase">
              Hotel structure
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-none font-bold tracking-tight lg:text-7xl">
              Tòa nhà & tầng
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#eadbc4]">
              Đây là nơi setup cấu trúc vật lý của khách sạn. Sau khi tạo tòa và tầng,
              trang Phòng sẽ chỉ dùng để quản lý từng phòng cụ thể.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void loadData()}
            className="border-white/15 bg-white/10 text-white hover:bg-white/15"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Tổng tòa nhà"
          value={String(buildings.length)}
          icon={<Building2 className="h-5 w-5" />}
        />
        <MetricCard
          label="Tổng tầng"
          value={String(totalFloors)}
          icon={<Layers3 className="h-5 w-5" />}
        />
        <MetricCard
          label="Loại phòng mặc định"
          value={String(roomTypes.length)}
          icon={<Plus className="h-5 w-5" />}
        />
      </section>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {message ? <Alert tone="success">{message}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <BuildingSetupForm
          form={form}
          roomTypes={roomTypes}
          isSubmitting={isSubmitting}
          onChange={onChange}
          onSubmit={onSubmit}
        />
        <BuildingList
          buildings={buildings}
          floorsByBuilding={floorsByBuilding}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

function BuildingSetupForm({
  form,
  roomTypes,
  isSubmitting,
  onChange,
  onSubmit,
}: {
  form: SetupFormState;
  roomTypes: RoomTypeResponse[];
  isSubmitting: boolean;
  onChange: (key: keyof SetupFormState, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const floorStart = Number(form.floorStart);
  const roomsPerFloor = Number(form.roomsPerFloor);
  const previewRooms =
    Number.isFinite(floorStart) && Number.isFinite(roomsPerFloor) && roomsPerFloor > 0
      ? Array.from({ length: Math.min(roomsPerFloor, 6) }, (_, index) =>
          formatRoomNumber(
            form.roomNumberPattern || "{floor}{room:02}",
            floorStart,
            index + 1,
          ),
        )
      : [];

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[1.75rem] border border-[#decdb9] bg-white/78 p-6 shadow-sm"
    >
      <p className="text-xs font-black tracking-[0.28em] text-[#9b5c24] uppercase">
        Khởi tạo ban đầu
      </p>
      <h3 className="mt-2 font-serif text-4xl font-bold">
        Tạo tòa, tầng và phòng hàng loạt
      </h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Tên tòa nhà *">
          <Input
            value={form.buildingName}
            onChange={(event) => onChange("buildingName", event.target.value)}
            placeholder="Continental Tower A"
          />
        </Field>
        <Field label="Loại phòng mặc định *">
          <select
            value={form.defaultRoomTypeId}
            onChange={(event) => onChange("defaultRoomTypeId", event.target.value)}
            className="h-10 w-full rounded-md border border-[#decdb9] bg-[#fffaf2] px-3 text-sm outline-none"
          >
            {roomTypes.length === 0 ? <option value="">Chưa có loại phòng</option> : null}
            {roomTypes.map((roomType) => (
              <option key={roomType.id} value={roomType.id}>
                {roomType.name} · tối đa {roomType.maximumOccupancy} khách
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tầng bắt đầu *">
          <Input
            value={form.floorStart}
            onChange={(event) =>
              onChange("floorStart", event.target.value.replace(/[^\d-]/g, ""))
            }
            inputMode="numeric"
          />
        </Field>
        <Field label="Tầng kết thúc *">
          <Input
            value={form.floorEnd}
            onChange={(event) =>
              onChange("floorEnd", event.target.value.replace(/[^\d-]/g, ""))
            }
            inputMode="numeric"
          />
        </Field>
        <Field label="Số phòng mỗi tầng *">
          <Input
            value={form.roomsPerFloor}
            onChange={(event) =>
              onChange("roomsPerFloor", event.target.value.replace(/[^\d]/g, ""))
            }
            inputMode="numeric"
          />
        </Field>
        <Field label="Mẫu số phòng *">
          <Input
            value={form.roomNumberPattern}
            onChange={(event) => onChange("roomNumberPattern", event.target.value)}
            placeholder="{floor}{room:02}"
          />
        </Field>
        <Field label="Giá ngày mặc định *">
          <Input
            value={form.defaultPricePerDay}
            onChange={(event) =>
              onChange("defaultPricePerDay", event.target.value.replace(/[^\d]/g, ""))
            }
            inputMode="numeric"
          />
        </Field>
        <Field label="Giá giờ mặc định *">
          <Input
            value={form.defaultPricePerHour}
            onChange={(event) =>
              onChange("defaultPricePerHour", event.target.value.replace(/[^\d]/g, ""))
            }
            inputMode="numeric"
          />
        </Field>
        <Field label="Diện tích mặc định *">
          <Input
            value={form.defaultRoomSize}
            onChange={(event) => onChange("defaultRoomSize", event.target.value)}
            placeholder="32m2"
          />
        </Field>
        <Field label="Phòng bỏ qua">
          <Input
            value={form.skipRoomNumbers}
            onChange={(event) => onChange("skipRoomNumbers", event.target.value)}
            placeholder="404, 413, 1414"
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Địa chỉ tòa nhà">
            <Input
              value={form.address}
              onChange={(event) => onChange("address", event.target.value)}
              placeholder="VD: 132 Đồng Khởi, Quận 1"
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Mô tả">
            <Input
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              placeholder="Khu phòng chính"
            />
          </Field>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-[#eadfcd] bg-[#fbf7ef] p-4">
        <p className="text-xs font-bold tracking-[0.2em] text-[#9b8c7d] uppercase">
          Preview mã phòng
        </p>
        <p className="mt-2 font-black">
          {previewRooms.length
            ? previewRooms.join(", ")
            : "Nhập số tầng và số phòng để xem trước."}
        </p>
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isSubmitting || roomTypes.length === 0}>
          {isSubmitting ? "Đang khởi tạo..." : "Khởi tạo cấu trúc"}
        </Button>
      </div>
    </form>
  );
}

function BuildingList({
  buildings,
  floorsByBuilding,
  isLoading,
}: {
  buildings: BuildingResponse[];
  floorsByBuilding: Record<string, FloorResponse[]>;
  isLoading: boolean;
}) {
  return (
    <section className="rounded-[1.75rem] border border-[#decdb9] bg-white/78 p-6 shadow-sm">
      <h3 className="font-serif text-4xl font-bold">Cấu trúc hiện có</h3>
      <p className="mt-2 text-sm text-[#75695d]">
        Tòa nhà và tầng đang được lưu trong room-service.
      </p>
      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="rounded-2xl border border-[#eadfcd] bg-[#fffaf2] p-4 font-bold">
            Đang tải dữ liệu...
          </p>
        ) : null}
        {!isLoading && buildings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#cdb99f] bg-[#fffaf2] p-6 text-center font-bold">
            Chưa có tòa nhà nào. Hãy khởi tạo cấu trúc đầu tiên.
          </p>
        ) : null}
        {buildings.map((building) => {
          const floors = floorsByBuilding[building.id] ?? [];
          return (
            <article
              key={building.id}
              className="rounded-3xl border border-[#eadfcd] bg-[#fffaf2] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xl font-black">{building.name}</h4>
                  <p className="mt-1 text-sm text-[#75695d]">
                    {building.description || "Chưa có mô tả"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#5f5144]">
                    {building.address || "Chưa có địa chỉ"}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                  {building.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {floors.map((floor) => (
                  <span
                    key={floor.id}
                    className="rounded-full border border-[#decdb9] bg-white px-3 py-1 text-xs font-bold text-[#5f5144]"
                  >
                    Tầng {floor.floorNumber}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-black text-[#4d4035]">{label}</Label>
      {children}
    </div>
  );
}

function Alert({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
        tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {children}
    </div>
  );
}

function formatRoomNumber(pattern: string, floorNumber: number, roomIndex: number) {
  return pattern
    .replace("{floor}", String(floorNumber))
    .replace("{room:02}", String(roomIndex).padStart(2, "0"))
    .replace("{room:03}", String(roomIndex).padStart(3, "0"))
    .replace("{room}", String(roomIndex));
}
