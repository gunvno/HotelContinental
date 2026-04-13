import { http } from "@/lib/http";
import { clientEnv } from "@/lib/env";
import { useAuthStore } from "@/store/auth-store";
import type { ApiResponse } from "@/types/api-types";

// ============= ROOM TYPES =============
export type RoomTypePayload = {
  name: string;
  description?: string;
  maximumOccupancy: number;
  quantity?: number;
};

export type RoomTypeResponse = {
  id: string;
  name: string;
  description?: string;
  maximumOccupancy: number;
  quantity: number;
  createdBy?: string;
  createdTime?: string;
  modifiedBy?: string;
  modifiedTime?: string;
};

// ============= AMENITIES =============
export type AmenityPayload = {
  name: string;
  description?: string;
};

export type AmenityResponse = {
  id: string;
  name: string;
  description?: string;
  status: "AVAILABLE" | "UNAVAILABLE";
  createdBy?: string;
  createdTime?: string;
  modifiedBy?: string;
  modifiedTime?: string;
};

// ============= AMENITY ROOMS =============
export type AmenityRoomPayload = {
  amenityId: string;
  roomTypeId: string;
  amount: number;
};

export type AmenityRoomResponse = {
  id: string;
  amenity: AmenityResponse;
  roomTypeId: string;
  amount: number;
  createdBy?: string;
  createdTime?: string;
};

// ============= ROOM TYPE SERVICES =============
export type RoomTypeServicePayload = {
  roomTypeId: string;
  serviceId: string;
  amount: number;
};

export type RoomTypeServiceResponse = {
  id: string;
  roomTypeId: string;
  serviceId: string;
  amount: number;
  createdBy?: string;
  createdTime?: string;
  modifiedBy?: string;
  modifiedTime?: string;
  deleted?: boolean;
};

// ============= ROOMS =============
export type CreateRoomPayload = {
  roomTypes: {
    id: string;
  };
  image?: string;
  name: string;
  pricePerDay: number;
  pricePerHour: number;
  address: string;
  description?: string;
  roomSize: string;
  status?: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
};

export type RoomResponse = {
  id?: string;
  name: string;
  image?: string;
  pricePerDay: number;
  pricePerHour: number;
  address: string;
  description?: string;
  roomSize: string;
  status: string;
  createdBy?: string;
};

export type RoomTypeOption = {
  id: string;
  name: string;
};

type RoomForCustomerApi = {
  roomTypes?: {
    id: string;
    name?: string;
  } | null;
};

type SpringPage<T> = {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
};

// ============= ROOM TYPE SERVICES =============
export async function createRoomType(payload: RoomTypePayload): Promise<RoomTypeResponse> {
  const res = await http.post("room/roomType", { json: payload }).json<ApiResponse<RoomTypeResponse>>();
  return (res.result ?? res.content) as RoomTypeResponse;
}

export async function getRoomTypes(page = 0, size = 10): Promise<{ data: RoomTypeResponse[]; total: number }> {
  const res = await http
    .get("room/roomType", {
      searchParams: { page, size },
    })
    .json<ApiResponse<SpringPage<RoomTypeResponse>>>();

  const pageData = (res.result ?? res.content) as SpringPage<RoomTypeResponse> | undefined;
  return {
    data: pageData?.content ?? [],
    total: pageData?.totalElements ?? 0,
  };
}

export async function getRoomType(id: string): Promise<RoomTypeResponse> {
  const res = await http.get(`room/roomType/${id}`).json<ApiResponse<RoomTypeResponse>>();
  return (res.result ?? res.content) as RoomTypeResponse;
}

export async function updateRoomType(id: string, payload: RoomTypePayload): Promise<RoomTypeResponse> {
  const res = await http.put(`room/roomType/${id}`, { json: payload }).json<ApiResponse<RoomTypeResponse>>();
  return (res.result ?? res.content) as RoomTypeResponse;
}

export async function deleteRoomType(id: string): Promise<void> {
  await http.delete(`room/roomType/${id}`);
}

// ============= AMENITY SERVICES =============
export async function createAmenity(payload: AmenityPayload): Promise<AmenityResponse> {
  const res = await http.post("room/amenity", { json: payload }).json<ApiResponse<AmenityResponse>>();
  return (res.result ?? res.content) as AmenityResponse;
}

export async function getAmenities(page = 0, size = 10): Promise<{ data: AmenityResponse[]; total: number }> {
  const res = await http
    .get("room/amenity", {
      searchParams: { page, size },
    })
    .json<ApiResponse<SpringPage<AmenityResponse>>>();

  const pageData = (res.result ?? res.content) as SpringPage<AmenityResponse> | undefined;
  return {
    data: pageData?.content ?? [],
    total: pageData?.totalElements ?? 0,
  };
}

export async function getAmenity(id: string): Promise<AmenityResponse> {
  const res = await http.get(`room/amenity/${id}`).json<ApiResponse<AmenityResponse>>();
  return (res.result ?? res.content) as AmenityResponse;
}

export async function updateAmenity(
  id: string,
  payload: { name?: string; description?: string; status?: "AVAILABLE" | "UNAVAILABLE" }
): Promise<AmenityResponse> {
  const res = await http.put(`room/amenity/${id}`, { json: payload }).json<ApiResponse<AmenityResponse>>();
  return (res.result ?? res.content) as AmenityResponse;
}

export async function deleteAmenity(id: string): Promise<void> {
  await http.delete(`room/amenity/${id}`);
}

