"use client";

import Link from "next/link";
import { ImagePlus, UploadCloud, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteRoomImage,
  getAmenities,
  getAmenity,
  getAmenityRoom,
  getRoom,
  getRoomType,
  getRoomTypes,
  getRoomTypeService,
  type AmenityResponse,
  type AmenityRoomResponse,
  type RoomResponse,
  type RoomTypeResponse,
  type RoomTypeServiceResponse,
  updateAmenity,
  updateAmenityRoom,
  updateRoom,
  updateRoomType,
  updateRoomTypeService,
  uploadRoomImages,
} from "@/services/room-service";

type EntityKind = "room-type" | "amenity" | "amenity-room" | "room-type-service" | "room";

type DetailEntity = RoomTypeResponse | AmenityResponse | AmenityRoomResponse | RoomTypeServiceResponse | RoomResponse;

type FormState = Record<string, string | number | boolean>;

const backHrefByKind: Record<EntityKind, string> = {
  "room-type": "/admin/room-types",
  amenity: "/admin/amenities",
  "amenity-room": "/admin/amenity-rooms",
  "room-type-service": "/admin/room-type-services",
  room: "/rooms",
};

const titleByKind: Record<EntityKind, string> = {
  "room-type": "Chi tiết loại phòng",
  amenity: "Chi tiết cơ sở vật chất",
  "amenity-room": "Chi tiết gán cơ sở vật chất",
  "room-type-service": "Chi tiết dịch vụ theo loại phòng",
  room: "Chi tiết phòng",
};

