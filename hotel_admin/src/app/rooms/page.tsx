"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createRoom,
  getRoomTypeOptions,
  uploadRoomImages,
  getRoomTypes,
  type CreateRoomPayload,
  type RoomTypeOption,
  type RoomTypeResponse,
} from "@/services/room-service";

type FormState = {
  name: string;
  pricePerDay: string;
  pricePerHour: string;
  address: string;
  description: string;
  roomSize: string;
};

const defaultFormState: FormState = {
  name: "",
  pricePerDay: "",
  pricePerHour: "",
  address: "",
  description: "",
  roomSize: "",
};

export default function RoomsPage() {
  const [view, setView] = useState<"list" | "create">("list");
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [roomTypeOptions, setRoomTypeOptions] = useState<RoomTypeOption[]>([]);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const labelClassName = "text-sm font-semibold text-gray-700 dark:text-gray-200";
  const fieldClassName =
    "bg-white text-gray-900 border-gray-300 placeholder:text-gray-500 focus-visible:ring-blue-500 dark:bg-gray-900/60 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400";

  const onChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const loadRoomTypes = async () => {
      try {
        setIsLoadingRoomTypes(true);
        const [rtData, options] = await Promise.all([
          getRoomTypes(0, 100),
          getRoomTypeOptions(),
        ]);
        setRoomTypes(rtData.data);
        setRoomTypeOptions(options);
        if (options.length > 0) {
          setSelectedRoomTypeId(options[0].id);
        }
      } catch (loadError) {
        console.error(loadError);
        setError("Không tải được danh sách loại phòng.");
      } finally {
        setIsLoadingRoomTypes(false);
      }
    };

    loadRoomTypes();
  }, []);

  const filePreviews = useMemo(
    () => selectedFiles.map((file) => ({ name: file.name, size: Math.round(file.size / 1024) })),
    [selectedFiles],
  );

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!selectedRoomTypeId || !form.name.trim() || !form.address.trim() || !form.roomSize.trim()) {
      setError("Vui lòng chọn Loại phòng và nhập đầy đủ Tên phòng, Địa chỉ, Diện tích.");
      return;
    }

    const pricePerDay = Number(form.pricePerDay);
    const pricePerHour = Number(form.pricePerHour);

    if (!Number.isFinite(pricePerDay) || pricePerDay <= 0 || !Number.isFinite(pricePerHour) || pricePerHour <= 0) {
      setError("Giá theo ngày và giá theo giờ phải là số lớn hơn 0.");
      return;
    }

    const payload: CreateRoomPayload = {
      roomTypes: { id: selectedRoomTypeId },
      name: form.name.trim(),
      pricePerDay,
      pricePerHour,
      address: form.address.trim(),
      description: form.description.trim() || undefined,
      roomSize: form.roomSize.trim(),
    };

    try {
      setIsSubmitting(true);
      const result = await createRoom(payload);

      if (selectedFiles.length > 0) {
        if (!result.id) {
          throw new Error("Backend chưa trả id sau khi tạo phòng, chưa thể upload ảnh.");
        }
        await uploadRoomImages(result.id, selectedFiles, coverIndex);
      }

      setMessage(
        selectedFiles.length > 0
          ? `Tạo phòng và upload ${selectedFiles.length} ảnh thành công: ${result.name}`
          : `Tạo phòng thành công: ${result.name}`,
      );
      setForm(defaultFormState);
      setSelectedFiles([]);
      setCoverIndex(0);
      setView("list");
    } catch (submitError) {
      setError("Không thể tạo phòng hoặc upload ảnh. Vui lòng kiểm tra dữ liệu và API.");
      console.error(submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản Lý Phòng</h1>
          {view === "list" && (
            <Button
              onClick={() => {
                setView("create");
                setError(null);
                setMessage(null);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              + Thêm Phòng Mới
            </Button>
          )}
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setView("list");
              setError(null);
              setMessage(null);
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              view === "list"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Danh Sách Phòng
          </button>
          <button
            onClick={() => {
              setView("create");
              setError(null);
              setMessage(null);
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              view === "create"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Tạo Phòng Mới
          </button>
        </div>

        {view === "list" && <RoomListView roomTypes={roomTypes} />}
        {view === "create" && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg">
            <form
              onSubmit={onSubmit}
              className="p-6 grid gap-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="roomType" className={labelClassName}>Loại phòng *</Label>
                  <select
                    id="roomType"
                    value={selectedRoomTypeId}
                    onChange={(event) => setSelectedRoomTypeId(event.target.value)}
                    className={`w-full rounded-md border px-3 py-2 ${fieldClassName}`}
                    disabled={isLoadingRoomTypes || roomTypeOptions.length === 0}
                  >
                    {isLoadingRoomTypes ? <option>Đang tải loại phòng...</option> : null}
                    {!isLoadingRoomTypes && roomTypeOptions.length === 0 ? <option>Chưa có dữ liệu loại phòng</option> : null}
                    {roomTypeOptions.map((roomType) => (
                      <option key={roomType.id} value={roomType.id}>
                        {roomType.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className={labelClassName}>Tên phòng *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) => onChange("name", event.target.value)}
                    placeholder="VD: Deluxe City View"
                    className={fieldClassName}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerDay" className={labelClassName}>Giá theo ngày (VND) *</Label>
                  <Input
                    id="pricePerDay"
                    type="number"
                    min={0}
                    value={form.pricePerDay}
                    onChange={(event) => onChange("pricePerDay", event.target.value)}
                    placeholder="4200000"
                    className={fieldClassName}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerHour" className={labelClassName}>Giá theo giờ (VND) *</Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    min={0}
                    value={form.pricePerHour}
                    onChange={(event) => onChange("pricePerHour", event.target.value)}
                    placeholder="380000"
                    className={fieldClassName}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className={labelClassName}>Địa chỉ / Vị trí phòng *</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(event) => onChange("address", event.target.value)}
                    placeholder="VD: Tầng 6, cánh Đông"
                    className={fieldClassName}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomSize" className={labelClassName}>Diện tích phòng *</Label>
                  <Input
                    id="roomSize"
                    value={form.roomSize}
                    onChange={(event) => onChange("roomSize", event.target.value)}
                    placeholder="VD: 45 m²"
                    className={fieldClassName}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images" className={labelClassName}>Ảnh phòng (nhiều ảnh)</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? []);
                      setSelectedFiles(files);
                      setCoverIndex(0);
                    }}
                    className={fieldClassName}
                  />
                </div>

                {selectedFiles.length > 0 ? (
                  <div className="space-y-2 md:col-span-2">
                    <Label className={labelClassName}>Chọn ảnh cover</Label>
                    <div className="rounded-md border border-gray-300 p-3 dark:border-gray-600">
                      <div className="space-y-2">
                        {filePreviews.map((file, index) => (
                          <label key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                            <span className="truncate">{file.name} ({file.size} KB)</span>
                            <input
                              type="radio"
                              name="coverImage"
                              checked={coverIndex === index}
                              onChange={() => setCoverIndex(index)}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description" className={labelClassName}>Mô tả phòng</Label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(event) => onChange("description", event.target.value)}
                    rows={4}
                    placeholder="Mô tả tiện nghi, tầm nhìn, phong cách..."
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-600 dark:bg-gray-900/60 dark:text-gray-100 dark:placeholder:text-gray-400"
                  />
                </div>
              </div>

              {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}
              {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setForm(defaultFormState);
                    setSelectedFiles([]);
                    setCoverIndex(0);
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Xóa form
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang tạo phòng..." : "Tạo phòng"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function RoomListView({ roomTypes }: { roomTypes: RoomTypeResponse[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Danh Sách Phòng</h2>
      
      {roomTypes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Chưa có phòng nào được tạo</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomTypes.map((roomType) => (
            <div
              key={roomType.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">{roomType.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{roomType.description || "Không có mô tả"}</p>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Max Khách:</span> {roomType.maximumOccupancy}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Số Lượng:</span> {roomType.quantity}
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline">
                  Xem Chi Tiết
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
