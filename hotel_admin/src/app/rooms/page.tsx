"use client";

import { BedDouble, Camera, CheckCircle2, Hotel, MapPin, Plus, RefreshCw, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createRoom,
  type CreateRoomPayload,
  getAllRooms,
  getRoomTypes,
  type RoomResponse,
  type RoomTypeResponse,
  uploadRoomImages,
} from "@/services/room-service";

type FormState = {
  roomTypeId: string;
  name: string;
  pricePerDay: string;
  pricePerHour: string;
  address: string;
  description: string;
  roomSize: string;
};

const defaultFormState: FormState = {
  roomTypeId: "",
  name: "",
  pricePerDay: "",
  pricePerHour: "",
  address: "",
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
  const [view, setView] = useState<"list" | "create">("list");
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const [roomResult, roomTypeResult] = await Promise.all([getAllRooms(0, 100), getRoomTypes(0, 100)]);
      setRooms(roomResult.data);
      setRoomTypes(roomTypeResult.data);
      setForm((prev) => ({
        ...prev,
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
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.roomTypeId || !form.name.trim() || !form.address.trim() || !form.roomSize.trim()) {
      setError("Vui lòng chọn loại phòng và nhập tên phòng, vị trí, diện tích.");
      return;
    }

    const pricePerDay = Number(form.pricePerDay);
    const pricePerHour = Number(form.pricePerHour);

    if (!Number.isFinite(pricePerDay) || pricePerDay <= 0 || !Number.isFinite(pricePerHour) || pricePerHour <= 0) {
      setError("Giá theo ngày và giá theo giờ phải là số lớn hơn 0.");
      return;
    }

    const payload: CreateRoomPayload = {
      roomTypes: { id: form.roomTypeId },
      name: form.name.trim(),
      pricePerDay,
      pricePerHour,
      address: form.address.trim(),
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
          : `Đã tạo phòng "${result.name}"${selectedFiles.length ? ` và upload ${selectedFiles.length} ảnh` : ""}.`
      );
      setForm({ ...defaultFormState, roomTypeId: roomTypes[0]?.id || "" });
      setSelectedFiles([]);
      setCoverIndex(0);
      setView("list");
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
      <section className="relative overflow-hidden rounded-[2rem] border border-[#decdb9] bg-[#21170f] p-6 text-white shadow-[0_30px_80px_-52px_rgba(33,23,15,0.95)] dark:border-[#3a2e24] lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(232,201,144,0.33),transparent_28%),radial-gradient(circle_at_88%_6%,rgba(255,255,255,0.12),transparent_24%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#e8c990]">Room inventory</p>
            <h2 className="mt-3 font-[var(--font-cormorant)] text-5xl font-bold leading-none tracking-tight lg:text-7xl">
              Kho phòng
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#eadbc4]">
              Màn hình này nên dùng để tạo phòng vật lý, gắn loại phòng, giá bán và ảnh cover.
              Các nghiệp vụ sửa trạng thái, bảo trì, xóa mềm nên bổ sung ở bước tiếp theo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void loadInitialData()}
              className="border-white/15 bg-white/10 text-white hover:bg-white/15"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Button
              type="button"
              onClick={() => {
                setView("create");
                setError(null);
                setMessage(null);
              }}
              className="bg-[#e8c990] text-[#21170f] hover:bg-[#f2d9aa]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm phòng
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={<Hotel className="h-5 w-5" />} label="Tổng phòng" value={String(rooms.length)} />
        <MetricCard icon={<CheckCircle2 className="h-5 w-5" />} label="Sẵn sàng bán" value={String(availableRooms)} />
        <MetricCard icon={<BedDouble className="h-5 w-5" />} label="Giá trung bình/ngày" value={formatCurrency(averageDailyPrice)} />
      </section>

      <div className="flex flex-wrap gap-2 rounded-full border border-[#decdb9] bg-white/60 p-1 shadow-sm backdrop-blur dark:border-[#3a2e24] dark:bg-white/[0.05]">
        {[
          { key: "list", label: "Danh sách phòng" },
          { key: "create", label: "Tạo phòng mới" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setView(tab.key as "list" | "create");
              setError(null);
              setMessage(null);
            }}
            className={`rounded-full px-5 py-2 text-sm font-bold transition ${
              view === tab.key
                ? "bg-[#21170f] text-white shadow-md dark:bg-[#e8c990] dark:text-[#21170f]"
                : "text-[#75695d] hover:bg-white/70 dark:text-[#b7a99a] dark:hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {message ? <Alert tone="success">{message}</Alert> : null}

      {view === "list" ? (
        <RoomListView rooms={rooms} isLoading={isLoading} />
      ) : (
        <RoomCreateForm
          form={form}
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
          onReset={() => {
            setForm({ ...defaultFormState, roomTypeId: roomTypes[0]?.id || "" });
            setSelectedFiles([]);
            setCoverIndex(0);
            setError(null);
            setMessage(null);
          }}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#decdb9] bg-white/72 p-5 shadow-sm backdrop-blur dark:border-[#3a2e24] dark:bg-white/[0.05]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-[#75695d] dark:text-[#b7a99a]">{label}</p>
        <div className="rounded-2xl bg-[#eadfcd] p-3 text-[#9b5c24] dark:bg-[#2a211a] dark:text-[#d7a25f]">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight">{value}</p>
    </div>
  );
}

function RoomCreateForm({
  form,
  roomTypes,
  filePreviews,
  coverIndex,
  isSubmitting,
  onChange,
  onCoverChange,
  onFilesChange,
  onReset,
  onSubmit,
}: {
  form: FormState;
  roomTypes: RoomTypeResponse[];
  filePreviews: Array<{ name: string; size: number }>;
  coverIndex: number;
  isSubmitting: boolean;
  onChange: (key: keyof FormState, value: string) => void;
  onCoverChange: (index: number) => void;
  onFilesChange: (files: File[]) => void;
  onReset: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const fieldClassName =
    "border-[#decdb9] bg-[#fffaf2] text-[#211a14] placeholder:text-[#9b8c7d] focus-visible:ring-[#9b5c24] dark:border-[#3a2e24] dark:bg-[#17130f] dark:text-[#f8f1e7]";

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-6 rounded-[1.75rem] border border-[#decdb9] bg-white/72 p-5 shadow-sm backdrop-blur dark:border-[#3a2e24] dark:bg-white/[0.05] lg:p-7"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Loại phòng *">
          <select
            value={form.roomTypeId}
            onChange={(event) => onChange("roomTypeId", event.target.value)}
            className={`h-10 w-full rounded-md border px-3 text-sm outline-none ${fieldClassName}`}
            disabled={roomTypes.length === 0}
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
          <Input
            value={form.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="VD: Deluxe City View 601"
            className={fieldClassName}
          />
        </Field>

        <Field label="Giá theo ngày (VND) *">
          <Input
            type="number"
            min={0}
            value={form.pricePerDay}
            onChange={(event) => onChange("pricePerDay", event.target.value)}
            placeholder="4200000"
            className={fieldClassName}
          />
        </Field>

        <Field label="Giá theo giờ (VND) *">
          <Input
            type="number"
            min={0}
            value={form.pricePerHour}
            onChange={(event) => onChange("pricePerHour", event.target.value)}
            placeholder="380000"
            className={fieldClassName}
          />
        </Field>

        <Field label="Vị trí phòng *">
          <Input
            value={form.address}
            onChange={(event) => onChange("address", event.target.value)}
            placeholder="VD: Tầng 6, cánh Đông"
            className={fieldClassName}
          />
        </Field>

        <Field label="Diện tích *">
          <Input
            value={form.roomSize}
            onChange={(event) => onChange("roomSize", event.target.value)}
            placeholder="VD: 45 m2"
            className={fieldClassName}
          />
        </Field>

        <div className="lg:col-span-2">
          <Field label="Ảnh phòng">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#cdb99f] bg-[#fffaf2] px-4 py-8 text-center transition hover:bg-[#f8eddd] dark:border-[#3a2e24] dark:bg-[#17130f] dark:hover:bg-[#211a14]">
              <UploadCloud className="h-8 w-8 text-[#9b5c24] dark:text-[#d7a25f]" />
              <span className="mt-2 text-sm font-bold">Chọn một hoặc nhiều ảnh</span>
              <span className="mt-1 text-xs text-[#75695d] dark:text-[#b7a99a]">Ảnh đầu tiên sẽ là cover nếu bạn không chọn lại.</span>
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
          <div className="rounded-[1.5rem] border border-[#eadfcd] bg-[#fbf7ef] p-4 dark:border-[#3a2e24] dark:bg-[#17130f] lg:col-span-2">
            <div className="mb-3 flex items-center gap-2 text-sm font-black">
              <Camera className="h-4 w-4 text-[#9b5c24] dark:text-[#d7a25f]" />
              Chọn ảnh cover
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {filePreviews.map((file, index) => (
                <label
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#eadfcd] bg-white/80 px-4 py-3 text-sm dark:border-[#3a2e24] dark:bg-white/[0.04]"
                >
                  <span className="truncate">
                    {file.name} <span className="text-[#75695d] dark:text-[#b7a99a]">({file.size} KB)</span>
                  </span>
                  <input
                    type="radio"
                    name="coverImage"
                    checked={coverIndex === index}
                    onChange={() => onCoverChange(index)}
                  />
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="lg:col-span-2">
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

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onReset}>
          Xóa form
        </Button>
        <Button type="submit" disabled={isSubmitting || roomTypes.length === 0}>
          {isSubmitting ? "Đang tạo..." : "Tạo phòng"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-black text-[#4d4035] dark:text-[#eadbc4]">{label}</Label>
      {children}
    </div>
  );
}

function RoomListView({ rooms, isLoading }: { rooms: RoomResponse[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="rounded-[1.75rem] border border-[#decdb9] bg-white/72 p-10 text-center font-bold text-[#75695d] dark:border-[#3a2e24] dark:bg-white/[0.05] dark:text-[#b7a99a]">
        Đang tải danh sách phòng...
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-[#cdb99f] bg-white/60 p-12 text-center dark:border-[#3a2e24] dark:bg-white/[0.04]">
        <BedDouble className="mx-auto h-10 w-10 text-[#9b5c24] dark:text-[#d7a25f]" />
        <h3 className="mt-4 font-[var(--font-cormorant)] text-3xl font-bold">Chưa có phòng</h3>
        <p className="mt-2 text-sm text-[#75695d] dark:text-[#b7a99a]">Tạo phòng đầu tiên để bắt đầu quản lý kho phòng.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {rooms.map((room) => (
        <article
          key={room.id || room.name}
          className="overflow-hidden rounded-[1.75rem] border border-[#decdb9] bg-white/78 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl dark:border-[#3a2e24] dark:bg-white/[0.05]"
        >
          <div className="relative h-48 bg-[#eadfcd] dark:bg-[#211a14]">
            {room.image ? (
              <Image
                src={room.image}
                alt={room.name}
                fill
                unoptimized
                sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Camera className="h-10 w-10 text-[#9b5c24]/60 dark:text-[#d7a25f]/60" />
              </div>
            )}
            <span className="absolute left-4 top-4 rounded-full bg-[#21170f]/88 px-3 py-1 text-xs font-black text-white backdrop-blur">
              {statusLabel[room.status] || room.status}
            </span>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-[var(--font-cormorant)] text-3xl font-bold leading-none">{room.name}</h3>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-[#75695d] dark:text-[#b7a99a]">
                  <MapPin className="h-4 w-4" />
                  {room.address}
                </p>
              </div>
            </div>
            <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#5f5144] dark:text-[#d8c9b7]">
              {room.description || "Chưa có mô tả cho phòng này."}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <InfoPill label="Loại phòng" value={room.roomTypes?.name || "Chưa gắn"} />
              <InfoPill label="Diện tích" value={room.roomSize} />
              <InfoPill label="Tối đa" value={`${room.roomTypes?.maximumOccupancy ?? "-"} khách`} />
              <InfoPill label="Giá/ngày" value={formatCurrency(room.pricePerDay)} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#eadfcd] bg-[#fbf7ef] p-3 dark:border-[#3a2e24] dark:bg-[#17130f]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b8c7d] dark:text-[#b7a99a]">{label}</p>
      <p className="mt-1 truncate font-black">{value}</p>
    </div>
  );
}

function Alert({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
        tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
          : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
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