export function AdminEntityDetailPage({ kind }: { kind: EntityKind }) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [entity, setEntity] = useState<DetailEntity | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [amenities, setAmenities] = useState<AmenityResponse[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [activeRoomImageIndex, setActiveRoomImageIndex] = useState(0);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadDetail();
  }, [id, kind]);

  const loadDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [detail, roomTypeResult, amenityResult] = await Promise.all([
        loadEntity(kind, id),
        kind === "amenity-room" || kind === "room-type-service" || kind === "room" ? getRoomTypes(0, 500) : Promise.resolve({ data: [], total: 0 }),
        kind === "amenity-room" ? getAmenities(0, 500) : Promise.resolve({ data: [], total: 0 }),
      ]);
      setEntity(detail);
      setForm(toForm(kind, detail));
      setRoomTypes(roomTypeResult.data);
      setAmenities(amenityResult.data);
      setSelectedImageFiles([]);
      setCoverIndex(0);
      setActiveRoomImageIndex(0);
    } catch (loadError) {
      console.error(loadError);
      setError("Không tải được dữ liệu chi tiết.");
    } finally {
      setIsLoading(false);
    }
  };

  const fields = useMemo(() => buildFields(kind, form, roomTypes, amenities), [amenities, form, kind, roomTypes]);
  const selectedImagePreviews = useMemo(
    () =>
      selectedImageFiles.map((file) => ({
        name: file.name,
        size: Math.round(file.size / 1024),
        previewUrl: URL.createObjectURL(file),
      })),
    [selectedImageFiles],
  );
  const roomImages = useMemo(() => {
    if (kind !== "room" || !entity) {
      return [];
    }

    const room = entity as RoomResponse;
    const imageMap = new Map<string, { id?: string; url: string; label: string; isCover?: boolean }>();
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
      .forEach((image, index) => addImage(image.url, image.isCover ? "Ảnh cover" : `Ảnh ${index + 1}`, image.isCover, image.id));
    (room.galleryImages ?? []).forEach((url, index) => addImage(url, `Ảnh ${index + 1}`));

    return Array.from(imageMap.values());
  }, [entity, kind]);
  const activeRoomImage = roomImages[Math.min(activeRoomImageIndex, Math.max(roomImages.length - 1, 0))];

  useEffect(() => {
    return () => {
      selectedImagePreviews.forEach((file) => URL.revokeObjectURL(file.previewUrl));
    };
  }, [selectedImagePreviews]);

  useEffect(() => {
    if (activeRoomImageIndex >= roomImages.length) {
      setActiveRoomImageIndex(0);
    }
  }, [activeRoomImageIndex, roomImages.length]);

  const setValue = (key: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageFiles = (files: File[]) => {
    const maxImageSize = 30 * 1024 * 1024;
    const imageFiles = files
      .filter((file) => file.type.startsWith("image/") && file.size <= maxImageSize)
      .slice(0, 10);

    if (files.length > 0 && imageFiles.length === 0) {
      setError("Vui lòng chọn file ảnh đúng định dạng jpg, jpeg, png và dung lượng không quá 30MB.");
      return;
    }

    if (files.length > imageFiles.length) {
      setError("Một số file không hợp lệ đã bị bỏ qua. Chỉ nhận tối đa 10 ảnh jpg, jpeg, png, mỗi ảnh không quá 30MB.");
    } else {
      setError(null);
    }

    setSelectedImageFiles(imageFiles);
    setCoverIndex(0);
  };

  const handleDeleteExistingImage = async (imageId: string) => {
    if (deletingImageId) {
      return;
    }

    try {
      setDeletingImageId(imageId);
      setError(null);
      await deleteRoomImage(id, imageId);
      const updated = await loadEntity(kind, id);
      setEntity(updated);
      setForm(toForm(kind, updated));
      setActiveRoomImageIndex(0);
      setMessage("Đã xóa ảnh phòng thành công.");
      router.refresh();
    } catch (deleteError) {
      console.error(deleteError);
      setError("Không thể xóa ảnh phòng. Kiểm tra quyền ADMIN và API room-service.");
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const shouldUploadImages = kind === "room" && selectedImageFiles.length > 0;
      let updated = await saveEntity(kind, id, form);
      if (shouldUploadImages) {
        await uploadRoomImages(id, selectedImageFiles, coverIndex);
        updated = await loadEntity(kind, id);
        setSelectedImageFiles([]);
        setCoverIndex(0);
      }
      setEntity(updated);
      setForm(toForm(kind, updated));
      setIsEditing(false);
      setMessage(shouldUploadImages ? "Đã cập nhật thông tin và ảnh phòng thành công." : "Đã cập nhật thành công.");
      router.refresh();
    } catch (saveError) {
      console.error(saveError);
      setError("Không thể lưu thay đổi. Kiểm tra dữ liệu và quyền ADMIN.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="rounded-3xl border border-[#decdb9] bg-white/80 p-8 text-[#5f5144]">Đang tải dữ liệu...</div>;
  }

  if (!entity) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
        {error || "Không tìm thấy dữ liệu."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={backHrefByKind[kind]}
        className="inline-flex h-11 items-center justify-center rounded-full border border-[#decdb9] bg-white/80 px-5 text-sm font-bold uppercase tracking-[0.16em] text-[#211a14] shadow-sm transition hover:bg-[#fffaf2]"
      >
        ← Quay lại
      </Link>

      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-[#decdb9] bg-white/80 p-6 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <Link href={backHrefByKind[kind]} className="text-sm font-semibold text-[#8b5e22] hover:underline">
            Quay lại danh sách
          </Link>
          <h2 className="mt-3 font-serif text-4xl font-bold text-[#211a14]">{titleByKind[kind]}</h2>
          <p className="mt-2 text-sm text-[#75695d]">ID: {id}</p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsEditing((value) => {
                const nextValue = !value;
                if (!nextValue) {
                  setSelectedImageFiles([]);
                  setCoverIndex(0);
                }
                return nextValue;
              });
            }}
          >
            {isEditing ? "Hủy sửa" : "Chỉnh sửa"}
          </Button>
          {isEditing ? (
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          ) : null}
        </div>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {message ? <Alert tone="success">{message}</Alert> : null}

      <section className="grid gap-5 rounded-[1.75rem] border border-[#decdb9] bg-white/78 p-6 shadow-sm lg:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className={field.type === "textarea" ? "lg:col-span-2" : undefined}>
            <Label className="text-sm font-bold text-[#5f5144]">{field.label}</Label>
            {isEditing ? (
              <EditableField field={field} value={form[field.key]} onChange={(value) => setValue(field.key, value)} />
            ) : (
              <p className="mt-2 min-h-11 rounded-xl border border-[#eadfcd] bg-[#fffaf2] px-4 py-3 text-sm font-semibold text-[#211a14]">
                {formatValue(field, form[field.key])}
              </p>
            )}
          </div>
        ))}
      </section>

      {kind === "room" ? (
        <section className="rounded-[1.75rem] border border-[#decdb9] bg-white/78 p-6 shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-[#211a14]">Ảnh phòng</h3>
          {activeRoomImage ? (
            <div className="mt-4 space-y-4">
              <img src={activeRoomImage.url} alt={activeRoomImage.label} className="max-h-[420px] w-full rounded-2xl object-cover" />
              {roomImages.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {roomImages.map((image, index) => (
                    <div
                      key={image.url}
                      className={`relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border bg-[#fffaf2] transition ${
                        activeRoomImageIndex === index ? "border-[#c47a34] ring-2 ring-[#c47a34]/25" : "border-[#decdb9] hover:border-[#c47a34]/70"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveRoomImageIndex(index)}
                        className="block size-full"
                      >
                        <img src={image.url} alt={image.label} className="size-full object-cover" />
                      </button>
                      {image.isCover ? (
                        <span className="absolute left-2 top-2 rounded-full bg-[#21170f]/85 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                          Cover
                        </span>
                      ) : null}
                      {isEditing && image.id ? (
                        <button
                          type="button"
                          onClick={() => void handleDeleteExistingImage(image.id!)}
                          disabled={deletingImageId === image.id}
                          className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/92 text-[#211a14] shadow transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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
              ) : null}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-[#decdb9] bg-[#fffaf2] px-4 py-12 text-center text-sm font-bold text-[#75695d]">
              Chưa có ảnh phòng.
            </div>
          )}

          {isEditing ? (
            <div className="mt-5 rounded-[1.5rem] border border-[#dce8f5] bg-white p-5 shadow-[0_14px_40px_-30px_rgba(21,42,74,0.5)]">
              <div className="flex items-start gap-3">
                <UploadCloud className="mt-0.5 h-6 w-6 text-[#0ea5e9]" />
                <div>
                  <h4 className="text-base font-black text-[#07152b]">Hình ảnh phòng</h4>
                  <p className="mt-1 flex items-center gap-1 text-sm font-medium text-[#5c6f8d]">
                    <UploadCloud className="h-4 w-4 text-[#0ea5e9]" />
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
                className="mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#8fc7ff] bg-[#f8fcff] px-6 py-8 text-center transition hover:border-[#0ea5e9] hover:bg-[#f2f9ff]"
              >
                <span className="grid size-14 place-items-center rounded-full border-4 border-[#d8e3ef] bg-white text-[#738095]">
                  <ImagePlus className="h-8 w-8" />
                </span>
                <span className="mt-4 text-lg font-semibold text-[#243654]">
                  Kéo thả tối thiểu 1 ảnh vào đây hoặc
                </span>
                <span className="mt-3 rounded-full border border-[#75bfff] bg-white px-5 py-2 text-sm font-bold text-[#0284c7] shadow-sm">
                  Chọn tệp ảnh
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  className="sr-only"
                  onChange={(event) => handleImageFiles(Array.from(event.target.files ?? []))}
                />
              </label>

              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[#536989]">
                <li>Hỗ trợ jpg, jpeg, png. Tối đa 10 ảnh.</li>
                <li>Kích thước mỗi ảnh tối đa 30MB. Ảnh cover sẽ thay ảnh đại diện phòng.</li>
              </ul>

              {selectedImagePreviews.length > 0 ? (
                <div className="mt-5">
                  <p className="text-base font-black text-[#07152b]">Ảnh đã chọn ({selectedImagePreviews.length})</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {selectedImagePreviews.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className={`group relative overflow-hidden rounded-xl border bg-[#f8fbff] ${
                          coverIndex === index ? "border-[#0ea5e9] ring-2 ring-[#0ea5e9]/20" : "border-[#d7e4f2]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const nextFiles = selectedImageFiles.filter((_, fileIndex) => fileIndex !== index);
                            setSelectedImageFiles(nextFiles);
                            setCoverIndex(Math.max(0, Math.min(coverIndex, nextFiles.length - 1)));
                          }}
                          className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-white/90 text-[#243654] shadow transition hover:bg-red-50 hover:text-red-600"
                          aria-label="Bỏ ảnh"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCoverIndex(index)}
                          className="block w-full text-left"
                        >
                          <img src={file.previewUrl} alt={file.name} className="h-28 w-full object-cover" />
                          <div className="space-y-1 px-3 py-2">
                            <p className="truncate text-sm font-semibold text-[#243654]">{file.name}</p>
                            <p className="text-xs text-[#6b7f9e]">{file.size} KB</p>
                            <p className={`text-xs font-bold ${coverIndex === index ? "text-[#0284c7]" : "text-[#8ca0bd]"}`}>
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
      ) : null}

      {kind !== "room" && "image" in entity && entity.image ? (
        <section className="rounded-[1.75rem] border border-[#decdb9] bg-white/78 p-6 shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-[#211a14]">Ảnh phòng</h3>
          <img src={entity.image} alt={entity.name} className="mt-4 max-h-[360px] w-full rounded-2xl object-cover" />
        </section>
      ) : null}

    </div>
  );
}

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "boolean";
  options?: Array<{ label: string; value: string }>;
};

function EditableField({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
}) {
  if (field.type === "textarea") {
    return (
      <textarea
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-28 w-full rounded-xl border border-[#eadfcd] bg-white px-4 py-3 text-sm text-gray-950 outline-none focus:border-[#c47a34] focus:ring-2 focus:ring-[#c47a34]/25"
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-[#eadfcd] bg-white px-4 text-sm text-gray-950 outline-none focus:border-[#c47a34]"
      >
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "boolean") {
    return (
      <select
        value={value ? "true" : "false"}
        onChange={(event) => onChange(event.target.value === "true")}
        className="mt-2 h-11 w-full rounded-xl border border-[#eadfcd] bg-white px-4 text-sm text-gray-950 outline-none focus:border-[#c47a34]"
      >
        <option value="false">Hoạt động</option>
        <option value="true">Đã xóa</option>
      </select>
    );
  }

  return (
    <Input
      type={field.type === "number" ? "number" : "text"}
      value={String(value ?? "")}
      onChange={(event) => onChange(field.type === "number" ? Number(event.target.value) : event.target.value)}
      className="mt-2 h-11 rounded-xl border-[#eadfcd]"
    />
  );
}

function buildFields(kind: EntityKind, form: FormState, roomTypes: RoomTypeResponse[], amenities: AmenityResponse[]): FieldConfig[] {
  const roomTypeOptions = roomTypes.map((roomType) => ({ label: roomType.name, value: roomType.id }));
  const amenityOptions = amenities.map((amenity) => ({ label: amenity.name, value: amenity.id }));

  if (kind === "room-type") {
    return [
      { key: "name", label: "Tên loại" },
      { key: "description", label: "Mô tả", type: "textarea" },
      { key: "maximumOccupancy", label: "Số khách tối đa", type: "number" },
      { key: "quantity", label: "Số phòng", type: "number" },
      { key: "deleted", label: "Trạng thái", type: "boolean" },
    ];
  }

  if (kind === "amenity") {
    return [
      { key: "name", label: "Tên cơ sở vật chất" },
      { key: "description", label: "Mô tả", type: "textarea" },
      { key: "status", label: "Tình trạng", type: "select", options: [{ label: "Có sẵn", value: "AVAILABLE" }, { label: "Không có sẵn", value: "UNAVAILABLE" }] },
      { key: "deleted", label: "Trạng thái", type: "boolean" },
    ];
  }

  if (kind === "amenity-room") {
    return [
      { key: "roomTypeId", label: "Loại phòng", type: "select", options: roomTypeOptions },
      { key: "amenityId", label: "Cơ sở vật chất", type: "select", options: amenityOptions },
      { key: "amount", label: "Số lượng", type: "number" },
      { key: "deleted", label: "Trạng thái", type: "boolean" },
    ];
  }

  if (kind === "room-type-service") {
    return [
      { key: "roomTypeId", label: "Loại phòng", type: "select", options: roomTypeOptions },
      { key: "serviceId", label: "Mã dịch vụ" },
      { key: "amount", label: "Số lượng", type: "number" },
      { key: "deleted", label: "Trạng thái", type: "boolean" },
    ];
  }

  return [
    { key: "roomTypeId", label: "Loại phòng", type: "select", options: roomTypeOptions },
    { key: "name", label: "Tên phòng" },
    { key: "pricePerDay", label: "Giá theo ngày", type: "number" },
    { key: "pricePerHour", label: "Giá theo giờ", type: "number" },
    { key: "roomSize", label: "Diện tích" },
    { key: "status", label: "Trạng thái", type: "select", options: [
      { label: "Sẵn sàng", value: "AVAILABLE" },
      { label: "Đang ở", value: "OCCUPIED" },
      { label: "Đã giữ", value: "RESERVED" },
      { label: "Bảo trì", value: "MAINTENANCE" },
    ] },
    { key: "description", label: "Mô tả", type: "textarea" },
  ];
}

async function loadEntity(kind: EntityKind, id: string): Promise<DetailEntity> {
  if (kind === "room-type") return getRoomType(id);
  if (kind === "amenity") return getAmenity(id);
  if (kind === "amenity-room") return getAmenityRoom(id);
  if (kind === "room-type-service") return getRoomTypeService(id);
  return getRoom(id);
}

function toForm(kind: EntityKind, entity: DetailEntity): FormState {
  if (kind === "room-type") {
    const item = entity as RoomTypeResponse;
    return { name: item.name ?? "", description: item.description ?? "", maximumOccupancy: item.maximumOccupancy ?? 1, quantity: item.quantity ?? 0, deleted: !!item.deleted };
  }
  if (kind === "amenity") {
    const item = entity as AmenityResponse;
    return { name: item.name ?? "", description: item.description ?? "", status: item.status ?? "AVAILABLE", deleted: !!item.deleted };
  }
  if (kind === "amenity-room") {
    const item = entity as AmenityRoomResponse;
    return { roomTypeId: item.roomTypeId ?? "", amenityId: item.amenityId ?? "", amount: item.amount ?? 1, deleted: !!item.deleted };
  }
  if (kind === "room-type-service") {
    const item = entity as RoomTypeServiceResponse;
    return { roomTypeId: item.roomTypeId ?? "", serviceId: item.serviceId ?? "", amount: item.amount ?? 1, deleted: !!item.deleted };
  }
  const item = entity as RoomResponse;
  return {
    roomTypeId: item.roomTypeId ?? item.roomTypes?.id ?? "",
    floorId: item.floorId ?? "",
    name: item.name ?? "",
    pricePerDay: item.pricePerDay ?? 0,
    pricePerHour: item.pricePerHour ?? 0,
    description: item.description ?? "",
    roomSize: item.roomSize ?? "",
    status: item.status ?? "AVAILABLE",
  };
}

async function saveEntity(kind: EntityKind, id: string, form: FormState): Promise<DetailEntity> {
  if (kind === "room-type") {
    return updateRoomType(id, {
      name: String(form.name ?? ""),
      description: String(form.description ?? ""),
      maximumOccupancy: Number(form.maximumOccupancy ?? 1),
      quantity: Number(form.quantity ?? 0),
      deleted: Boolean(form.deleted),
    });
  }
  if (kind === "amenity") {
    return updateAmenity(id, {
      name: String(form.name ?? ""),
      description: String(form.description ?? ""),
      status: String(form.status ?? "AVAILABLE") as "AVAILABLE" | "UNAVAILABLE",
      deleted: Boolean(form.deleted),
    });
  }
  if (kind === "amenity-room") {
    return updateAmenityRoom(id, {
      roomTypeId: String(form.roomTypeId ?? ""),
      amenityId: String(form.amenityId ?? ""),
      amount: Number(form.amount ?? 1),
      deleted: Boolean(form.deleted),
    });
  }
  if (kind === "room-type-service") {
    return updateRoomTypeService(id, {
      roomTypeId: String(form.roomTypeId ?? ""),
      serviceId: String(form.serviceId ?? ""),
      amount: Number(form.amount ?? 1),
      deleted: Boolean(form.deleted),
    });
  }
  return updateRoom(id, {
    roomTypeId: String(form.roomTypeId ?? ""),
    floorId: String(form.floorId ?? ""),
    name: String(form.name ?? ""),
    pricePerDay: Number(form.pricePerDay ?? 0),
    pricePerHour: Number(form.pricePerHour ?? 0),
    description: String(form.description ?? ""),
    roomSize: String(form.roomSize ?? ""),
    status: String(form.status ?? "AVAILABLE") as "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE",
  });
}

function formatValue(field: FieldConfig, value: string | number | boolean | undefined) {
  if (field.type === "boolean") {
    return value ? "Đã xóa" : "Hoạt động";
  }
  if (field.type === "select") {
    return field.options?.find((option) => option.value === String(value))?.label ?? String(value ?? "-");
  }
  if (value === "" || value === undefined || value === null) {
    return "-";
  }
  return String(value);
}

function Alert({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
      tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"
    }`}>
      {children}
    </div>
  );
}
