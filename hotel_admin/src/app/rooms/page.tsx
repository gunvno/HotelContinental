"use client";

import { BedDouble, Camera, CheckCircle2, Hotel, Layers3, MapPin, Plus, RefreshCw, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createRoom,
  type BuildingResponse,
  type CreateRoomPayload,
  type FloorResponse,
  getAllRooms,
  getBuildings,
  getFloorsByBuilding,
  getRoomTypes,
  type RoomResponse,
  type RoomTypeResponse,
  uploadRoomImages,
} from "@/services/room-service";

type FormState = {
  buildingId: string;
  floorId: string;
  roomTypeId: string;
  name: string;
  pricePerDay: string;
  pricePerHour: string;
  description: string;
  roomSize: string;
};

const defaultFormState: FormState = {
  buildingId: "",
  floorId: "",
  roomTypeId: "",
  name: "",
  pricePerDay: "",
  pricePerHour: "",
  description: "",
  roomSize: "",
};

const statusLabel: Record<string, string> = {
  AVAILABLE: "Sẵn sàng",
  OCCUPIED: "Đang ở",
  RESERVED: "Đã giữ",
  MAINTENANCE: "Bảo trì",
};

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedBuildingFloors = floors.filter((floor) => floor.buildingId === form.buildingId);
  const filePreviews = useMemo(
    () => selectedFiles.map((file) => ({ name: file.name, size: Math.round(file.size / 1024) })),
    [selectedFiles],
  );

  const availableRooms = rooms.filter((room) => room.status === "AVAILABLE").length;
  const averageDailyPrice =
    rooms.length > 0
      ? Math.round(rooms.reduce((sum, room) => sum + Number(room.pricePerDay || 0), 0) / rooms.length)
      : 0;

  useEffect(() => {
    void loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [roomResult, roomTypeResult, buildingResult] = await Promise.all([
        getAllRooms(0, 200),
        getRoomTypes(0, 200),
        getBuildings(),
      ]);
      const floorEntries = await Promise.all(
        buildingResult.map(async (building) => [building.id, await getFloorsByBuilding(building.id)] as const),
      );
      const allFloors = floorEntries.flatMap(([, buildingFloors]) => buildingFloors);
      const firstBuildingId = buildingResult[0]?.id || "";
      const firstFloorId = allFloors.find((floor) => floor.buildingId === firstBuildingId)?.id || "";

      setRooms(roomResult.data);
      setRoomTypes(roomTypeResult.data);
      setBuildings(buildingResult);
      setFloors(allFloors);
      setForm((prev) => ({
        ...prev,
        buildingId: prev.buildingId || firstBuildingId,
        floorId: prev.floorId || firstFloorId,
        roomTypeId: prev.roomTypeId || roomTypeResult.data[0]?.id || "",
      }));
    } catch (loadError) {
      console.error(loadError);
      setError("Không tải được dữ liệu phòng. Kiểm tra gateway, room-service và token ADMIN.");
    } finally {
      setIsLoading(false);
    }
  };

  const onChange = (key: keyof FormState, value: string) => {
    setForm((prev) => {
      if (key === "buildingId") {
        const nextFloorId = floors.find((floor) => floor.buildingId === value)?.id || "";
        return {
          ...prev,
          buildingId: value,
          floorId: nextFloorId,
        };
      }
      if (key === "floorId") {
        return {
          ...prev,
          floorId: value,
        };
      }
      return { ...prev, [key]: value };
    });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.buildingId || !form.floorId) {
      setError("Vui lòng chọn tòa nhà và tầng trước khi tạo phòng.");
      return;
    }
    if (!form.roomTypeId || !form.name.trim() || !form.roomSize.trim()) {
      setError("Vui lòng chọn loại phòng và nhập tên phòng, diện tích.");
      return;
    }

    const pricePerDay = Number(form.pricePerDay);
    const pricePerHour = Number(form.pricePerHour);

    if (!Number.isFinite(pricePerDay) || pricePerDay <= 0 || !Number.isFinite(pricePerHour) || pricePerHour <= 0) {
      setError("Giá theo ngày và giá theo giờ phải là số lớn hơn 0.");
      return;
    }

    const payload: CreateRoomPayload = {
      floorId: form.floorId,
      roomTypeId: form.roomTypeId,
      name: form.name.trim(),
      pricePerDay,
      pricePerHour,
      description: form.description.trim() || undefined,
      roomSize: form.roomSize.trim(),
      status: "AVAILABLE",
    };

    try {
      setIsSubmitting(true);
      const result = await createRoom(payload);
      let uploadWarning: string | null = null;

      if (selectedFiles.length > 0) {
        if (!result.id) {
          throw new Error("Backend không trả id phòng sau khi tạo.");
        }
        try {
          await uploadRoomImages(result.id, selectedFiles, coverIndex);
        } catch (uploadError) {
          console.error(uploadError);
          uploadWarning = "Tạo phòng thành công nhưng upload ảnh thất bại. Bạn có thể upload lại sau.";
        }
      }

      setMessage(
        uploadWarning
          ? `Đã tạo phòng "${result.name}" nhưng chưa upload ảnh thành công.`
          : `Đã tạo phòng "${result.name}"${selectedFiles.length ? ` và upload ${selectedFiles.length} ảnh` : ""}.`,
      );
      setForm({
        ...defaultFormState,
        buildingId: buildings[0]?.id || "",
        floorId: floors.find((floor) => floor.buildingId === buildings[0]?.id)?.id || "",
        roomTypeId: roomTypes[0]?.id || "",
      });
      setSelectedFiles([]);
      setCoverIndex(0);
      await loadInitialData();
      if (uploadWarning) {
        setError(uploadWarning);
      }
    } catch (submitError) {
      console.error(submitError);
      setError("Không thể tạo phòng. Kiểm tra dữ liệu, quyền ADMIN, Cloudinary và API room-service.");
    } finally {
      setIsSubmitting(false);
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
              Trang này chỉ quản lý phòng vật lý. Cấu trúc tòa nhà và tầng được setup riêng ở màn Tòa nhà & tầng.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void loadInitialData()}
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
        <MetricCard icon={<BedDouble className="h-5 w-5" />} label="Giá TB/ngày" value={formatCurrency(averageDailyPrice)} />
      </section>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {message ? <Alert tone="success">{message}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <RoomCreateForm
          form={form}
          buildings={buildings}
          floors={selectedBuildingFloors}
          roomTypes={roomTypes}
          filePreviews={filePreviews}
          coverIndex={coverIndex}
          isSubmitting={isSubmitting}
          onChange={onChange}
          onCoverChange={setCoverIndex}
          onFilesChange={(files) => {
            setSelectedFiles(files);
            setCoverIndex(0);
          }}
          onSubmit={onSubmit}
        />
        <RoomListView
          rooms={rooms}
          buildings={buildings}
          floors={floors}
          isLoading={isLoading}
          onOpen={(roomId) => router.push(`/rooms/${roomId}`)}
        />
      </div>
    </div>
  );
}

