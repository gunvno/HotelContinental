"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { PermissionDenied } from "@/components/auth/permission-gate";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { usePermission } from "@/hooks/use-permission";
import {
  type AmenityResponse,
  type AmenityRoomResponse,
  createAmenity,
  createAmenityRoom,
  createRoomType,
  createRoomTypeService,
  deleteAmenity,
  deleteAmenityRoom,
  deleteRoomType,
  deleteRoomTypeService,
  getCatalogServices,
  getAmenities,
  getAmenityRoomsByRoomTypePaged,
  getRoomTypes,
  getRoomTypeServices,
  getRoomTypeServicesByRoomTypePaged,
  type RoomTypeResponse,
  type RoomTypeServiceResponse,
  type ServiceResponse,
  updateAmenityRoom,
  updateAmenity,
  updateRoomType,
  updateRoomTypeService,
} from "@/services/room-service";

export default function AdminPage() {
  const permission = usePermission();
  const sections = [
    {
      title: "Loại Phòng",
      description: "Quản lý danh sách loại phòng và thông tin số lượng.",
      href: "/admin/room-types",
      requiredPermission: "ROOM_TYPE_VIEW",
    },
    {
      title: "Cơ Sở Vật Chất",
      description: "Quản lý các cơ sở vật chất của khách sạn.",
      href: "/admin/amenities",
      requiredPermission: "AMENITY_VIEW",
    },
    {
      title: "Cơ Sở Vật Chất Theo Loại",
      description: "Bảng trung gian gán cơ sở vật chất và số lượng cho từng loại phòng.",
      href: "/admin/amenity-rooms",
      requiredPermission: "AMENITY_ROOM_VIEW",
    },
    {
      title: "Dịch Vụ Bổ Sung Theo Loại Phòng",
      description: "Bảng trung gian gán mã dịch vụ và số lượng cho từng loại phòng.",
      href: "/admin/room-type-services",
      requiredPermission: "ROOM_TYPE_SERVICE_VIEW",
    },
  ];
  const visibleSections = sections.filter((section) => permission.has(section.requiredPermission));

  if (visibleSections.length === 0) {
    return <PermissionDenied message="Bạn không có quyền xem nhóm danh mục nào." />;
  }

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
          {visibleSections.map((section) => (
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

const PAGE_SIZE = 10;

function useAutoDismissAlerts(
  error: string | null,
  setError: (value: string | null) => void,
  success: string | null,
  setSuccess: (value: string | null) => void,
) {
  useEffect(() => {
    if (!error && !success) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [error, setError, setSuccess, success]);
}

type DeleteTarget = {
  id: string;
  title: string;
  description: string;
};

// ============= ROOM TYPES SECTION =============
export function RoomTypesSection() {
  const router = useRouter();
  const permission = usePermission();
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", maximumOccupancy: 1, quantity: 0, deleted: false });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useAutoDismissAlerts(error, setError, success, setSuccess);

  useEffect(() => {
    loadRoomTypes(page);
  }, [page]);

  const canCreateRoomType = permission.has("ROOM_TYPE_CREATE");
  const canUpdateRoomType = permission.has("ROOM_TYPE_UPDATE");
  const canDeleteRoomType = permission.has("ROOM_TYPE_DELETE");
  const isActionBusy = pendingAction !== null;

  if (!permission.has("ROOM_TYPE_VIEW")) {
    return <PermissionDenied message="Bạn không có quyền ROOM_TYPE_VIEW để xem loại phòng." />;
  }

  const loadRoomTypes = async (pageIndex = page) => {
    try {
      setIsLoading(true);
      const { data, total: totalCount } = await getRoomTypes(pageIndex, PAGE_SIZE);
      setRoomTypes(data);
      setTotal(totalCount);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(`Lỗi tải danh sách loại phòng: ${message}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (roomType: RoomTypeResponse) => {
    if (isActionBusy) return;
    setEditingId(roomType.id);
    setFormData({
      name: roomType.name,
      description: roomType.description || "",
      maximumOccupancy: roomType.maximumOccupancy,
      quantity: roomType.quantity,
      deleted: !!roomType.deleted,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (isActionBusy) return;
    if (!formData.name.trim()) {
      setError("Tên loại phòng không được để trống");
      return;
    }

    try {
      setPendingAction("save");
      if (editingId) {
        await updateRoomType(editingId, formData);
        setSuccess("Cập nhật loại phòng thành công");
      } else {
        await createRoomType(formData);
        setSuccess("Tạo loại phòng thành công");
      }
      setIsModalOpen(false);
      setFormData({ name: "", description: "", maximumOccupancy: 1, quantity: 0, deleted: false });
      setEditingId(null);
      await loadRoomTypes(page);
    } catch (e) {
      setError("Lỗi lưu loại phòng");
      console.error(e);
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (isActionBusy) return;
    try {
      setPendingAction(`delete:${id}`);
      await deleteRoomType(id);
      setDeleteTarget(null);
      setSuccess("Xóa loại phòng thành công");
      await loadRoomTypes(page);
    } catch (e) {
      setError("Lỗi xóa loại phòng");
      console.error(e);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/80 md:flex-row md:items-end md:justify-between">
        <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Danh Sách Loại Phòng</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Hiển thị cả bản ghi hoạt động lẫn đã xóa.
          </p>
        </div>
        {canCreateRoomType ? (
        <Button
          disabled={isActionBusy}
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", description: "", maximumOccupancy: 1, quantity: 0, deleted: false });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Thêm Loại Phòng
        </Button>
        ) : null}
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded">{success}</div>}

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/80">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tên Loại</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Mô Tả</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Max Khách</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Số Phòng</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Trạng Thái</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {roomTypes.map((rt) => (
                  <tr
                    key={rt.id}
                    onClick={() => router.push(`/admin/room-types/${rt.id}`)}
                    className={`cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${rt.deleted ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{rt.name}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{rt.description || "-"}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{rt.maximumOccupancy}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{rt.quantity}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${rt.deleted ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"}`}>
                        {rt.deleted ? "Đã xóa" : "Hoạt động"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                        <Button type="button" variant="outline" disabled={!canUpdateRoomType || isActionBusy} onClick={() => handleEdit(rt)} className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-45 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/40">
                          Sửa
                        </Button>
                        {canDeleteRoomType && !rt.deleted && (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isActionBusy}
                            onClick={() => setDeleteTarget({
                              id: rt.id,
                              title: "Xóa loại phòng",
                              description: `Bạn chắc chắn muốn xóa loại phòng "${rt.name}"?`,
                            })}
                            className="h-8 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                          >
                            Xóa
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {roomTypes.length === 0 && <div className="py-10 text-center text-gray-500">Không có dữ liệu</div>}
          <div className="px-4 pb-4">
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          </div>
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

              {editingId && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Số Phòng</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Nên đồng bộ theo số phòng vật lý thuộc loại này.
                  </p>
                </div>
              )}

              {editingId && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Trạng Thái Xóa</Label>
                  <select
                    value={formData.deleted ? "deleted" : "active"}
                    onChange={(e) => setFormData({ ...formData, deleted: e.target.value === "deleted" })}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="deleted">Đã xóa</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setIsModalOpen(false)}
                disabled={isActionBusy}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-100"
              >
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isActionBusy} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {pendingAction === "save" ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.title}
        description={deleteTarget?.description ?? ""}
        isLoading={isActionBusy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />
    </div>
  );
}

// ============= AMENITIES SECTION =============
export function AmenitiesSection() {
  const router = useRouter();
  const permission = usePermission();
  const [amenities, setAmenities] = useState<AmenityResponse[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", deleted: false });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useAutoDismissAlerts(error, setError, success, setSuccess);

  useEffect(() => {
    loadAmenities(page);
  }, [page]);

  const isActionBusy = pendingAction !== null;

  if (!permission.has("AMENITY_VIEW")) {
    return <PermissionDenied message="Bạn không có quyền AMENITY_VIEW để xem cơ sở vật chất." />;
  }

  const loadAmenities = async (pageIndex = page) => {
    try {
      setIsLoading(true);
      const { data, total: totalCount } = await getAmenities(pageIndex, PAGE_SIZE);
      setAmenities(data);
      setTotal(totalCount);
    } catch (e) {
      setError("Lỗi tải danh sách cơ sở vật chất");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (amenity: AmenityResponse) => {
    if (isActionBusy) return;
    setEditingId(amenity.id);
    setFormData({ name: amenity.name, description: amenity.description || "", deleted: !!amenity.deleted });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (isActionBusy) return;
    if (!formData.name.trim()) {
      setError("Tên cơ sở vật chất không được để trống");
      return;
    }

    try {
      setPendingAction("save");
      if (editingId) {
        await updateAmenity(editingId, formData);
        setSuccess("Cập nhật cơ sở vật chất thành công");
      } else {
        await createAmenity(formData);
        setSuccess("Tạo cơ sở vật chất thành công");
      }
      setIsModalOpen(false);
      setFormData({ name: "", description: "", deleted: false });
      setEditingId(null);
      await loadAmenities(page);
    } catch (e) {
      setError("Lỗi lưu cơ sở vật chất");
      console.error(e);
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (isActionBusy) return;
    try {
      setPendingAction(`delete:${id}`);
      await deleteAmenity(id);
      setDeleteTarget(null);
      setSuccess("Xóa cơ sở vật chất thành công");
      await loadAmenities(page);
    } catch (e) {
      setError("Lỗi xóa cơ sở vật chất");
      console.error(e);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/80 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Danh Sách Cơ Sở Vật Chất</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Bản ghi đã xóa vẫn hiển thị trong danh sách.</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", description: "", deleted: false });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Thêm Cơ Sở Vật Chất
        </Button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded">{success}</div>}

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/80">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tên Cơ Sở Vật Chất</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Mô Tả</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Trạng Thái Xóa</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Trạng Thái</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {amenities.map((amenity) => (
                  <tr
                    key={amenity.id}
                    onClick={() => router.push(`/admin/amenities/${amenity.id}`)}
                    className={`cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${amenity.deleted ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{amenity.name}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{amenity.description || "-"}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${amenity.status === "AVAILABLE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200"}`}>
                        {amenity.status === "AVAILABLE" ? "Có sẵn" : "Không có"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${amenity.deleted ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"}`}>
                        {amenity.deleted ? "Đã xóa" : "Hoạt động"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                        <Button type="button" variant="outline" disabled={!permission.has("AMENITY_UPDATE")} onClick={() => handleEdit(amenity)} className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-45 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/40">
                          Sửa
                        </Button>
                        {permission.has("AMENITY_DELETE") && !amenity.deleted && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteTarget({
                              id: amenity.id,
                              title: "Xóa cơ sở vật chất",
                              description: `Bạn chắc chắn muốn xóa cơ sở vật chất "${amenity.name}"?`,
                            })}
                            className="h-8 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                          >
                            Xóa
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {amenities.length === 0 && <div className="py-10 text-center text-gray-500">Không có dữ liệu</div>}
          <div className="px-4 pb-4">
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingId ? "Cập Nhật Cơ Sở Vật Chất" : "Thêm Cơ Sở Vật Chất Mới"}
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên Cơ Sở Vật Chất</Label>
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

              {editingId && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Trạng Thái Xóa</Label>
                  <select
                    value={formData.deleted ? "deleted" : "active"}
                    onChange={(e) => setFormData({ ...formData, deleted: e.target.value === "deleted" })}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="deleted">Đã xóa</option>
                  </select>
                </div>
              )}
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

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.title}
        description={deleteTarget?.description ?? ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />
    </div>
  );
}

// ============= AMENITY ROOMS SECTION =============
export function AmenityRoomsSection() {
  const router = useRouter();
  const permission = usePermission();
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("");
  const [amenityRooms, setAmenityRooms] = useState<AmenityRoomResponse[]>([]);
  const [amenities, setAmenities] = useState<AmenityResponse[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ roomTypeId: "", amenityId: "", amount: 1, deleted: false });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  useAutoDismissAlerts(error, setError, success, setSuccess);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRoomTypeId) {
      loadAmenityRooms(page);
    }
  }, [selectedRoomTypeId, page]);

  if (!permission.has("AMENITY_ROOM_VIEW")) {
    return <PermissionDenied message="Bạn không có quyền AMENITY_ROOM_VIEW để xem gán cơ sở vật chất theo loại phòng." />;
  }

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [rtData, amenityData] = await Promise.all([getRoomTypes(0, 100), getAmenities(0, 100)]);
      setRoomTypes(rtData.data);
      setAmenities(amenityData.data);
      const activeRoomTypes = rtData.data.filter((roomType) => !roomType.deleted);
      if (activeRoomTypes.length > 0) {
        setSelectedRoomTypeId(activeRoomTypes[0].id);
        setFormData((prev) => ({ ...prev, roomTypeId: prev.roomTypeId || activeRoomTypes[0].id }));
      } else if (rtData.data.length > 0) {
        setSelectedRoomTypeId(rtData.data[0].id);
        setFormData((prev) => ({ ...prev, roomTypeId: prev.roomTypeId || rtData.data[0].id }));
      }
    } catch (e) {
      setError("Lỗi tải dữ liệu");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAmenityRooms = async (pageIndex = page) => {
    if (!selectedRoomTypeId) return;
    try {
      const { data, total: totalCount } = await getAmenityRoomsByRoomTypePaged(selectedRoomTypeId, pageIndex, PAGE_SIZE);
      setAmenityRooms(data);
      setTotal(totalCount);
    } catch (e) {
      setError("Lỗi tải cơ sở vật chất theo loại phòng");
      console.error(e);
    }
  };

  const handleSave = async () => {
    const roomTypeId = formData.roomTypeId || (selectedRoomTypeId !== ALL_ROOM_TYPES_VALUE ? selectedRoomTypeId : "");
    if (!roomTypeId) {
      setError("Vui lòng chọn loại phòng");
      return;
    }

    if (!formData.amenityId) {
      setError("Vui lòng chọn cơ sở vật chất");
      return;
    }

    try {
      if (editingId) {
        await updateAmenityRoom(editingId, { amount: formData.amount, deleted: formData.deleted });
        setSuccess("Cập nhật cơ sở vật chất theo loại thành công");
      } else {
        await createAmenityRoom({
          amenityId: formData.amenityId,
          roomTypeId,
          amount: formData.amount,
          deleted: formData.deleted,
        });
        setSuccess("Thêm cơ sở vật chất cho loại phòng thành công");
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ roomTypeId: roomTypeId, amenityId: "", amount: 1, deleted: false });
      setSelectedRoomTypeId(roomTypeId);
      await loadAmenityRooms(page);
    } catch (e) {
      setError("Lỗi thêm cơ sở vật chất");
      console.error(e);
    }
  };

  const handleEdit = (item: AmenityRoomResponse) => {
    setEditingId(item.id);
    setFormData({ roomTypeId: item.roomTypeId || selectedRoomTypeId, amenityId: item.amenityId || item.amenity?.id || "", amount: item.amount, deleted: !!item.deleted });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAmenityRoom(id);
      setDeleteTarget(null);
      setSuccess("Xóa cơ sở vật chất thành công");
      await loadAmenityRooms(page);
    } catch (e) {
      setError("Lỗi xóa cơ sở vật chất");
      console.error(e);
    }
  };

  const activeRoomTypes = roomTypes.filter((roomType) => !roomType.deleted);
  const activeAmenities = amenities.filter((amenity) => !amenity.deleted);

  return (
    <div className="p-6">
      <div className="mb-6 rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bảng Trung Gian Cơ Sở Vật Chất Theo Loại Phòng</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Danh sách gán cơ sở vật chất cho loại phòng. Khi thêm mới sẽ luôn ở trạng thái hoạt động.</p>
      </div>

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
              onChange={(e) => {
                setPage(0);
                setSelectedRoomTypeId(e.target.value);
              }}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              {activeRoomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Danh Sách Cơ Sở Vật Chất</h3>
            {permission.has("AMENITY_ROOM_CREATE") ? (
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({ roomTypeId: selectedRoomTypeId, amenityId: "", amount: 1, deleted: false });
                setIsModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              + Thêm Cơ Sở Vật Chất
            </Button>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/80">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tên Cơ Sở Vật Chất</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Số Lượng</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Trạng Thái</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {amenityRooms.map((ar) => (
                    <tr
                      key={ar.id}
                      onClick={() => router.push(`/admin/amenity-rooms/${ar.id}`)}
                      className={`cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${ar.deleted ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{ar.amenity?.name || ar.amenityId}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{ar.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${ar.deleted ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"}`}>
                          {ar.deleted ? "Đã xóa" : "Hoạt động"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                          <Button type="button" variant="outline" disabled={!permission.has("AMENITY_ROOM_UPDATE")} onClick={() => handleEdit(ar)} className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-45 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/40">
                            Sửa
                          </Button>
                          {permission.has("AMENITY_ROOM_DELETE") && !ar.deleted && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setDeleteTarget({
                                id: ar.id,
                                title: "Xóa gán cơ sở vật chất",
                                description: `Bạn chắc chắn muốn xóa "${ar.amenity?.name || ar.amenityId}" khỏi loại phòng này?`,
                              })}
                              className="h-8 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                            >
                              Xóa
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {amenityRooms.length === 0 && <div className="py-8 text-center text-gray-500">Không có cơ sở vật chất nào</div>}
            </div>
            <div className="px-4 pb-4">
              <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
            </div>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingId ? "Cập Nhật Cơ Sở Vật Chất Theo Loại" : "Thêm Cơ Sở Vật Chất"}
            </h3>

            <div className="space-y-4">
              {!editingId && (
                <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Chọn Loại Phòng</Label>
                <select
                  value={formData.roomTypeId || selectedRoomTypeId}
                  onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="">-- Chọn Loại Phòng --</option>
                  {activeRoomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name}
                    </option>
                  ))}
                </select>
                </div>
              )}

              {!editingId && (
                <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Chọn Cơ Sở Vật Chất</Label>
                <select
                  value={formData.amenityId}
                  onChange={(e) => setFormData({ ...formData, amenityId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="">-- Chọn Cơ Sở Vật Chất --</option>
                  {activeAmenities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                </div>
              )}

              {editingId && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loại Phòng</Label>
                  <Input value={roomTypes.find((roomType) => roomType.id === (formData.roomTypeId || selectedRoomTypeId))?.name || selectedRoomTypeId} disabled className="mt-1" />
                </div>
              )}

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

              {editingId && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Trạng Thái Xóa</Label>
                  <select
                    value={formData.deleted ? "deleted" : "active"}
                    onChange={(e) => setFormData({ ...formData, deleted: e.target.value === "deleted" })}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="deleted">Đã xóa</option>
                  </select>
                </div>
              )}
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

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.title}
        description={deleteTarget?.description ?? ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />
    </div>
  );
}

// ============= ROOM TYPE SERVICES SECTION =============
const ALL_ROOM_TYPES_VALUE = "all";

export function RoomTypeServicesSection() {
  const router = useRouter();
  const permission = usePermission();
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>(ALL_ROOM_TYPES_VALUE);
  const [roomTypeServices, setRoomTypeServices] = useState<RoomTypeServiceResponse[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ roomTypeId: "", serviceId: "", amount: 1, deleted: false });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  useAutoDismissAlerts(error, setError, success, setSuccess);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRoomTypeId) {
      loadRoomTypeServices(page, selectedRoomTypeId);
    }
  }, [selectedRoomTypeId, page]);

  if (!permission.has("ROOM_TYPE_SERVICE_VIEW")) {
    return <PermissionDenied message="Bạn không có quyền ROOM_TYPE_SERVICE_VIEW để xem gán dịch vụ bổ sung theo loại phòng." />;
  }

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [roomTypeResult, roomTypeServiceResult] = await Promise.all([
        getRoomTypes(0, 100),
        getRoomTypeServices(0, PAGE_SIZE),
      ]);
      const catalogServiceResult = await getCatalogServices(0, 500).catch(() => ({ data: [], total: 0 }));

      setRoomTypes(roomTypeResult.data);
      setServices(catalogServiceResult.data);
      setRoomTypeServices(roomTypeServiceResult.data);
      setTotal(roomTypeServiceResult.total);
      setSelectedRoomTypeId(ALL_ROOM_TYPES_VALUE);

      const firstRoomType = roomTypeResult.data.find((roomType) => !roomType.deleted) ?? roomTypeResult.data[0];
      if (firstRoomType) {
        setFormData((prev) => ({ ...prev, roomTypeId: prev.roomTypeId || firstRoomType.id }));
      }
    } catch (loadError) {
      console.error(loadError);
      setError("Lỗi tải dữ liệu dịch vụ bổ sung theo loại phòng");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoomTypeServices = async (pageIndex = page, roomTypeId = selectedRoomTypeId) => {
    if (!roomTypeId) {
      return;
    }

    try {
      const { data, total: totalCount } = roomTypeId === ALL_ROOM_TYPES_VALUE
        ? await getRoomTypeServices(pageIndex, PAGE_SIZE)
        : await getRoomTypeServicesByRoomTypePaged(roomTypeId, pageIndex, PAGE_SIZE);
      setRoomTypeServices(data);
      setTotal(totalCount);
    } catch (loadError) {
      console.error(loadError);
      setError("Lỗi tải danh sách dịch vụ bổ sung theo loại phòng");
    }
  };

  const handleEdit = (item: RoomTypeServiceResponse) => {
    setEditingId(item.id);
    setFormData({
      roomTypeId: item.roomTypeId || selectedRoomTypeId,
      serviceId: item.serviceId,
      amount: item.amount,
      deleted: !!item.deleted,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.serviceId.trim()) {
      setError("Vui lòng chọn dịch vụ");
      return;
    }

    const roomTypeId = formData.roomTypeId || (selectedRoomTypeId !== ALL_ROOM_TYPES_VALUE ? selectedRoomTypeId : "");
    if (!roomTypeId) {
      setError("Vui lòng chọn loại phòng");
      return;
    }

    try {
      if (editingId) {
        await updateRoomTypeService(editingId, {
          roomTypeId,
          serviceId: formData.serviceId,
          amount: formData.amount,
          deleted: formData.deleted,
        });
        setSuccess("Cập nhật dịch vụ bổ sung thành công");
      } else {
        await createRoomTypeService({
          roomTypeId,
          serviceId: formData.serviceId.trim(),
          amount: formData.amount,
          deleted: formData.deleted,
        });
        setSuccess("Thêm dịch vụ bổ sung thành công");
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ roomTypeId, serviceId: "", amount: 1, deleted: false });
      const nextSelectedRoomTypeId = selectedRoomTypeId === ALL_ROOM_TYPES_VALUE ? ALL_ROOM_TYPES_VALUE : roomTypeId;
      setSelectedRoomTypeId(nextSelectedRoomTypeId);
      await loadRoomTypeServices(page, nextSelectedRoomTypeId);
    } catch (saveError) {
      console.error(saveError);
      setError("Lỗi lưu dịch vụ bổ sung");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRoomTypeService(id);
      setDeleteTarget(null);
      setSuccess("Xóa dịch vụ bổ sung thành công");
      await loadRoomTypeServices(page);
    } catch (deleteError) {
      console.error(deleteError);
      setError("Lỗi xóa dịch vụ bổ sung");
    }
  };

  const activeRoomTypes = roomTypes.filter((roomType) => !roomType.deleted);
  const getRoomTypeName = (item: RoomTypeServiceResponse) =>
    item.roomTypeName || roomTypes.find((roomType) => roomType.id === item.roomTypeId)?.name || item.roomTypeId;
  const getServiceName = (item: RoomTypeServiceResponse) =>
    item.serviceName || item.service?.name || services.find((service) => service.id === item.serviceId)?.name || item.serviceId;

  return (
    <div className="p-6">
      <div className="mb-6 rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/80 md:flex md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bảng trung gian dịch vụ bổ sung theo loại phòng</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Quản lý dịch vụ bán thêm được áp dụng cho từng loại phòng.
          </p>
        </div>
        {permission.has("ROOM_TYPE_SERVICE_CREATE") ? (
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({
              roomTypeId: selectedRoomTypeId !== ALL_ROOM_TYPES_VALUE ? selectedRoomTypeId : "",
              serviceId: "",
              amount: 1,
              deleted: false,
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          + Thêm dịch vụ bổ sung
        </Button>
        ) : null}
      </div>

      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-200">{error}</div>}
      {success && <div className="mb-4 rounded bg-green-100 p-3 text-green-700 dark:bg-green-900/30 dark:text-green-200">{success}</div>}

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Đang tải...</div>
      ) : (
        <>
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lọc theo loại phòng</Label>
            <select
              value={selectedRoomTypeId}
              onChange={(event) => {
                setPage(0);
                setSelectedRoomTypeId(event.target.value);
              }}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value={ALL_ROOM_TYPES_VALUE}>Tất cả loại phòng</option>
              {activeRoomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/80">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Loại phòng</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Dịch vụ</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Số lượng</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {roomTypeServices.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => router.push(`/admin/room-type-services/${item.id}`)}
                      className={`cursor-pointer border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 ${item.deleted ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}
                    >
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{getRoomTypeName(item)}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                        <div className="font-medium">{getServiceName(item)}</div>
                        <div className="text-xs text-gray-400">{item.serviceId}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{item.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.deleted ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"}`}>
                          {item.deleted ? "Đã xóa" : "Hoạt động"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                          <Button type="button" variant="outline" disabled={!permission.has("ROOM_TYPE_SERVICE_UPDATE")} onClick={() => handleEdit(item)} className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-45 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/40">
                            Sửa
                          </Button>
                          {permission.has("ROOM_TYPE_SERVICE_DELETE") && !item.deleted && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setDeleteTarget({
                                id: item.id,
                                title: "Xóa dịch vụ bổ sung",
                                description: `Bạn chắc chắn muốn xóa dịch vụ "${getServiceName(item)}" khỏi loại phòng này?`,
                              })}
                              className="h-8 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                            >
                              Xóa
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {roomTypeServices.length === 0 && <div className="py-8 text-center text-gray-500">Chưa có dịch vụ bổ sung nào</div>}
            </div>
            <div className="px-4 pb-4">
              <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
            </div>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {editingId ? "Cập nhật dịch vụ bổ sung" : "Thêm dịch vụ bổ sung"}
            </h3>

            <div className="space-y-4">
              {!editingId && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loại phòng</Label>
                  <select
                    value={formData.roomTypeId || (selectedRoomTypeId !== ALL_ROOM_TYPES_VALUE ? selectedRoomTypeId : "")}
                    onChange={(event) => setFormData({ ...formData, roomTypeId: event.target.value })}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  >
                    <option value="">-- Chọn loại phòng --</option>
                    {activeRoomTypes.map((roomType) => (
                      <option key={roomType.id} value={roomType.id}>
                        {roomType.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editingId && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loại phòng</Label>
                  <Input value={roomTypes.find((roomType) => roomType.id === (formData.roomTypeId || selectedRoomTypeId))?.name || selectedRoomTypeId} disabled className="mt-1" />
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dịch vụ</Label>
                <select
                  value={formData.serviceId}
                  disabled={services.length === 0}
                  onChange={(event) => setFormData({ ...formData, serviceId: event.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="">
                    {services.length === 0 ? "-- Chưa tải được danh sách dịch vụ --" : "-- Chọn dịch vụ --"}
                  </option>
                  {services.filter((service) => !service.deleted).map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} {service.price ? `- ${Number(service.price).toLocaleString("vi-VN")}đ` : ""}
                    </option>
                  ))}
                </select>
                {services.length === 0 && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                    Không tải được danh sách dịch vụ. Kiểm tra catalog-service và api-gateway đã chạy bản mới.
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Số lượng</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.amount}
                  onChange={(event) => setFormData({ ...formData, amount: parseInt(event.target.value) || 1 })}
                  onFocus={(event) => {
                    if (event.currentTarget.value === "1") {
                      event.currentTarget.select();
                    }
                  }}
                  className="mt-1"
                />
              </div>

              {editingId && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái xóa</Label>
                  <select
                    value={formData.deleted ? "deleted" : "active"}
                    onChange={(event) => setFormData({ ...formData, deleted: event.target.value === "deleted" })}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="deleted">Đã xóa</option>
                  </select>
                </div>
              )}
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

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.title}
        description={deleteTarget?.description ?? ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />
    </div>
  );
}



