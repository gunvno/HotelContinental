"use client";

import {
  BedDouble,
  Building2,
  ImagePlus,
  Layers3,
  Save,
  UploadCloud,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { usePermission } from "@/hooks/use-permission";
import {
  type BuildingResponse,
  deleteRoomImage,
  type FloorResponse,
  getBuildings,
  getFloorsByBuilding,
  getRoom,
  getRoomTypes,
  type RoomResponse,
  type RoomTypeResponse,
  updateRoom,
  uploadRoomImages,
} from "@/services/room-service";

type RoomFormState = {
  roomTypeId: string;
  floorId: string;
  name: string;
  pricePerDay: string;
  pricePerHour: string;
  roomSize: string;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
  description: string;
};

type DisplayImage = {
  id?: string;
  url: string;
  label: string;
  isCover?: boolean;
};

const statusOptions = [
  { value: "AVAILABLE", label: "Sẵn sàng" },
  { value: "OCCUPIED", label: "Đang ở" },
  { value: "RESERVED", label: "Đã giữ" },
  { value: "MAINTENANCE", label: "Bảo trì" },
] as const;

const statusClassName: Record<RoomFormState["status"], string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700",
  OCCUPIED: "bg-blue-50 text-blue-700",
  RESERVED: "bg-amber-50 text-amber-700",
  MAINTENANCE: "bg-red-50 text-red-700",
};

