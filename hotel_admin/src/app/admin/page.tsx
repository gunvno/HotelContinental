"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  getAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
  getAmenityRoomsByRoomTypePaged,
  createAmenityRoom,
  deleteAmenityRoom,
  getRoomTypeServicesByRoomTypePaged,
  createRoomTypeService,
  deleteRoomTypeService,
  getRoomTypeServices,
  updateRoomTypeService,
  type RoomTypeResponse,
  type AmenityResponse,
  type AmenityRoomResponse,
  type RoomTypeServiceResponse,
} from "@/services/room-service";

export default function AdminPage() {
  const sections = [
    {
      title: "Loại Phòng",
      description: "Quản lý danh sách loại phòng và thông tin số lượng.",
      href: "/admin/room-types",
    },
    {
      title: "Tiện Nghi",
      description: "Quản lý danh sách tiện nghi dùng cho hệ thống phòng.",
      href: "/admin/amenities",
    },
    {
      title: "Tiện Nghi - Loại Phòng",
      description: "Gán tiện nghi và số lượng cho từng loại phòng.",
      href: "/admin/amenity-rooms",
    },
    {
      title: "Dịch Vụ - Loại Phòng",
      description: "Gán dịch vụ theo serviceId cho từng loại phòng.",
      href: "/admin/room-type-services",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản Lý Danh Mục</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Chọn từng mục quản lý riêng thay vì hiển thị tất cả trên một trang.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{section.description}</p>
              <p className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400">Mở mục này</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============= ROOM TYPES SECTION =============
export function RoomTypesSection() {
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", maximumOccupancy: 1, quantity: 0 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadRoomTypes();
  }, []);

  const loadRoomTypes = async () => {
    try {
      setIsLoading(true);
      const { data } = await getRoomTypes(0, 100);
      setRoomTypes(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(`Lỗi tải danh sách loại phòng: ${message}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (roomType: RoomTypeResponse) => {
    setEditingId(roomType.id);
    setFormData({
      name: roomType.name,
      description: roomType.description || "",
      maximumOccupancy: roomType.maximumOccupancy,
      quantity: roomType.quantity,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Tên loại phòng không được để trống");
      return;
    }

    try {
      if (editingId) {
        await updateRoomType(editingId, formData);
        setSuccess("Cập nhật loại phòng thành công");
      } else {
        await createRoomType(formData);
        setSuccess("Tạo loại phòng thành công");
      }
      setIsModalOpen(false);
      setFormData({ name: "", description: "", maximumOccupancy: 1, quantity: 0 });
      setEditingId(null);
      await loadRoomTypes();
    } catch (e) {
      setError("Lỗi lưu loại phòng");
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn chắc chắn muốn xóa loại phòng này?")) {
      try {
        await deleteRoomType(id);
        setSuccess("Xóa loại phòng thành công");
        await loadRoomTypes();
      } catch (e) {
        setError("Lỗi xóa loại phòng");
        console.error(e);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Danh Sách Loại Phòng</h2>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", description: "", maximumOccupancy: 1, quantity: 0 });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Thêm Loại Phòng
        </Button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded">{success}</div>}

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tên Loại</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Mô Tả</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Max Khách</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Số Lượng</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {roomTypes.map((rt) => (
                <tr key={rt.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{rt.name}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{rt.description || "-"}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{rt.maximumOccupancy}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{rt.quantity}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEdit(rt)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mr-3"
                    >
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(rt.id)} className="text-red-600 hover:text-red-700 dark:text-red-400">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingId ? "Cập Nhật Loại Phòng" : "Thêm Loại Phòng Mới"}
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên Loại</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Deluxe Suite"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mô Tả</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Số Khách Tối Đa</Label>
                <Input
                  type="number"
                  value={formData.maximumOccupancy}
                  onChange={(e) => setFormData({ ...formData, maximumOccupancy: parseInt(e.target.value) || 1 })}
                  onFocus={(e) => {
                    if (e.currentTarget.value === "1") {
                      e.currentTarget.select();
                    }
                  }}
                  min="1"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Số Lượng</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-100"
              >
                Hủy
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============= AMENITIES SECTION =============
export function AmenitiesSection() {
  const [amenities, setAmenities] = useState<AmenityResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAmenities();
  }, []);

  const loadAmenities = async () => {
    try {
      setIsLoading(true);
      const { data } = await getAmenities(0, 100);
      setAmenities(data);
    } catch (e) {
      setError("Lỗi tải danh sách tiện nghi");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (amenity: AmenityResponse) => {
    setEditingId(amenity.id);
    setFormData({ name: amenity.name, description: amenity.description || "" });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Tên tiện nghi không được để trống");
      return;
    }

    try {
      if (editingId) {
        await updateAmenity(editingId, formData);
        setSuccess("Cập nhật tiện nghi thành công");
      } else {
        await createAmenity(formData);
        setSuccess("Tạo tiện nghi thành công");
      }
      setIsModalOpen(false);
      setFormData({ name: "", description: "" });
      setEditingId(null);
      await loadAmenities();
    } catch (e) {
      setError("Lỗi lưu tiện nghi");
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn chắc chắn muốn xóa tiện nghi này?")) {
      try {
        await deleteAmenity(id);
        setSuccess("Xóa tiện nghi thành công");
        await loadAmenities();
      } catch (e) {
        setError("Lỗi xóa tiện nghi");
        console.error(e);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Danh Sách Tiện Nghi</h2>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", description: "" });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Thêm Tiện Nghi
        </Button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded">{success}</div>}

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tên Tiện Nghi</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Mô Tả</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Trạng Thái</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {amenities.map((amenity) => (
                <tr key={amenity.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{amenity.name}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{amenity.description || "-"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        amenity.status === "AVAILABLE"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {amenity.status === "AVAILABLE" ? "Có Sẵn" : "Không Có"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEdit(amenity)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mr-3"
                    >
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(amenity.id)} className="text-red-600 hover:text-red-700 dark:text-red-400">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingId ? "Cập Nhật Tiện Nghi" : "Thêm Tiện Nghi Mới"}
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên Tiện Nghi</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: WiFi"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mô Tả</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-100"
              >
                Hủy
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============= AMENITY ROOMS SECTION =============
export function AmenityRoomsSection() {
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("");
  const [amenityRooms, setAmenityRooms] = useState<AmenityRoomResponse[]>([]);
  const [amenities, setAmenities] = useState<AmenityResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ amenityId: "", amount: 1 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRoomTypeId) {
      loadAmenityRooms();
    }
  }, [selectedRoomTypeId]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [rtData, amenityData] = await Promise.all([getRoomTypes(0, 100), getAmenities(0, 100)]);
      setRoomTypes(rtData.data);
      setAmenities(amenityData.data);
      if (rtData.data.length > 0) {
        setSelectedRoomTypeId(rtData.data[0].id);
      }
    } catch (e) {
      setError("Lỗi tải dữ liệu");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAmenityRooms = async () => {
    if (!selectedRoomTypeId) return;
    try {
      const { data } = await getAmenityRoomsByRoomTypePaged(selectedRoomTypeId, 0, 100);
      setAmenityRooms(data);
    } catch (e) {
      setError("Lỗi tải tiện nghi của loại phòng");
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!formData.amenityId) {
      setError("Vui lòng chọn tiện nghi");
      return;
    }

    try {
      await createAmenityRoom({
        amenityId: formData.amenityId,
        roomTypeId: selectedRoomTypeId,
        amount: formData.amount,
      });
      setSuccess("Thêm tiện nghi cho loại phòng thành công");
      setIsModalOpen(false);
      setFormData({ amenityId: "", amount: 1 });
      await loadAmenityRooms();
    } catch (e) {
      setError("Lỗi thêm tiện nghi");
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn chắc chắn muốn xóa tiện nghi này?")) {
      try {
        await deleteAmenityRoom(id);
        setSuccess("Xóa tiện nghi thành công");
        await loadAmenityRooms();
      } catch (e) {
        setError("Lỗi xóa tiện nghi");
        console.error(e);
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Gán Tiện Nghi cho Loại Phòng</h2>

      {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded">{success}</div>}

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      ) : (
        <>
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Chọn Loại Phòng</Label>
            <select
              value={selectedRoomTypeId}
              onChange={(e) => setSelectedRoomTypeId(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Danh Sách Tiện Nghi</h3>
            <Button
              onClick={() => {
                setFormData({ amenityId: "", amount: 1 });
                setIsModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              + Thêm Tiện Nghi
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tên Tiện Nghi</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Số Lượng</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {amenityRooms.map((ar) => (
                  <tr key={ar.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{ar.amenity.name}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{ar.amount}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleDelete(ar.id)} className="text-red-600 hover:text-red-700 dark:text-red-400">
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {amenityRooms.length === 0 && <div className="text-center py-8 text-gray-500">Không có tiện nghi nào</div>}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thêm Tiện Nghi</h3>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Chọn Tiện Nghi</Label>
                <select
                  value={formData.amenityId}
                  onChange={(e) => setFormData({ ...formData, amenityId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="">-- Chọn Tiện Nghi --</option>
                  {amenities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Số Lượng</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 1 })}
                  onFocus={(e) => {
                    if (e.currentTarget.value === "1") {
                      e.currentTarget.select();
                    }
                  }}
                  min="1"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-100"
              >
                Hủy
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============= ROOM TYPE SERVICES SECTION =============
export function RoomTypeServicesSection() {
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("");
  const [roomTypeServices, setRoomTypeServices] = useState<RoomTypeServiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ serviceId: "", amount: 1 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRoomTypeId) {
      loadRoomTypeServices();
    }
  }, [selectedRoomTypeId]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [roomTypeResult, serviceResult] = await Promise.all([getRoomTypes(0, 100), getRoomTypeServices(0, 100)]);
      setRoomTypes(roomTypeResult.data);
      setRoomTypeServices(serviceResult.data);
      if (roomTypeResult.data.length > 0) {
        setSelectedRoomTypeId(roomTypeResult.data[0].id);
      }
    } catch (loadError) {
      console.error(loadError);
      setError("Lỗi tải dữ liệu dịch vụ loại phòng");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoomTypeServices = async () => {
    if (!selectedRoomTypeId) {
      return;
    }

    try {
      const { data } = await getRoomTypeServicesByRoomTypePaged(selectedRoomTypeId, 0, 100);
      setRoomTypeServices(data);
    } catch (loadError) {
      console.error(loadError);
      setError("Lỗi tải danh sách dịch vụ của loại phòng");
    }
  };

  const handleEdit = (item: RoomTypeServiceResponse) => {
    setEditingId(item.id);
    setFormData({ serviceId: item.serviceId, amount: item.amount });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.serviceId.trim()) {
      setError("Service ID không được để trống");
      return;
    }

    try {
      if (editingId) {
        await updateRoomTypeService(editingId, formData);
        setSuccess("Cập nhật dịch vụ loại phòng thành công");
      } else {
        await createRoomTypeService({
          roomTypeId: selectedRoomTypeId,
          serviceId: formData.serviceId.trim(),
          amount: formData.amount,
        });
        setSuccess("Thêm dịch vụ loại phòng thành công");
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ serviceId: "", amount: 1 });
      await loadRoomTypeServices();
    } catch (saveError) {
      console.error(saveError);
      setError("Lỗi lưu dịch vụ loại phòng");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn chắc chắn muốn xóa dịch vụ này?")) {
      try {
        await deleteRoomTypeService(id);
        setSuccess("Xóa dịch vụ loại phòng thành công");
        await loadRoomTypeServices();
      } catch (deleteError) {
        console.error(deleteError);
        setError("Lỗi xóa dịch vụ loại phòng");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dịch Vụ của Loại Phòng</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gán serviceId và số lượng dịch vụ cho từng loại phòng.</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({ serviceId: "", amount: 1 });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Thêm Dịch Vụ
        </Button>
      </div>

      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-200">{error}</div>}
      {success && <div className="mb-4 rounded bg-green-100 p-3 text-green-700 dark:bg-green-900/30 dark:text-green-200">{success}</div>}

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Đang tải...</div>
      ) : (
        <>
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Chọn Loại Phòng</Label>
            <select
              value={selectedRoomTypeId}
              onChange={(e) => setSelectedRoomTypeId(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Service ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Số Lượng</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Trạng Thái</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {roomTypeServices.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{item.serviceId}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{item.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${item.deleted ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200"}`}>
                        {item.deleted ? "Đã xóa" : "Hoạt động"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleEdit(item)} className="mr-3 text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700 dark:text-red-400">
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {roomTypeServices.length === 0 && <div className="py-8 text-center text-gray-500">Chưa có dịch vụ nào</div>}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {editingId ? "Cập Nhật Dịch Vụ Loại Phòng" : "Thêm Dịch Vụ Loại Phòng"}
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service ID</Label>
                <Input
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  placeholder="VD: wifi, breakfast, parking"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Số Lượng</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 1 })}
                  onFocus={(e) => {
                    if (e.currentTarget.value === "1") {
                      e.currentTarget.select();
                    }
                  }}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-300 text-gray-900 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                Hủy
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
