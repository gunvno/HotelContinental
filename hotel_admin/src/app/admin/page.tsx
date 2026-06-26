"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
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
  getAmenities,
  getAmenityRoomsByRoomTypePaged,
  getCatalogServices,
  getRoomTypes,
  getRoomTypeServices,
  getRoomTypeServicesByRoomTypePaged,
  type RoomTypeResponse,
  type RoomTypeServiceResponse,
  type ServiceResponse,
  updateAmenity,
  updateAmenityRoom,
  updateRoomType,
  updateRoomTypeService,
} from "@/services/room-service";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/room-types");
  }, [router]);

  return null;
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maximumOccupancy: 1,
    quantity: 0,
    deleted: false,
  });
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
    return (
      <PermissionDenied message="Bạn không có quyền ROOM_TYPE_VIEW để xem loại phòng." />
    );
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
      setFormData({
        name: "",
        description: "",
        maximumOccupancy: 1,
        quantity: 0,
        deleted: false,
      });
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
      <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur md:flex-row md:items-end md:justify-between dark:border-gray-700 dark:bg-gray-900/80">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Danh Sách Loại Phòng
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Hiển thị cả bản ghi hoạt động lẫn đã xóa.
          </p>
        </div>
        {canCreateRoomType ? (
          <Button
            disabled={isActionBusy}
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: "",
                description: "",
                maximumOccupancy: 1,
                quantity: 0,
                deleted: false,
              });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            + Thêm Loại Phòng
          </Button>
        ) : null}
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded bg-green-100 p-3 text-green-700 dark:bg-green-900/30 dark:text-green-200">
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Đang tải...</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/80">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Tên Loại
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Mô Tả
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Max Khách
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Số Phòng
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Trạng Thái
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody>
                {roomTypes.map((rt) => (
                  <tr
                    key={rt.id}
                    onClick={() => router.push(`/admin/room-types/${rt.id}`)}
                    className={`cursor-pointer border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 ${rt.deleted ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                      {rt.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {rt.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                      {rt.maximumOccupancy}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                      {rt.quantity}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${rt.deleted ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"}`}
                      >
                        {rt.deleted ? "Đã xóa" : "Hoạt động"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!canUpdateRoomType || isActionBusy}
                          onClick={() => handleEdit(rt)}
                          className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-45 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/40"
                        >
                          Sửa
                        </Button>
                        {canDeleteRoomType && !rt.deleted && (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isActionBusy}
                            onClick={() =>
                              setDeleteTarget({
                                id: rt.id,
                                title: "Xóa loại phòng",
                                description: `Bạn chắc chắn muốn xóa loại phòng "${rt.name}"?`,
                              })
                            }
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
          {roomTypes.length === 0 && (
            <div className="py-10 text-center text-gray-500">Không có dữ liệu</div>
          )}
          <div className="px-4 pb-4">
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {editingId ? "Cập Nhật Loại Phòng" : "Thêm Loại Phòng Mới"}
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tên Loại
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Deluxe Suite"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mô Tả
                </Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Mô tả chi tiết"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Số Khách Tối Đa
                </Label>
                <Input
                  type="number"
                  value={formData.maximumOccupancy}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maximumOccupancy: parseInt(e.target.value) || 1,
                    })
                  }
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
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Số Phòng
                  </Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
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
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trạng Thái Xóa
                  </Label>
                  <Select
                    value={formData.deleted ? "deleted" : "active"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, deleted: value === "deleted" })
                    }
                    className="mt-1"
                    options={[
                      { value: "active", label: "Hoạt động" },
                      { value: "deleted", label: "Đã xóa" },
                    ]}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setIsModalOpen(false)}
                disabled={isActionBusy}
                className="flex-1 bg-gray-300 text-gray-900 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={isActionBusy}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
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
    return (
      <PermissionDenied message="Bạn không có quyền AMENITY_VIEW để xem cơ sở vật chất." />
    );
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
    setFormData({
      name: amenity.name,
      description: amenity.description || "",
      deleted: !!amenity.deleted,
    });
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
      <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur md:flex-row md:items-end md:justify-between dark:border-gray-700 dark:bg-gray-900/80">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Danh Sách Cơ Sở Vật Chất
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Bản ghi đã xóa vẫn hiển thị trong danh sách.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", description: "", deleted: false });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          + Thêm Cơ Sở Vật Chất
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded bg-green-100 p-3 text-green-700 dark:bg-green-900/30 dark:text-green-200">
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Đang tải...</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/80">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Tên Cơ Sở Vật Chất
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Mô Tả
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Trạng Thái Xóa
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Trạng Thái
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody>
                {amenities.map((amenity) => (
                  <tr
                    key={amenity.id}
                    onClick={() => router.push(`/admin/amenities/${amenity.id}`)}
                    className={`cursor-pointer border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 ${amenity.deleted ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                      {amenity.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {amenity.description || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${amenity.status === "AVAILABLE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200"}`}
                      >
                        {amenity.status === "AVAILABLE" ? "Có sẵn" : "Không có"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${amenity.deleted ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"}`}
                      >
                        {amenity.deleted ? "Đã xóa" : "Hoạt động"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!permission.has("AMENITY_UPDATE")}
                          onClick={() => handleEdit(amenity)}
                          className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-45 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/40"
                        >
                          Sửa
                        </Button>
                        {permission.has("AMENITY_DELETE") && !amenity.deleted && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setDeleteTarget({
                                id: amenity.id,
                                title: "Xóa cơ sở vật chất",
                                description: `Bạn chắc chắn muốn xóa cơ sở vật chất "${amenity.name}"?`,
                              })
                            }
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
          {amenities.length === 0 && (
            <div className="py-10 text-center text-gray-500">Không có dữ liệu</div>
          )}
          <div className="px-4 pb-4">
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {editingId ? "Cập Nhật Cơ Sở Vật Chất" : "Thêm Cơ Sở Vật Chất Mới"}
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tên Cơ Sở Vật Chất
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: WiFi"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mô Tả
                </Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Mô tả chi tiết"
                  className="mt-1"
                />
              </div>

              {editingId && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trạng Thái Xóa
                  </Label>
                  <Select
                    value={formData.deleted ? "deleted" : "active"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, deleted: value === "deleted" })
                    }
                    className="mt-1"
                    options={[
                      { value: "active", label: "Hoạt động" },
                      { value: "deleted", label: "Đã xóa" },
                    ]}
                  />
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
              <Button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
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
  const [formData, setFormData] = useState({
    roomTypeId: "",
    amenityId: "",
    amount: 1,
    deleted: false,
  });
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
    return (
      <PermissionDenied message="Bạn không có quyền AMENITY_ROOM_VIEW để xem gán cơ sở vật chất theo loại phòng." />
    );
  }

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [rtData, amenityData] = await Promise.all([
        getRoomTypes(0, 100),
        getAmenities(0, 100),
      ]);
      setRoomTypes(rtData.data);
      setAmenities(amenityData.data);
      const activeRoomTypes = rtData.data.filter((roomType) => !roomType.deleted);
      if (activeRoomTypes.length > 0) {
        setSelectedRoomTypeId(activeRoomTypes[0].id);
        setFormData((prev) => ({
          ...prev,
          roomTypeId: prev.roomTypeId || activeRoomTypes[0].id,
        }));
      } else if (rtData.data.length > 0) {
        setSelectedRoomTypeId(rtData.data[0].id);
        setFormData((prev) => ({
          ...prev,
          roomTypeId: prev.roomTypeId || rtData.data[0].id,
        }));
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
      const { data, total: totalCount } = await getAmenityRoomsByRoomTypePaged(
        selectedRoomTypeId,
        pageIndex,
        PAGE_SIZE,
      );
      setAmenityRooms(data);
      setTotal(totalCount);
    } catch (e) {
      setError("Lỗi tải cơ sở vật chất theo loại phòng");
      console.error(e);
    }
  };

  const handleSave = async () => {
    const roomTypeId =
      formData.roomTypeId ||
      (selectedRoomTypeId !== ALL_ROOM_TYPES_VALUE ? selectedRoomTypeId : "");
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
        await updateAmenityRoom(editingId, {
          amount: formData.amount,
          deleted: formData.deleted,
        });
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
    setFormData({
      roomTypeId: item.roomTypeId || selectedRoomTypeId,
      amenityId: item.amenityId || item.amenity?.id || "",
      amount: item.amount,
      deleted: !!item.deleted,
    });
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Bảng Trung Gian Cơ Sở Vật Chất Theo Loại Phòng
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Danh sách gán cơ sở vật chất cho loại phòng. Khi thêm mới sẽ luôn ở trạng thái
          hoạt động.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded bg-green-100 p-3 text-green-700 dark:bg-green-900/30 dark:text-green-200">
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Đang tải...</div>
      ) : (
        <>
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Chọn Loại Phòng
            </Label>
            <Select
              value={selectedRoomTypeId}
              onValueChange={(value) => {
                setPage(0);
                setSelectedRoomTypeId(value);
              }}
              className="mt-1"
              options={activeRoomTypes.map((rt) => ({
                value: rt.id,
                label: rt.name,
              }))}
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Danh Sách Cơ Sở Vật Chất
            </h3>
            {permission.has("AMENITY_ROOM_CREATE") ? (
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    roomTypeId: selectedRoomTypeId,
                    amenityId: "",
                    amount: 1,
                    deleted: false,
                  });
                  setIsModalOpen(true);
                }}
                className="bg-blue-600 text-white hover:bg-blue-700"
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
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      Tên Cơ Sở Vật Chất
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      Số Lượng
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      Trạng Thái
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {amenityRooms.map((ar) => (
                    <tr
                      key={ar.id}
                      onClick={() => router.push(`/admin/amenity-rooms/${ar.id}`)}
                      className={`cursor-pointer border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 ${ar.deleted ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}
                    >
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                        {ar.amenity?.name || ar.amenityId}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                        {ar.amount}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${ar.deleted ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"}`}
                        >
                          {ar.deleted ? "Đã xóa" : "Hoạt động"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-2"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!permission.has("AMENITY_ROOM_UPDATE")}
                            onClick={() => handleEdit(ar)}
                            className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-45 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/40"
                          >
                            Sửa
                          </Button>
                          {permission.has("AMENITY_ROOM_DELETE") && !ar.deleted && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setDeleteTarget({
                                  id: ar.id,
                                  title: "Xóa gán cơ sở vật chất",
                                  description: `Bạn chắc chắn muốn xóa "${ar.amenity?.name || ar.amenityId}" khỏi loại phòng này?`,
                                })
                              }
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
              {amenityRooms.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  Không có cơ sở vật chất nào
                </div>
              )}
            </div>
            <div className="px-4 pb-4">
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                onPageChange={setPage}
              />
            </div>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {editingId ? "Cập Nhật Cơ Sở Vật Chất Theo Loại" : "Thêm Cơ Sở Vật Chất"}
            </h3>

            <div className="space-y-4">
              {!editingId && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chọn Loại Phòng
                  </Label>
                  <Select
                    value={formData.roomTypeId || selectedRoomTypeId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, roomTypeId: value })
                    }
                    className="mt-1"
                    placeholder="Chọn loại phòng"
                    options={[
                      { value: "", label: "-- Chọn Loại Phòng --" },
                      ...activeRoomTypes.map((rt) => ({
                        value: rt.id,
                        label: rt.name,
                      })),
                    ]}
                  />
                </div>
              )}

              {!editingId && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chọn Cơ Sở Vật Chất
                  </Label>
                  <Select
                    value={formData.amenityId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, amenityId: value })
                    }
                    className="mt-1"
                    placeholder="Chọn cơ sở vật chất"
                    options={[
                      { value: "", label: "-- Chọn Cơ Sở Vật Chất --" },
                      ...activeAmenities.map((a) => ({
                        value: a.id,
                        label: a.name,
                      })),
                    ]}
                  />
                </div>
              )}

              {editingId && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loại Phòng
                  </Label>
                  <Input
                    value={
                      roomTypes.find(
                        (roomType) =>
                          roomType.id === (formData.roomTypeId || selectedRoomTypeId),
                      )?.name || selectedRoomTypeId
                    }
                    disabled
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Số Lượng
                </Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: parseInt(e.target.value) || 1 })
                  }
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
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trạng Thái Xóa
                  </Label>
                  <Select
                    value={formData.deleted ? "deleted" : "active"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, deleted: value === "deleted" })
                    }
                    className="mt-1"
                    options={[
                      { value: "active", label: "Hoạt động" },
                      { value: "deleted", label: "Đã xóa" },
                    ]}
                  />
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
              <Button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
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
  const [selectedRoomTypeId, setSelectedRoomTypeId] =
    useState<string>(ALL_ROOM_TYPES_VALUE);
  const [roomTypeServices, setRoomTypeServices] = useState<RoomTypeServiceResponse[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    roomTypeId: "",
    serviceId: "",
    amount: 1,
    deleted: false,
  });
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
    return (
      <PermissionDenied message="Bạn không có quyền ROOM_TYPE_SERVICE_VIEW để xem gán dịch vụ bổ sung theo loại phòng." />
    );
  }

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [roomTypeResult, roomTypeServiceResult] = await Promise.all([
        getRoomTypes(0, 100),
        getRoomTypeServices(0, PAGE_SIZE),
      ]);
      const catalogServiceResult = await getCatalogServices(0, 500).catch(() => ({
        data: [],
        total: 0,
      }));

      setRoomTypes(roomTypeResult.data);
      setServices(catalogServiceResult.data);
      setRoomTypeServices(roomTypeServiceResult.data);
      setTotal(roomTypeServiceResult.total);
      setSelectedRoomTypeId(ALL_ROOM_TYPES_VALUE);

      const firstRoomType =
        roomTypeResult.data.find((roomType) => !roomType.deleted) ??
        roomTypeResult.data[0];
      if (firstRoomType) {
        setFormData((prev) => ({
          ...prev,
          roomTypeId: prev.roomTypeId || firstRoomType.id,
        }));
      }
    } catch (loadError) {
      console.error(loadError);
      setError("Lỗi tải dữ liệu dịch vụ bổ sung theo loại phòng");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoomTypeServices = async (
    pageIndex = page,
    roomTypeId = selectedRoomTypeId,
  ) => {
    if (!roomTypeId) {
      return;
    }

    try {
      const { data, total: totalCount } =
        roomTypeId === ALL_ROOM_TYPES_VALUE
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

    const roomTypeId =
      formData.roomTypeId ||
      (selectedRoomTypeId !== ALL_ROOM_TYPES_VALUE ? selectedRoomTypeId : "");
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
      const nextSelectedRoomTypeId =
        selectedRoomTypeId === ALL_ROOM_TYPES_VALUE ? ALL_ROOM_TYPES_VALUE : roomTypeId;
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
    item.roomTypeName ||
    roomTypes.find((roomType) => roomType.id === item.roomTypeId)?.name ||
    item.roomTypeId;
  const getServiceName = (item: RoomTypeServiceResponse) =>
    item.serviceName ||
    item.service?.name ||
    services.find((service) => service.id === item.serviceId)?.name ||
    item.serviceId;

  return (
    <div className="p-6">
      <div className="mb-6 rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur md:flex md:items-end md:justify-between dark:border-gray-700 dark:bg-gray-900/80">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Bảng trung gian dịch vụ bổ sung theo loại phòng
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Quản lý dịch vụ bán thêm được áp dụng cho từng loại phòng.
          </p>
        </div>
        {permission.has("ROOM_TYPE_SERVICE_CREATE") ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row md:mt-0">
            <Button
              type="button"
              onClick={() => router.push("/admin/services")}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
            >
              Quản lý dịch vụ gốc
            </Button>
            <Button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  roomTypeId:
                    selectedRoomTypeId !== ALL_ROOM_TYPES_VALUE ? selectedRoomTypeId : "",
                  serviceId: "",
                  amount: 1,
                  deleted: false,
                });
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              + Gán vào loại phòng
            </Button>
          </div>
        ) : null}
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded bg-green-100 p-3 text-green-700 dark:bg-green-900/30 dark:text-green-200">
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Đang tải...</div>
      ) : (
        <>
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Lọc theo loại phòng
            </Label>
            <Select
              value={selectedRoomTypeId}
              onValueChange={(value) => {
                setPage(0);
                setSelectedRoomTypeId(value);
              }}
              className="mt-1"
              options={[
                { value: ALL_ROOM_TYPES_VALUE, label: "Tất cả loại phòng" },
                ...activeRoomTypes.map((roomType) => ({
                  value: roomType.id,
                  label: roomType.name,
                })),
              ]}
            />
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/80">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      Loại phòng
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      Dịch vụ
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roomTypeServices.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => router.push(`/admin/room-type-services/${item.id}`)}
                      className={`cursor-pointer border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 ${item.deleted ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}
                    >
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                        {getRoomTypeName(item)}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                        <div className="font-medium">{getServiceName(item)}</div>
                        <div className="text-xs text-gray-400">{item.serviceId}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                        {item.amount}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.deleted ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"}`}
                        >
                          {item.deleted ? "Đã xóa" : "Hoạt động"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-2"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!permission.has("ROOM_TYPE_SERVICE_UPDATE")}
                            onClick={() => handleEdit(item)}
                            className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-45 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/40"
                          >
                            Sửa
                          </Button>
                          {permission.has("ROOM_TYPE_SERVICE_DELETE") &&
                            !item.deleted && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  setDeleteTarget({
                                    id: item.id,
                                    title: "Xóa dịch vụ bổ sung",
                                    description: `Bạn chắc chắn muốn xóa dịch vụ "${getServiceName(item)}" khỏi loại phòng này?`,
                                  })
                                }
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
              {roomTypeServices.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  Chưa có dịch vụ bổ sung nào
                </div>
              )}
            </div>
            <div className="px-4 pb-4">
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                onPageChange={setPage}
              />
            </div>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {editingId ? "Cập nhật gán dịch vụ" : "Gán dịch vụ vào loại phòng"}
            </h3>

            <div className="space-y-4">
              {!editingId && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loại phòng
                  </Label>
                  <Select
                    value={
                      formData.roomTypeId ||
                      (selectedRoomTypeId !== ALL_ROOM_TYPES_VALUE
                        ? selectedRoomTypeId
                        : "")
                    }
                    onValueChange={(value) =>
                      setFormData({ ...formData, roomTypeId: value })
                    }
                    className="mt-1"
                    options={[
                      { value: "", label: "-- Chọn loại phòng --" },
                      ...activeRoomTypes.map((roomType) => ({
                        value: roomType.id,
                        label: roomType.name,
                      })),
                    ]}
                  />
                </div>
              )}

              {editingId && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loại phòng
                  </Label>
                  <Input
                    value={
                      roomTypes.find(
                        (roomType) =>
                          roomType.id === (formData.roomTypeId || selectedRoomTypeId),
                      )?.name || selectedRoomTypeId
                    }
                    disabled
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dịch vụ
                </Label>
                <Select
                  value={formData.serviceId}
                  disabled={services.length === 0}
                  onValueChange={(value) =>
                    setFormData({ ...formData, serviceId: value })
                  }
                  className="mt-1"
                  options={[
                    {
                      value: "",
                      label:
                        services.length === 0
                          ? "-- Chưa tải được danh sách dịch vụ --"
                          : "-- Chọn dịch vụ --",
                    },
                    ...services
                      .filter((service) => !service.deleted)
                      .map((service) => ({
                        value: service.id,
                        label: `${service.name}${
                          service.price
                            ? ` - ${Number(service.price).toLocaleString("vi-VN")}đ`
                            : ""
                        }`,
                      })),
                  ]}
                />
                {services.length === 0 && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                    Không tải được danh sách dịch vụ. Kiểm tra catalog-service và
                    api-gateway đã chạy bản mới.
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Số lượng
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.amount}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      amount: parseInt(event.target.value) || 1,
                    })
                  }
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
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trạng thái xóa
                  </Label>
                  <Select
                    value={formData.deleted ? "deleted" : "active"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        deleted: value === "deleted",
                      })
                    }
                    className="mt-1"
                    options={[
                      { value: "active", label: "Hoạt động" },
                      { value: "deleted", label: "Đã xóa" },
                    ]}
                  />
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
              <Button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
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