function RoomCreateForm({
  form,
  buildings,
  floors,
  roomTypes,
  filePreviews,
  coverIndex,
  isSubmitting,
  onChange,
  onCoverChange,
  onFilesChange,
  onSubmit,
}: {
  form: FormState;
  buildings: BuildingResponse[];
  floors: FloorResponse[];
  roomTypes: RoomTypeResponse[];
  filePreviews: Array<{ name: string; size: number }>;
  coverIndex: number;
  isSubmitting: boolean;
  onChange: (key: keyof FormState, value: string) => void;
  onCoverChange: (index: number) => void;
  onFilesChange: (files: File[]) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const fieldClassName = "border-[#decdb9] bg-[#fffaf2] text-[#211a14] placeholder:text-[#9b8c7d] focus-visible:ring-[#9b5c24]";

  return (
    <form onSubmit={onSubmit} className="rounded-[1.75rem] border border-[#decdb9] bg-white/78 p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-[#9b5c24]">Thêm phòng vật lý</p>
      <h3 className="mt-2 font-serif text-4xl font-bold">Gán phòng vào tầng thật</h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Tòa nhà *">
          <select
            value={form.buildingId}
            onChange={(event) => onChange("buildingId", event.target.value)}
            className={`h-10 w-full rounded-md border px-3 text-sm outline-none ${fieldClassName}`}
          >
            {buildings.length === 0 ? <option value="">Chưa có tòa nhà</option> : null}
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tầng *">
          <select
            value={form.floorId}
            onChange={(event) => onChange("floorId", event.target.value)}
            className={`h-10 w-full rounded-md border px-3 text-sm outline-none ${fieldClassName}`}
          >
            {floors.length === 0 ? <option value="">Chưa có tầng</option> : null}
            {floors.map((floor) => (
              <option key={floor.id} value={floor.id}>
                Tầng {floor.floorNumber}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Loại phòng *">
          <select
            value={form.roomTypeId}
            onChange={(event) => onChange("roomTypeId", event.target.value)}
            className={`h-10 w-full rounded-md border px-3 text-sm outline-none ${fieldClassName}`}
          >
            {roomTypes.length === 0 ? <option value="">Chưa có loại phòng</option> : null}
            {roomTypes.map((roomType) => (
              <option key={roomType.id} value={roomType.id}>
                {roomType.name} · tối đa {roomType.maximumOccupancy} khách
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tên phòng *">
          <Input value={form.name} onChange={(event) => onChange("name", event.target.value)} placeholder="VD: 601" className={fieldClassName} />
        </Field>

        <Field label="Giá theo ngày (VND) *">
          <PriceInput value={form.pricePerDay} onChange={(value) => onChange("pricePerDay", value)} placeholder="1200000" className={fieldClassName} />
        </Field>

        <Field label="Giá theo giờ (VND) *">
          <PriceInput value={form.pricePerHour} onChange={(value) => onChange("pricePerHour", value)} placeholder="180000" className={fieldClassName} />
        </Field>

        <Field label="Diện tích *">
          <Input value={form.roomSize} onChange={(event) => onChange("roomSize", event.target.value)} placeholder="32m2" className={fieldClassName} />
        </Field>

        <div className="md:col-span-2">
          <Field label="Ảnh phòng">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#cdb99f] bg-[#fffaf2] px-4 py-7 text-center transition hover:bg-[#f8eddd]">
              <UploadCloud className="h-8 w-8 text-[#9b5c24]" />
              <span className="mt-2 text-sm font-bold">Chọn một hoặc nhiều ảnh</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => onFilesChange(Array.from(event.target.files ?? []))}
              />
            </label>
          </Field>
        </div>

        {filePreviews.length > 0 ? (
          <div className="rounded-[1.5rem] border border-[#eadfcd] bg-[#fbf7ef] p-4 md:col-span-2">
            <div className="mb-3 flex items-center gap-2 text-sm font-black">
              <Camera className="h-4 w-4 text-[#9b5c24]" />
              Chọn ảnh cover
            </div>
            <div className="grid gap-2">
              {filePreviews.map((file, index) => (
                <label key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl border border-[#eadfcd] bg-white/80 px-4 py-3 text-sm">
                  <span className="truncate">
                    {file.name} <span className="text-[#75695d]">({file.size} KB)</span>
                  </span>
                  <input type="radio" name="coverImage" checked={coverIndex === index} onChange={() => onCoverChange(index)} />
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="md:col-span-2">
          <Field label="Mô tả">
            <textarea
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              rows={4}
              placeholder="Mô tả tiện nghi, tầm nhìn, phong cách..."
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus-visible:ring-2 ${fieldClassName}`}
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isSubmitting || buildings.length === 0 || floors.length === 0 || roomTypes.length === 0}>
          {isSubmitting ? "Đang tạo..." : "Tạo phòng"}
        </Button>
      </div>
    </form>
  );
}

function RoomListView({
  rooms,
  buildings,
  floors,
  isLoading,
  onOpen,
}: {
  rooms: RoomResponse[];
  buildings: BuildingResponse[];
  floors: FloorResponse[];
  isLoading: boolean;
  onOpen: (roomId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="rounded-[1.75rem] border border-[#decdb9] bg-white/72 p-10 text-center font-bold text-[#75695d]">
        Đang tải danh sách phòng...
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-[#cdb99f] bg-white/60 p-12 text-center">
        <BedDouble className="mx-auto h-10 w-10 text-[#9b5c24]" />
        <h3 className="mt-4 font-serif text-3xl font-bold">Chưa có phòng</h3>
        <p className="mt-2 text-sm text-[#75695d]">Hãy tạo tòa nhà và tầng trước, sau đó thêm phòng vật lý ở đây.</p>
      </div>
    );
  }

  return (
    <div className="grid content-start gap-5 md:grid-cols-2">
      {rooms.map((room) => (
        <article
          key={room.id || room.name}
          onClick={() => room.id && onOpen(room.id)}
          className="cursor-pointer overflow-hidden rounded-[1.75rem] border border-[#decdb9] bg-white/78 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <div className="relative h-44 bg-[#eadfcd]">
            {room.image ? (
              <Image src={room.image} alt={room.name} fill unoptimized sizes="(min-width: 1280px) 25vw, 100vw" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Camera className="h-10 w-10 text-[#9b5c24]/60" />
              </div>
            )}
            <span className="absolute left-4 top-4 rounded-full bg-[#21170f]/88 px-3 py-1 text-xs font-black text-white backdrop-blur">
              {statusLabel[room.status] || room.status}
            </span>
          </div>
          <div className="p-5">
            <h3 className="font-serif text-3xl font-bold leading-none">{room.name}</h3>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-[#75695d]">
              <MapPin className="h-4 w-4" />
              {resolveRoomLocation(room, buildings, floors)}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <InfoPill label="Loại phòng" value={room.roomTypes?.name || "Chưa gán"} />
              <InfoPill label="Diện tích" value={room.roomSize} />
              <InfoPill label="Tầng" value={room.floorId ? "Đã gán" : "Chưa gán"} />
              <InfoPill label="Giá/ngày" value={formatCurrency(room.pricePerDay)} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function resolveRoomLocation(room: RoomResponse, buildings: BuildingResponse[], floors: FloorResponse[]) {
  const floor = floors.find((item) => item.id === room.floorId);
  const building = buildings.find((item) => item.id === floor?.buildingId);

  if (!floor || !building) {
    return "Chưa gán tòa/tầng";
  }

  return `${building.name} - Tầng ${floor.floorNumber}`;
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-black text-[#4d4035]">{label}</Label>
      {children}
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf7ef] p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b8c7d]">{label}</p>
      <p className="mt-1 truncate font-black">{value}</p>
    </div>
  );
}

function PriceInput({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const suggestions = getPriceSuggestions(value);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ""))}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        placeholder={placeholder}
        inputMode="numeric"
        className={className}
      />
      {isOpen && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-[#decdb9] bg-white shadow-[0_18px_45px_-28px_rgba(33,23,15,0.65)]">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(String(suggestion));
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-semibold text-[#211a14] transition hover:bg-[#fff4e6]"
            >
              <span>{formatCurrency(suggestion)}</span>
              <span className="text-xs font-bold text-[#9b5c24]">{suggestion}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getPriceSuggestions(rawValue: string) {
  const base = Number(String(rawValue).replace(/[^\d]/g, ""));
  if (!Number.isFinite(base) || base <= 0) {
    return [];
  }

  return [1_000, 10_000, 100_000, 1_000_000]
    .map((multiplier) => base * multiplier)
    .filter((suggestion) => suggestion > base)
    .slice(0, 4);
}

function Alert({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
        tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
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
