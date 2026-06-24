"use client";

import { Building2, Layers3, Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/ui/metric-card";
import { Select } from "@/components/ui/select";
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
        "KhÃ´ng táº£i Ä‘Æ°á»£c danh sÃ¡ch tÃ²a nhÃ . Kiá»ƒm tra gateway, room-service vÃ  token ADMIN.",
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
      setError("Vui lÃ²ng nháº­p tÃªn tÃ²a, loáº¡i phÃ²ng máº·c Ä‘á»‹nh vÃ  diá»‡n tÃ­ch máº·c Ä‘á»‹nh.");
      return;
    }
    if (
      !Number.isFinite(floorStart) ||
      !Number.isFinite(floorEnd) ||
      floorStart > floorEnd
    ) {
      setError("Khoáº£ng táº§ng khÃ´ng há»£p lá»‡.");
      return;
    }
    if (!Number.isFinite(roomsPerFloor) || roomsPerFloor <= 0) {
      setError("Sá»‘ phÃ²ng má»—i táº§ng pháº£i lá»›n hÆ¡n 0.");
      return;
    }
    if (
      !Number.isFinite(defaultPricePerDay) ||
      defaultPricePerDay <= 0 ||
      !Number.isFinite(defaultPricePerHour) ||
      defaultPricePerHour <= 0
    ) {
      setError("GiÃ¡ máº·c Ä‘á»‹nh pháº£i lÃ  sá»‘ lá»›n hÆ¡n 0.");
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
        `ÄÃ£ táº¡o ${result.createdFloorCount} táº§ng vÃ  ${result.createdRoomCount} phÃ²ng cho ${result.building.name}.`,
      );
      setForm({ ...defaultFormState, defaultRoomTypeId: roomTypes[0]?.id || "" });
      await loadData();
    } catch (submitError) {
      console.error(submitError);
      setError(
        "KhÃ´ng thá»ƒ khá»Ÿi táº¡o tÃ²a nhÃ . Kiá»ƒm tra dá»¯ liá»‡u, token ADMIN vÃ  room-service.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canSetupBuilding) {
    return (
      <PermissionDenied message="Báº¡n khÃ´ng cÃ³ quyá»n BUILDING_SETUP Ä‘á»ƒ quáº£n lÃ½ tÃ²a nhÃ  vÃ  táº§ng." />
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
              TÃ²a nhÃ  & táº§ng
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#eadbc4]">
              ÄÃ¢y lÃ  nÆ¡i setup cáº¥u trÃºc váº­t lÃ½ cá»§a khÃ¡ch sáº¡n. Sau khi táº¡o tÃ²a vÃ  táº§ng,
              trang PhÃ²ng sáº½ chá»‰ dÃ¹ng Ä‘á»ƒ quáº£n lÃ½ tá»«ng phÃ²ng cá»¥ thá»ƒ.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void loadData()}
            className="border-white/15 bg-white/10 text-white hover:bg-white/15"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            LÃ m má»›i
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Tá»•ng tÃ²a nhÃ "
          value={String(buildings.length)}
          icon={<Building2 className="h-5 w-5" />}
        />
        <MetricCard
          label="Tá»•ng táº§ng"
          value={String(totalFloors)}
          icon={<Layers3 className="h-5 w-5" />}
        />
        <MetricCard
          label="Loáº¡i phÃ²ng máº·c Ä‘á»‹nh"
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
        Khá»Ÿi táº¡o ban Ä‘áº§u
      </p>
      <h3 className="mt-2 font-serif text-4xl font-bold">
        Táº¡o tÃ²a, táº§ng vÃ  phÃ²ng hÃ ng loáº¡t
      </h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <TextField
          label="TÃªn tÃ²a nhÃ  *"
          value={form.buildingName}
          onValueChange={(value) => onChange("buildingName", value)}
          placeholder="Continental Tower A"
        />
        <Field label="Loáº¡i phÃ²ng máº·c Ä‘á»‹nh *">
          <Select
            value={form.defaultRoomTypeId}
            onValueChange={(value) => onChange("defaultRoomTypeId", value)}
            placeholder="Chá»n loáº¡i phÃ²ng"
            disabled={roomTypes.length === 0}
            options={
              roomTypes.length === 0
                ? [{ value: "", label: "ChÆ°a cÃ³ loáº¡i phÃ²ng" }]
                : roomTypes.map((roomType) => ({
                    value: roomType.id,
                    label: `${roomType.name} Â· tá»‘i Ä‘a ${roomType.maximumOccupancy} khÃ¡ch`,
                  }))
            }
          />
        </Field>
        <TextField
          label="Táº§ng báº¯t Ä‘áº§u *"
          value={form.floorStart}
          onValueChange={(value) => onChange("floorStart", value.replace(/[^\d-]/g, ""))}
          inputMode="numeric"
        />
        <TextField
          label="Táº§ng káº¿t thÃºc *"
          value={form.floorEnd}
          onValueChange={(value) => onChange("floorEnd", value.replace(/[^\d-]/g, ""))}
          inputMode="numeric"
        />
        <TextField
          label="Sá»‘ phÃ²ng má»—i táº§ng *"
          value={form.roomsPerFloor}
          onValueChange={(value) => onChange("roomsPerFloor", value.replace(/[^\d]/g, ""))}
          inputMode="numeric"
        />
        <TextField
          label="Máº«u sá»‘ phÃ²ng *"
          value={form.roomNumberPattern}
          onValueChange={(value) => onChange("roomNumberPattern", value)}
          placeholder="{floor}{room:02}"
        />
        <TextField
          label="GiÃ¡ ngÃ y máº·c Ä‘á»‹nh *"
          value={form.defaultPricePerDay}
          onValueChange={(value) =>
            onChange("defaultPricePerDay", value.replace(/[^\d]/g, ""))
          }
          inputMode="numeric"
        />
        <TextField
          label="GiÃ¡ giá» máº·c Ä‘á»‹nh *"
          value={form.defaultPricePerHour}
          onValueChange={(value) =>
            onChange("defaultPricePerHour", value.replace(/[^\d]/g, ""))
          }
          inputMode="numeric"
        />
        <TextField
          label="Diá»‡n tÃ­ch máº·c Ä‘á»‹nh *"
          value={form.defaultRoomSize}
          onValueChange={(value) => onChange("defaultRoomSize", value)}
          placeholder="32m2"
        />
        <TextField
          label="PhÃ²ng bá» qua"
          value={form.skipRoomNumbers}
          onValueChange={(value) => onChange("skipRoomNumbers", value)}
          placeholder="404, 413, 1414"
        />
        <div className="md:col-span-2">
          <TextField
            label="Äá»‹a chá»‰ tÃ²a nhÃ "
            value={form.address}
            onValueChange={(value) => onChange("address", value)}
            placeholder="VD: 132 Äá»“ng Khá»Ÿi, Quáº­n 1"
          />
        </div>
        <div className="md:col-span-2">
          <TextField
            label="MÃ´ táº£"
            value={form.description}
            onValueChange={(value) => onChange("description", value)}
            placeholder="Khu phÃ²ng chÃ­nh"
          />
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-[#eadfcd] bg-[#fbf7ef] p-4">
        <p className="text-xs font-bold tracking-[0.2em] text-[#9b8c7d] uppercase">
          Preview mÃ£ phÃ²ng
        </p>
        <p className="mt-2 font-black">
          {previewRooms.length
            ? previewRooms.join(", ")
            : "Nháº­p sá»‘ táº§ng vÃ  sá»‘ phÃ²ng Ä‘á»ƒ xem trÆ°á»›c."}
        </p>
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isSubmitting || roomTypes.length === 0}>
          {isSubmitting ? "Äang khá»Ÿi táº¡o..." : "Khá»Ÿi táº¡o cáº¥u trÃºc"}
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
      <h3 className="font-serif text-4xl font-bold">Cáº¥u trÃºc hiá»‡n cÃ³</h3>
      <p className="mt-2 text-sm text-[#75695d]">
        TÃ²a nhÃ  vÃ  táº§ng Ä‘ang Ä‘Æ°á»£c lÆ°u trong room-service.
      </p>
      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="rounded-2xl border border-[#eadfcd] bg-[#fffaf2] p-4 font-bold">
            Äang táº£i dá»¯ liá»‡u...
          </p>
        ) : null}
        {!isLoading && buildings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#cdb99f] bg-[#fffaf2] p-6 text-center font-bold">
            ChÆ°a cÃ³ tÃ²a nhÃ  nÃ o. HÃ£y khá»Ÿi táº¡o cáº¥u trÃºc Ä‘áº§u tiÃªn.
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
                    {building.description || "ChÆ°a cÃ³ mÃ´ táº£"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#5f5144]">
                    {building.address || "ChÆ°a cÃ³ Ä‘á»‹a chá»‰"}
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
                    Táº§ng {floor.floorNumber}
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