export function RoomDetailPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const permission = usePermission();
  const id = params.id;

  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [form, setForm] = useState<RoomFormState>(createEmptyForm());
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadDetail();
  }, [id]);

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

  const selectedImagePreviews = useMemo(
    () =>
      selectedImageFiles.map((file) => ({
        name: file.name,
        size: Math.max(1, Math.round(file.size / 1024)),
        previewUrl: URL.createObjectURL(file),
      })),
    [selectedImageFiles],
  );

  useEffect(() => {
    return () => {
      selectedImagePreviews.forEach((file) => URL.revokeObjectURL(file.previewUrl));
    };
  }, [selectedImagePreviews]);

  const roomImages = useMemo(() => buildRoomImages(room), [room]);
  const activeImage =
    roomImages[Math.min(activeImageIndex, Math.max(roomImages.length - 1, 0))];
  const selectedFloor = floors.find((floor) => floor.id === form.floorId);
  const selectedBuilding = buildings.find(
    (building) => building.id === selectedFloor?.buildingId,
  );
  const selectedRoomType = roomTypes.find((roomType) => roomType.id === form.roomTypeId);
  const canUpdateRoom = permission.has("ROOM_UPDATE");
  const canUploadImages = permission.has("ROOM_IMAGE_UPDATE");
  const canDeleteImages = permission.has("ROOM_IMAGE_DELETE");
  const canUseDetail = permission.hasAny(
    "ROOM_UPDATE",
    "ROOM_IMAGE_UPDATE",
    "ROOM_IMAGE_DELETE",
  );
  const isActionBusy = isSaving || deletingImageId !== null;

  useEffect(() => {
    if (activeImageIndex >= roomImages.length) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, roomImages.length]);

  async function loadDetail() {
    try {
      setIsLoading(true);
      setError(null);

      const [roomDetail, roomTypeResult, buildingResult] = await Promise.all([
        getRoom(id),
        getRoomTypes(0, 500),
        getBuildings(),
      ]);
      const floorEntries = await Promise.all(
        buildingResult.map(
          async (building) =>
            [building.id, await getFloorsByBuilding(building.id)] as const,
        ),
      );

      setRoom(roomDetail);
      setForm(toRoomForm(roomDetail));
      setRoomTypes(roomTypeResult.data);
      setBuildings(buildingResult);
      setFloors(floorEntries.flatMap(([, buildingFloors]) => buildingFloors));
      setSelectedImageFiles([]);
      setCoverIndex(0);
      setActiveImageIndex(0);
    } catch (loadError) {
      console.error(loadError);
      setError(
        "Không tải được chi tiết phòng. Kiểm tra gateway, room-service và token ADMIN.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function setValue<K extends keyof RoomFormState>(key: K, value: RoomFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageFiles(files: File[]) {
    const maxImageSize = 30 * 1024 * 1024;
    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= maxImageSize,
    );
    const nextFiles = [...selectedImageFiles, ...validFiles].slice(0, 10);

    if (files.length > 0 && validFiles.length === 0) {
      setError("Vui lòng chọn ảnh jpg, jpeg hoặc png, mỗi ảnh không quá 30MB.");
      return;
    }

    if (
      files.length !== validFiles.length ||
      selectedImageFiles.length + validFiles.length > 10
    ) {
      setError("Một số ảnh không hợp lệ hoặc vượt quá giới hạn 10 ảnh đã bị bỏ qua.");
    } else {
      setError(null);
    }

    setSelectedImageFiles(nextFiles);
    setCoverIndex(Math.min(coverIndex, Math.max(nextFiles.length - 1, 0)));
  }

  function removeSelectedImage(index: number) {
    const nextFiles = selectedImageFiles.filter((_, fileIndex) => fileIndex !== index);
    setSelectedImageFiles(nextFiles);
    setCoverIndex(Math.max(0, Math.min(coverIndex, nextFiles.length - 1)));
  }

  async function handleDeleteExistingImage(imageId: string) {
    if (isActionBusy) {
      return;
    }

    try {
      setDeletingImageId(imageId);
      setError(null);
      await deleteRoomImage(id, imageId);
      const updatedRoom = await getRoom(id);
      setRoom(updatedRoom);
      setForm(toRoomForm(updatedRoom));
      setMessage("Đã xóa ảnh phòng.");
      router.refresh();
    } catch (deleteError) {
      console.error(deleteError);
      setError("Không thể xóa ảnh phòng. Kiểm tra quyền ADMIN và API room-service.");
    } finally {
      setDeletingImageId(null);
    }
  }

  async function handleSave() {
    if (isActionBusy) return;
    try {
      setIsSaving(true);
      setError(null);

      let updatedRoom = await updateRoom(id, {
        roomTypeId: form.roomTypeId,
        floorId: form.floorId,
        name: form.name.trim(),
        pricePerDay: Number(form.pricePerDay || 0),
        pricePerHour: Number(form.pricePerHour || 0),
        roomSize: form.roomSize.trim(),
        status: form.status,
        description: form.description.trim(),
      });

      if (selectedImageFiles.length > 0) {
        await uploadRoomImages(id, selectedImageFiles, coverIndex);
        updatedRoom = await getRoom(id);
      }

      setRoom(updatedRoom);
      setForm(toRoomForm(updatedRoom));
      setSelectedImageFiles([]);
      setCoverIndex(0);
      setIsEditing(false);
      setMessage("Đã cập nhật chi tiết phòng.");
      router.refresh();
    } catch (saveError) {
      console.error(saveError);
      setError("Không thể lưu thay đổi. Kiểm tra dữ liệu nhập và quyền ADMIN.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-[1.75rem] border border-[#decdb9] bg-white/78 p-10 text-center font-bold text-[#75695d]">
        Đang tải chi tiết phòng...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-8 text-red-700">
        {error || "Không tìm thấy phòng."}
      </div>
    );
  }

  if (!canUseDetail) {
    return <PermissionDenied message="Bạn không có quyền xem/sửa chi tiết phòng." />;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/rooms"
        className="inline-flex h-11 items-center justify-center rounded-full border border-[#decdb9] bg-white/80 px-5 text-sm font-bold tracking-[0.16em] text-[#211a14] uppercase shadow-sm transition hover:bg-[#fffaf2]"
      >
        ← Quay lại
      </Link>

      <section className="relative overflow-hidden rounded-[2rem] border border-[#decdb9] bg-[#21170f] p-6 text-white shadow-[0_30px_80px_-52px_rgba(33,23,15,0.95)] lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(232,201,144,0.33),transparent_28%),radial-gradient(circle_at_88%_6%,rgba(255,255,255,0.12),transparent_24%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.32em] text-[#e8c990] uppercase">
              Room detail
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-none font-bold tracking-tight lg:text-7xl">
              Phòng {room.name}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#eadbc4]">
              {selectedRoomType?.name || "Chưa gán loại phòng"} ·{" "}
              {selectedBuilding?.name || "Chưa gán tòa nhà"} ·{" "}
              {selectedFloor ? `Tầng ${selectedFloor.floorNumber}` : "Chưa gán tầng"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canUpdateRoom ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (isEditing) {
                    setForm(toRoomForm(room));
                    setSelectedImageFiles([]);
                    setCoverIndex(0);
                  }
                  setIsEditing((value) => !value);
                }}
                disabled={isActionBusy}
                className="border-white/15 bg-white/10 text-white hover:bg-white/15"
              >
                {isEditing ? "Hủy sửa" : "Chỉnh sửa"}
              </Button>
            ) : null}
            {isEditing && canUpdateRoom ? (
              <Button type="button" onClick={handleSave} disabled={isActionBusy}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {message ? <Alert tone="success">{message}</Alert> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard
          icon={<Building2 className="h-5 w-5" />}
          label="Tòa nhà"
          value={selectedBuilding?.name || "Chưa gán"}
        />
        <MetricCard
          icon={<Layers3 className="h-5 w-5" />}
          label="Tầng"
          value={selectedFloor ? `Tầng ${selectedFloor.floorNumber}` : "Chưa gán"}
        />
        <MetricCard
          icon={<BedDouble className="h-5 w-5" />}
          label="Loại phòng"
          value={selectedRoomType?.name || "Chưa gán"}
        />
        <MetricCard
          icon={<BedDouble className="h-5 w-5" />}
          label="Trạng thái"
          value={
            statusOptions.find((item) => item.value === form.status)?.label || form.status
          }
        />
      </section>

      <section className="grid gap-5 rounded-[1.75rem] border border-[#decdb9] bg-white/78 p-6 shadow-sm lg:grid-cols-2">
        <FormField label="Loại phòng">
          {isEditing ? (
            <Select
              value={form.roomTypeId}
              onValueChange={(value) => setValue("roomTypeId", value)}
              placeholder="Chọn loại phòng"
              options={[
                { value: "", label: "Chọn loại phòng" },
                ...roomTypes.map((roomType) => ({
                  value: roomType.id,
                  label: roomType.name,
                })),
              ]}
            />
          ) : (
            <ReadOnlyValue>{selectedRoomType?.name || "Chưa gán"}</ReadOnlyValue>
          )}
        </FormField>

        <FormField label="Vị trí tòa/tầng">
          {isEditing ? (
            <Select
              value={form.floorId}
              onValueChange={(value) => setValue("floorId", value)}
              placeholder="Chọn tầng"
              options={[
                { value: "", label: "Chọn tầng" },
                ...floors.map((floor) => {
                  const building = buildings.find((item) => item.id === floor.buildingId);
                  return {
                    value: floor.id,
                    label: `${building?.name || "Tòa nhà"} - Tầng ${floor.floorNumber}`,
                  };
                }),
              ]}
            />
          ) : (
            <ReadOnlyValue>
              {selectedBuilding?.name || "Chưa gán tòa nhà"} ·{" "}
              {selectedFloor ? `Tầng ${selectedFloor.floorNumber}` : "Chưa gán tầng"}
            </ReadOnlyValue>
          )}
        </FormField>

        <FormField label="Tên phòng">
          {isEditing ? (
            <Input
              value={form.name}
              onChange={(event) => setValue("name", event.target.value)}
              className="h-11 rounded-xl border-[#eadfcd]"
            />
          ) : (
            <ReadOnlyValue>{form.name || "-"}</ReadOnlyValue>
          )}
        </FormField>

        <FormField label="Trạng thái">
          {isEditing ? (
            <Select
              value={form.status}
              onValueChange={(value) =>
                setValue("status", value as RoomFormState["status"])
              }
              options={statusOptions.map((status) => ({
                value: status.value,
                label: status.label,
              }))}
            />
          ) : (
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-black ${statusClassName[form.status]}`}
            >
              {statusOptions.find((item) => item.value === form.status)?.label ||
                form.status}
            </span>
          )}
        </FormField>

        <FormField label="Giá theo ngày">
          {isEditing ? (
            <Input
              type="number"
              value={form.pricePerDay}
              onChange={(event) => setValue("pricePerDay", event.target.value)}
              className="h-11 rounded-xl border-[#eadfcd]"
            />
          ) : (
            <ReadOnlyValue>{formatCurrency(form.pricePerDay)}</ReadOnlyValue>
          )}
        </FormField>

        <FormField label="Giá theo giờ">
          {isEditing ? (
            <Input
              type="number"
              value={form.pricePerHour}
              onChange={(event) => setValue("pricePerHour", event.target.value)}
              className="h-11 rounded-xl border-[#eadfcd]"
            />
          ) : (
            <ReadOnlyValue>{formatCurrency(form.pricePerHour)}</ReadOnlyValue>
          )}
        </FormField>

        <FormField label="Diện tích">
          {isEditing ? (
            <Input
              value={form.roomSize}
              onChange={(event) => setValue("roomSize", event.target.value)}
              className="h-11 rounded-xl border-[#eadfcd]"
            />
          ) : (
            <ReadOnlyValue>{form.roomSize || "-"}</ReadOnlyValue>
          )}
        </FormField>

        <FormField label="ID phòng">
          <ReadOnlyValue>{room.id || id}</ReadOnlyValue>
        </FormField>

        <div className="lg:col-span-2">
          <FormField label="Mô tả">
            {isEditing ? (
              <textarea
                value={form.description}
                onChange={(event) => setValue("description", event.target.value)}
                className="min-h-32 w-full rounded-xl border border-[#eadfcd] bg-white px-4 py-3 text-sm font-semibold text-gray-950 outline-none focus:border-[#c47a34] focus:ring-2 focus:ring-[#c47a34]/25"
              />
            ) : (
              <ReadOnlyValue>{form.description || "-"}</ReadOnlyValue>
            )}
          </FormField>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[#decdb9] bg-white/78 p-6 shadow-sm">
        <h3 className="font-serif text-3xl font-bold text-[#211a14]">Ảnh phòng</h3>
        {activeImage ? (
          <div className="mt-4 space-y-4">
            <img
              src={activeImage.url}
              alt={activeImage.label}
              className="max-h-[440px] w-full rounded-2xl object-cover"
            />
            <div className="flex gap-3 overflow-x-auto pb-1">
              {roomImages.map((image, index) => (
                <div
                  key={`${image.url}-${index}`}
                  className={`relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border bg-[#fffaf2] transition ${
                    activeImageIndex === index
                      ? "border-[#c47a34] ring-2 ring-[#c47a34]/25"
                      : "border-[#decdb9] hover:border-[#c47a34]/70"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className="block size-full"
                  >
                    <img
                      src={image.url}
                      alt={image.label}
                      className="size-full object-cover"
                    />
                  </button>
                  {image.isCover ? (
                    <span className="absolute top-2 left-2 rounded-full bg-[#21170f]/85 px-2 py-0.5 text-[10px] font-black text-white uppercase">
                      Cover
                    </span>
                  ) : null}
                  {canDeleteImages && image.id ? (
                    <button
                      type="button"
                      onClick={() => void handleDeleteExistingImage(image.id!)}
                      disabled={isActionBusy}
                      className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-white/92 text-[#211a14] shadow transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Xóa ảnh phòng"
                    >
                      {deletingImageId === image.id ? (
                        <span className="text-[10px] font-black">...</span>
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-[#decdb9] bg-[#fffaf2] px-4 py-12 text-center text-sm font-bold text-[#75695d]">
            Chưa có ảnh phòng.
          </div>
        )}

        {isEditing && canUploadImages ? (
          <div className="mt-5 rounded-[1.5rem] border border-[#decdb9] bg-[#fffaf2] p-5 shadow-[0_14px_40px_-30px_rgba(33,23,15,0.55)]">
            <div className="flex items-start gap-3">
              <UploadCloud className="mt-0.5 h-6 w-6 text-[#a86424]" />
              <div>
                <h4 className="text-base font-black text-[#211a14]">Hình ảnh phòng</h4>
                <p className="mt-1 flex items-center gap-1 text-sm font-medium text-[#75695d]">
                  <UploadCloud className="h-4 w-4 text-[#a86424]" />
                  Tải ảnh từ máy tính
                </p>
              </div>
            </div>

            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleImageFiles(Array.from(event.dataTransfer.files));
              }}
              className="mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#d9b98f] bg-[#fff8ed] px-6 py-8 text-center transition hover:border-[#c47a34] hover:bg-[#fff2df]"
            >
              <span className="grid size-14 place-items-center rounded-full border-4 border-[#eadfcd] bg-white text-[#9b5c24]">
                <ImagePlus className="h-8 w-8" />
              </span>
              <span className="mt-4 text-lg font-semibold text-[#211a14]">
                Kéo thả tối thiểu 1 ảnh vào đây hoặc
              </span>
              <span className="mt-3 rounded-full border border-[#d9b98f] bg-white px-5 py-2 text-sm font-bold text-[#9b5c24] shadow-sm">
                Chọn tệp ảnh
              </span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                multiple
                className="sr-only"
                onChange={(event) =>
                  handleImageFiles(Array.from(event.target.files ?? []))
                }
              />
            </label>

            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[#75695d]">
              <li>Hỗ trợ jpg, jpeg, png. Tối đa 10 ảnh.</li>
              <li>Ảnh được chọn làm cover sẽ thay ảnh đại diện phòng sau khi lưu.</li>
            </ul>

            {selectedImagePreviews.length > 0 ? (
              <div className="mt-5">
                <p className="text-base font-black text-[#211a14]">
                  Ảnh đã chọn ({selectedImagePreviews.length})
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {selectedImagePreviews.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className={`group relative overflow-hidden rounded-xl border bg-white ${
                        coverIndex === index
                          ? "border-[#c47a34] ring-2 ring-[#c47a34]/20"
                          : "border-[#decdb9]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(index)}
                        className="absolute top-2 right-2 z-10 grid size-7 place-items-center rounded-full bg-white/90 text-[#211a14] shadow transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Bỏ ảnh"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverIndex(index)}
                        className="block w-full text-left"
                      >
                        <img
                          src={file.previewUrl}
                          alt={file.name}
                          className="h-28 w-full object-cover"
                        />
                        <div className="space-y-1 px-3 py-2">
                          <p className="truncate text-sm font-semibold text-[#211a14]">
                            {file.name}
                          </p>
                          <p className="text-xs text-[#75695d]">{file.size} KB</p>
                          <p
                            className={`text-xs font-bold ${coverIndex === index ? "text-[#9b5c24]" : "text-[#8f7c69]"}`}
                          >
                            {coverIndex === index ? "Ảnh cover" : "Bấm để chọn cover"}
                          </p>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function createEmptyForm(): RoomFormState {
  return {
    roomTypeId: "",
    floorId: "",
    name: "",
    pricePerDay: "0",
    pricePerHour: "0",
    roomSize: "",
    status: "AVAILABLE",
    description: "",
  };
}

function toRoomForm(room: RoomResponse): RoomFormState {
  return {
    roomTypeId: room.roomTypeId ?? room.roomTypes?.id ?? "",
    floorId: room.floorId ?? "",
    name: room.name ?? "",
    pricePerDay: String(room.pricePerDay ?? 0),
    pricePerHour: String(room.pricePerHour ?? 0),
    roomSize: room.roomSize ?? "",
    status: normalizeRoomStatus(room.status),
    description: room.description ?? "",
  };
}

function normalizeRoomStatus(status?: string): RoomFormState["status"] {
  if (status === "OCCUPIED" || status === "RESERVED" || status === "MAINTENANCE") {
    return status;
  }

  return "AVAILABLE";
}

function buildRoomImages(room: RoomResponse | null): DisplayImage[] {
  if (!room) {
    return [];
  }

  const imageMap = new Map<string, DisplayImage>();
  const addImage = (url?: string, label = "Ảnh phòng", isCover = false, id?: string) => {
    if (!url) {
      return;
    }

    const existingImage = imageMap.get(url);
    imageMap.set(url, {
      id: id ?? existingImage?.id,
      url,
      label: existingImage?.label ?? label,
      isCover: isCover || existingImage?.isCover,
    });
  };

  addImage(room.image, "Ảnh cover", true);
  [...(room.images ?? [])]
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
    .forEach((image, index) =>
      addImage(
        image.url,
        image.isCover ? "Ảnh cover" : `Ảnh ${index + 1}`,
        image.isCover,
        image.id,
      ),
    );
  (room.galleryImages ?? []).forEach((url, index) => addImage(url, `Ảnh ${index + 1}`));

  return Array.from(imageMap.values());
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block text-sm font-bold text-[#5f5144]">{label}</Label>
      {children}
    </div>
  );
}

function ReadOnlyValue({ children }: { children: React.ReactNode }) {
  return (
    <p className="min-h-11 rounded-xl border border-[#eadfcd] bg-[#fffaf2] px-4 py-3 text-sm font-semibold text-[#211a14]">
      {children}
    </p>
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
      <p className="mt-4 line-clamp-2 text-xl font-black tracking-tight text-[#211a14]">
        {value}
      </p>
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
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
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
