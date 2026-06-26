"use client";

import { ArrowLeft, ImagePlus, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ToastBridge } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import {
  type BuildingResponse,
  createRoom,
  type CreateRoomPayload,
  type FloorResponse,
  getBuildings,
  getFloorsByBuilding,
  getRoomTypes,
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

export default function CreateRoomPage() {
  const router = useRouter();
  const permission = usePermission();
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedBuildingFloors = floors.filter(
    (floor) => floor.buildingId === form.buildingId,
  );
  const filePreviews = useMemo(
    () =>
      selectedFiles.map((file) => ({
        name: file.name,
        size: Math.round(file.size / 1024),
        previewUrl: URL.createObjectURL(file),
      })),
    [selectedFiles],
  );

  const canCreateRoom = permission.has("ROOM_CREATE");

  useEffect(() => {
    void loadInitialData();
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

  useEffect(() => {
    return () => {
      filePreviews.forEach((file) => URL.revokeObjectURL(file.previewUrl));
    };
  }, [filePreviews]);

  const loadInitialData = async () => {
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
      const allFloors = floorEntries.flatMap(([, buildingFloors]) => buildingFloors);
      const firstBuildingId = buildingResult[0]?.id || "";
      const firstFloorId =
        allFloors.find((floor) => floor.buildingId === firstBuildingId)?.id || "";

      setBuildings(buildingResult);
      setFloors(allFloors);
      setRoomTypes(roomTypeResult.data);
      setForm((prev) => ({
        ...prev,
        buildingId: prev.buildingId || firstBuildingId,
        floorId: prev.floorId || firstFloorId,
        roomTypeId: prev.roomTypeId || roomTypeResult.data[0]?.id || "",
      }));
    } catch (loadError) {
      console.error(loadError);
      setError(
        "Không tải được dữ liệu tạo phòng. Kiểm tra gateway, room-service và token ADMIN.",
      );
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

      return { ...prev, [key]: value };
    });
  };

  const handleImageFiles = (files: File[]) => {
    const validFiles = files
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 10);

    if (files.length > 0 && validFiles.length === 0) {
      setError("Vui lòng chọn file ảnh đúng định dạng.");
      return;
    }

    setSelectedFiles(validFiles);
    setCoverIndex(0);
  };

  const removeImageAt = (index: number) => {
    const nextFiles = selectedFiles.filter((_, fileIndex) => fileIndex !== index);
    setSelectedFiles(nextFiles);
    setCoverIndex((currentIndex) => {
      if (nextFiles.length === 0 || currentIndex === index) {
        return 0;
      }
      if (currentIndex > index) {
        return currentIndex - 1;
      }
      return Math.min(currentIndex, nextFiles.length - 1);
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

    if (
      !Number.isFinite(pricePerDay) ||
      pricePerDay <= 0 ||
      !Number.isFinite(pricePerHour) ||
      pricePerHour <= 0
    ) {
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

      if (selectedFiles.length > 0) {
        if (!result.id) {
          throw new Error("Backend không trả id phòng sau khi tạo.");
        }
        await uploadRoomImages(result.id, selectedFiles, coverIndex);
      }

      setMessage(
        `Đã tạo phòng "${result.name}"${selectedFiles.length ? ` và upload ${selectedFiles.length} ảnh` : ""}.`,
      );
      window.setTimeout(() => router.push("/rooms"), 700);
    } catch (submitError) {
      console.error(submitError);
      setError(
        "Không thể tạo phòng. Kiểm tra dữ liệu, quyền ADMIN, Cloudinary và API room-service.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreateRoom) {
    return <PermissionDenied message="Bạn không có quyền ROOM_CREATE để tạo phòng." />;
  }

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] border border-[#decdb9] bg-white/78 p-6 shadow-sm">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 text-sm font-black tracking-[0.18em] text-[#9b5c24] uppercase"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
        <p className="mt-8 text-xs font-black tracking-[0.28em] text-[#9b5c24] uppercase">
          Thêm phòng vật lý
        </p>
        <h2 className="mt-2 font-serif text-5xl font-bold text-[#211a14]">
          Gán phòng vào tầng thật
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75695d]">
          Trang này chỉ dùng để tạo phòng mới. Sau khi tạo xong, bạn sẽ quay lại danh sách
          quản lý phòng.
        </p>
      </section>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {message ? <Alert tone="success">{message}</Alert> : null}

      <form
        onSubmit={onSubmit}
        className="rounded-[1.75rem] border border-[#decdb9] bg-white/78 p-6 shadow-sm"
      >
        {isLoading ? (
          <div className="rounded-2xl border border-[#eadfcd] bg-[#fffaf2] p-8 text-center text-sm font-bold text-[#75695d]">
            Đang tải dữ liệu tạo phòng...
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tòa nhà *">
                <Select
                  value={form.buildingId}
                  onValueChange={(value) => onChange("buildingId", value)}
                  placeholder="Chọn tòa nhà"
                  disabled={buildings.length === 0}
                  options={
                    buildings.length === 0
                      ? [{ value: "", label: "Chưa có tòa nhà" }]
                      : buildings.map((building) => ({
                          value: building.id,
                          label: building.name,
                        }))
                  }
                />
              </Field>

              <Field label="Tầng *">
                <Select
                  value={form.floorId}
                  onValueChange={(value) => onChange("floorId", value)}
                  placeholder="Chọn tầng"
                  disabled={selectedBuildingFloors.length === 0}
                  options={
                    selectedBuildingFloors.length === 0
                      ? [{ value: "", label: "Chưa có tầng" }]
                      : selectedBuildingFloors.map((floor) => ({
                          value: floor.id,
                          label: `Tầng ${floor.floorNumber}`,
                        }))
                  }
                />
              </Field>

              <Field label="Loại phòng *">
                <Select
                  value={form.roomTypeId}
                  onValueChange={(value) => onChange("roomTypeId", value)}
                  placeholder="Chọn loại phòng"
                  disabled={roomTypes.length === 0}
                  options={
                    roomTypes.length === 0
                      ? [{ value: "", label: "Chưa có loại phòng" }]
                      : roomTypes.map((roomType) => ({
                          value: roomType.id,
                          label: `${roomType.name} - tối đa ${roomType.maximumOccupancy} khách`,
                        }))
                  }
                />
              </Field>

              <Field label="Tên phòng *">
                <Input
                  value={form.name}
                  onChange={(event) => onChange("name", event.target.value)}
                  placeholder="VD: 601"
                />
              </Field>

              <Field label="Giá theo ngày (VND) *">
                <PriceInput
                  value={form.pricePerDay}
                  onChange={(value) => onChange("pricePerDay", value)}
                  placeholder="1200000"
                />
              </Field>

              <Field label="Giá theo giờ (VND) *">
                <PriceInput
                  value={form.pricePerHour}
                  onChange={(value) => onChange("pricePerHour", value)}
                  placeholder="180000"
                />
              </Field>

              <Field label="Diện tích *">
                <Input
                  value={form.roomSize}
                  onChange={(event) => onChange("roomSize", event.target.value)}
                  placeholder="32m2"
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Ảnh phòng">
                  <ImageUploadPanel
                    filePreviews={filePreviews}
                    coverIndex={coverIndex}
                    onCoverChange={setCoverIndex}
                    onFilesChange={handleImageFiles}
                    onRemove={removeImageAt}
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Mô tả">
                  <textarea
                    value={form.description}
                    onChange={(event) => onChange("description", event.target.value)}
                    rows={4}
                    placeholder="Mô tả tiện nghi, tầm nhìn, phong cách..."
                    className="w-full rounded-xl border border-[#decdb9] bg-[#fffaf2] px-3 py-2 text-sm text-[#211a14] outline-none focus-visible:ring-2 focus-visible:ring-[#9b5c24]"
                  />
                </Field>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/rooms")}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  buildings.length === 0 ||
                  selectedBuildingFloors.length === 0 ||
                  roomTypes.length === 0
                }
              >
                {isSubmitting ? "Đang tạo..." : "Tạo phòng"}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

function ImageUploadPanel({
  filePreviews,
  coverIndex,
  onCoverChange,
  onFilesChange,
  onRemove,
}: {
  filePreviews: Array<{ name: string; size: number; previewUrl: string }>;
  coverIndex: number;
  onCoverChange: (index: number) => void;
  onFilesChange: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[#decdb9] bg-white/78 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <UploadCloud className="mt-0.5 h-6 w-6 text-[#9b5c24]" />
        <div>
          <h4 className="text-base font-black text-[#211a14]">Hình ảnh phòng</h4>
        </div>
      </div>

      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onFilesChange(Array.from(event.dataTransfer.files));
        }}
        className="mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#cdb99f] bg-[#fffaf2] px-6 py-8 text-center transition hover:border-[#9b5c24] hover:bg-[#f8eddd]"
      >
        <span className="grid size-14 place-items-center rounded-full border-4 border-[#eadfcd] bg-white text-[#9b5c24]">
          <ImagePlus className="h-8 w-8" />
        </span>
        <span className="mt-4 text-lg font-semibold text-[#211a14]">
          Kéo thả tối thiểu 1 ảnh vào đây hoặc
        </span>
        <span className="mt-3 rounded-full border border-[#decdb9] bg-white px-5 py-2 text-sm font-bold text-[#9b5c24] shadow-sm">
          Chọn tệp ảnh
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => onFilesChange(Array.from(event.target.files ?? []))}
        />
      </label>

      {filePreviews.length > 0 ? (
        <div className="mt-5">
          <p className="text-base font-black text-[#211a14]">
            Ảnh đã chọn ({filePreviews.length})
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {filePreviews.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className={`group relative w-36 overflow-hidden rounded-xl border bg-[#f8fbff] ${
                  coverIndex === index
                    ? "border-[#9b5c24] ring-2 ring-[#9b5c24]/20"
                    : "border-[#decdb9]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="absolute top-2 right-2 z-10 grid size-7 place-items-center rounded-full bg-white/92 text-[#211a14] shadow transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Bỏ ảnh"
                >
                  <X className="h-4 w-4" />
                </button>
                {coverIndex === index ? (
                  <span className="absolute top-2 left-2 z-10 rounded-full bg-[#21170f]/90 px-2 py-0.5 text-[10px] font-black text-white uppercase">
                    Cover
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => onCoverChange(index)}
                  className="block w-full text-left"
                >
                  <img
                    src={file.previewUrl}
                    alt={file.name}
                    className="h-28 w-full object-cover"
                  />
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-[#211a14]">
                      {file.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[#75695d]">{file.size} KB</p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
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

function PriceInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
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
      />
      {isOpen && suggestions.length > 0 ? (
        <div className="absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-2xl border border-[#decdb9] bg-white shadow-[0_18px_45px_-28px_rgba(33,23,15,0.65)]">
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

function Alert({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: React.ReactNode;
}) {
  const message = typeof children === "string" ? children : String(children ?? "");
  return tone === "success" ? <ToastBridge success={message} /> : <ToastBridge error={message} />;
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