// ============= AMENITY ROOM SERVICES =============
export async function createAmenityRoom(payload: AmenityRoomPayload): Promise<AmenityRoomResponse> {
  const res = await http.post("room/amenityRoom", { json: payload }).json<ApiResponse<AmenityRoomResponse>>();
  return (res.result ?? res.content) as AmenityRoomResponse;
}

export async function getAmenityRoomsByRoomType(roomTypeId: string): Promise<AmenityRoomResponse[]> {
  const res = await http
    .get(`room/amenityRoom/roomType/${roomTypeId}`)
    .json<ApiResponse<AmenityRoomResponse[]>>();
  return (res.result ?? res.content) as AmenityRoomResponse[];
}

export async function getAmenityRoomsByRoomTypePaged(
  roomTypeId: string,
  page = 0,
  size = 20
): Promise<{ data: AmenityRoomResponse[]; total: number }> {
  const res = await http
    .get(`room/amenityRoom/roomType/${roomTypeId}`, {
      searchParams: { page, size },
    })
    .json<ApiResponse<SpringPage<AmenityRoomResponse>>>();

  const pageData = (res.result ?? res.content) as SpringPage<AmenityRoomResponse> | undefined;
  return {
    data: pageData?.content ?? [],
    total: pageData?.totalElements ?? 0,
  };
}

export async function updateAmenityRoom(id: string, payload: { amount: number }): Promise<AmenityRoomResponse> {
  const res = await http.put(`room/amenityRoom/${id}`, { json: payload }).json<ApiResponse<AmenityRoomResponse>>();
  return (res.result ?? res.content) as AmenityRoomResponse;
}

export async function deleteAmenityRoom(id: string): Promise<void> {
  await http.delete(`room/amenityRoom/${id}`);
}

// ============= ROOM TYPE SERVICE SERVICES =============
export async function createRoomTypeService(payload: RoomTypeServicePayload): Promise<RoomTypeServiceResponse> {
  const res = await http.post("room/roomTypeService", { json: payload }).json<ApiResponse<RoomTypeServiceResponse>>();
  return (res.result ?? res.content) as RoomTypeServiceResponse;
}

export async function getRoomTypeServices(page = 0, size = 10): Promise<{ data: RoomTypeServiceResponse[]; total: number }> {
  const res = await http
    .get("room/roomTypeService", {
      searchParams: { page, size },
    })
    .json<ApiResponse<SpringPage<RoomTypeServiceResponse>>>();

  const pageData = (res.result ?? res.content) as SpringPage<RoomTypeServiceResponse> | undefined;
  return {
    data: pageData?.content ?? [],
    total: pageData?.totalElements ?? 0,
  };
}

export async function getRoomTypeServicesByRoomType(roomTypeId: string): Promise<RoomTypeServiceResponse[]> {
  const res = await http
    .get(`room/roomTypeService/roomType/${roomTypeId}`)
    .json<ApiResponse<RoomTypeServiceResponse[]>>();
  return (res.result ?? res.content) as RoomTypeServiceResponse[];
}

export async function getRoomTypeServicesByRoomTypePaged(
  roomTypeId: string,
  page = 0,
  size = 20
): Promise<{ data: RoomTypeServiceResponse[]; total: number }> {
  const res = await http
    .get(`room/roomTypeService/roomType/${roomTypeId}`, {
      searchParams: { page, size },
    })
    .json<ApiResponse<SpringPage<RoomTypeServiceResponse>>>();

  const pageData = (res.result ?? res.content) as SpringPage<RoomTypeServiceResponse> | undefined;
  return {
    data: pageData?.content ?? [],
    total: pageData?.totalElements ?? 0,
  };
}

export async function updateRoomTypeService(
  id: string,
  payload: { serviceId?: string; amount?: number }
): Promise<RoomTypeServiceResponse> {
  const res = await http.put(`room/roomTypeService/${id}`, { json: payload }).json<ApiResponse<RoomTypeServiceResponse>>();
  return (res.result ?? res.content) as RoomTypeServiceResponse;
}

export async function deleteRoomTypeService(id: string): Promise<void> {
  await http.delete(`room/roomTypeService/${id}`);
}

// ============= ROOM SERVICES (EXISTING) =============
export async function getRoomTypeOptions(): Promise<RoomTypeOption[]> {
  const res = await http
    .get("room/customer", {
      searchParams: {
        page: 0,
        size: 200,
      },
    })
    .json<ApiResponse<SpringPage<RoomForCustomerApi>>>();

  const pageData = (res.result ?? res.content) as SpringPage<RoomForCustomerApi> | undefined;
  const content = pageData?.content ?? [];

  const map = new Map<string, RoomTypeOption>();
  for (const item of content) {
    const roomType = item.roomTypes;
    if (!roomType?.id) {
      continue;
    }

    if (!map.has(roomType.id)) {
      map.set(roomType.id, {
        id: roomType.id,
        name: roomType.name?.trim() || `Room Type ${roomType.id.slice(0, 8)}`,
      });
    }
  }

  return Array.from(map.values());
}

export async function createRoom(payload: CreateRoomPayload): Promise<RoomResponse> {
  const res = await http.post("room", { json: payload }).json<ApiResponse<RoomResponse>>();
  return (res.result ?? res.content) as RoomResponse;
}

export async function uploadRoomImages(roomId: string, files: File[], coverIndex = 0): Promise<void> {
  if (!files.length) {
    return;
  }

  const token = useAuthStore.getState().token;
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  formData.append("coverIndex", String(coverIndex));

  const url = `${clientEnv.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")}/room/${roomId}/images`;
  const response = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload room images failed");
  }
}
