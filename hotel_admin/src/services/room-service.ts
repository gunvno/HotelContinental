import { clientEnv } from "@/lib/env";
import { http } from "@/lib/http";
import { useAuthStore } from "@/store/auth-store";
import type { ApiResponse } from "@/types/api-types";

// ============= ROOM TYPES =============
export type RoomTypePayload = {
  name: string;
  description?: string;
  maximumOccupancy: number;
  quantity?: number;
  deleted?: boolean;
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
  deleted?: boolean;
};

// ============= AMENITIES =============
export type AmenityPayload = {
  name: string;
  description?: string;
  status?: "AVAILABLE" | "UNAVAILABLE";
  deleted?: boolean;
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
  deleted?: boolean;
};

// ============= AMENITY ROOMS =============
export type AmenityRoomPayload = {
  amenityId: string;
  roomTypeId: string;
  amount: number;
  deleted?: boolean;
};

export type AmenityRoomResponse = {
  id: string;
  amenityId: string;
  amenity?: AmenityResponse;
  roomTypeId: string;
  amount: number;
  createdBy?: string;
  createdTime?: string;
  modifiedBy?: string;
  modifiedTime?: string;
  deleted?: boolean;
};

// ============= ROOM TYPE SERVICES =============
export type RoomTypeServicePayload = {
  roomTypeId: string;
  serviceId: string;
  amount: number;
  deleted?: boolean;
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
  roomTypeId?: string;
  floorId?: string;
  roomTypes?: {
    id: string;
  };
  image?: string;
  name: string;
  pricePerDay: number;
  pricePerHour: number;
  description?: string;
  roomSize: string;
  status?: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
};

export type RoomResponse = {
  id?: string;
  name: string;
  image?: string;
  floorId?: string;
  pricePerDay: number;
  pricePerHour: number;
  description?: string;
  roomSize: string;
  status: string;
  createdBy?: string;
  roomTypeId?: string;
  roomTypes?: RoomTypeResponse | null;
  images?: RoomImageResponse[];
  galleryImages?: string[];
};

export type BuildingSetupPayload = {
  buildingName: string;
  description?: string;
  address?: string;
  floorStart: number;
  floorEnd: number;
  roomsPerFloor: number;
  roomNumberPattern: string;
  defaultRoomTypeId: string;
  defaultPricePerDay: number;
  defaultPricePerHour: number;
  defaultRoomSize: string;
  skipRoomNumbers?: string[];
};

export type BuildingSetupResponse = {
  building: {
    id: string;
    name: string;
    description?: string;
    address?: string;
    status: string;
  };
  floors: Array<{
    id: string;
    buildingId: string;
    name: string;
    floorNumber: number;
    status: string;
  }>;
  rooms: RoomResponse[];
  createdFloorCount: number;
  createdRoomCount: number;
};

export type BuildingResponse = BuildingSetupResponse["building"] & {
  createdTime?: string;
  createdBy?: string;
};

export type FloorResponse = BuildingSetupResponse["floors"][number];

export type RoomImageResponse = {
  id: string;
  url: string;
  publicId?: string;
  isCover?: boolean;
  sortOrder?: number;
};

export type RoomTypeOption = {
  id: string;
  name: string;
};

type RoomForCustomerApi = {
  roomTypeId?: string;
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
  const res = await http.post("catalog/roomType", { json: payload }).json<ApiResponse<RoomTypeResponse>>();
  return (res.result ?? res.content) as RoomTypeResponse;
}

export async function getRoomTypes(page = 0, size = 10): Promise<{ data: RoomTypeResponse[]; total: number }> {
  const res = await http
    .get("catalog/roomType", {
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
  const res = await http.get(`catalog/roomType/${id}`).json<ApiResponse<RoomTypeResponse>>();
  return (res.result ?? res.content) as RoomTypeResponse;
}

export async function updateRoomType(id: string, payload: RoomTypePayload): Promise<RoomTypeResponse> {
  const res = await http.put(`catalog/roomType/${id}`, { json: payload }).json<ApiResponse<RoomTypeResponse>>();
  return (res.result ?? res.content) as RoomTypeResponse;
}

export async function deleteRoomType(id: string): Promise<void> {
  await http.delete(`catalog/roomType/${id}`);
}

// ============= AMENITY SERVICES =============
export async function createAmenity(payload: AmenityPayload): Promise<AmenityResponse> {
  const res = await http.post("catalog/amenity", { json: payload }).json<ApiResponse<AmenityResponse>>();
  return (res.result ?? res.content) as AmenityResponse;
}

export async function getAmenities(page = 0, size = 10): Promise<{ data: AmenityResponse[]; total: number }> {
  const res = await http
    .get("catalog/amenity", {
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
  const res = await http.get(`catalog/amenity/${id}`).json<ApiResponse<AmenityResponse>>();
  return (res.result ?? res.content) as AmenityResponse;
}

export async function updateAmenity(
  id: string,
  payload: { name?: string; description?: string; status?: "AVAILABLE" | "UNAVAILABLE"; deleted?: boolean }
): Promise<AmenityResponse> {
  const res = await http.put(`catalog/amenity/${id}`, { json: payload }).json<ApiResponse<AmenityResponse>>();
  return (res.result ?? res.content) as AmenityResponse;
}

export async function deleteAmenity(id: string): Promise<void> {
  await http.delete(`catalog/amenity/${id}`);
}

// ============= AMENITY ROOM SERVICES =============
export async function createAmenityRoom(payload: AmenityRoomPayload): Promise<AmenityRoomResponse> {
  const res = await http.post("room/amenityRoom", { json: payload }).json<ApiResponse<AmenityRoomResponse>>();
  return enrichAmenityRoom((res.result ?? res.content) as AmenityRoomResponse);
}

export async function getAmenityRoomsByRoomType(roomTypeId: string): Promise<AmenityRoomResponse[]> {
  const res = await http
    .get(`room/amenityRoom/roomType/${roomTypeId}`)
    .json<ApiResponse<AmenityRoomResponse[]>>();
  return enrichAmenityRooms((res.result ?? res.content) as AmenityRoomResponse[]);
}

export async function getAmenityRoom(id: string): Promise<AmenityRoomResponse> {
  const res = await http.get(`room/amenityRoom/${id}`).json<ApiResponse<AmenityRoomResponse>>();
  return enrichAmenityRoom((res.result ?? res.content) as AmenityRoomResponse);
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
    data: await enrichAmenityRooms(pageData?.content ?? []),
    total: pageData?.totalElements ?? 0,
  };
}

export async function updateAmenityRoom(
  id: string,
  payload: { roomTypeId?: string; amenityId?: string; amount: number; deleted?: boolean }
): Promise<AmenityRoomResponse> {
  const res = await http.put(`room/amenityRoom/${id}`, { json: payload }).json<ApiResponse<AmenityRoomResponse>>();
  return enrichAmenityRoom((res.result ?? res.content) as AmenityRoomResponse);
}

export async function deleteAmenityRoom(id: string): Promise<void> {
  await http.delete(`room/amenityRoom/${id}`);
}

// ============= ROOM TYPE SERVICE SERVICES =============
export async function createRoomTypeService(payload: RoomTypeServicePayload): Promise<RoomTypeServiceResponse> {
  const res = await http.post("catalog/roomTypeService", { json: payload }).json<ApiResponse<RoomTypeServiceResponse>>();
  return (res.result ?? res.content) as RoomTypeServiceResponse;
}

export async function getRoomTypeServices(page = 0, size = 10): Promise<{ data: RoomTypeServiceResponse[]; total: number }> {
  const res = await http
    .get("catalog/roomTypeService", {
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
    .get(`catalog/roomTypeService/roomType/${roomTypeId}`)
    .json<ApiResponse<RoomTypeServiceResponse[]>>();
  return (res.result ?? res.content) as RoomTypeServiceResponse[];
}

export async function getRoomTypeService(id: string): Promise<RoomTypeServiceResponse> {
  const res = await http.get(`catalog/roomTypeService/${id}`).json<ApiResponse<RoomTypeServiceResponse>>();
  return (res.result ?? res.content) as RoomTypeServiceResponse;
}

export async function getRoomTypeServicesByRoomTypePaged(
  roomTypeId: string,
  page = 0,
  size = 20
): Promise<{ data: RoomTypeServiceResponse[]; total: number }> {
  const res = await http
    .get(`catalog/roomTypeService/roomType/${roomTypeId}`, {
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
  payload: { roomTypeId?: string; serviceId?: string; amount?: number; deleted?: boolean }
): Promise<RoomTypeServiceResponse> {
  const res = await http.put(`catalog/roomTypeService/${id}`, { json: payload }).json<ApiResponse<RoomTypeServiceResponse>>();
  return (res.result ?? res.content) as RoomTypeServiceResponse;
}

export async function deleteRoomTypeService(id: string): Promise<void> {
  await http.delete(`catalog/roomTypeService/${id}`);
}

// ============= ROOM SERVICES (EXISTING) =============
export async function getRoomTypeOptions(): Promise<RoomTypeOption[]> {
  const { data } = await getRoomTypes(0, 200);
  return data.map((roomType) => ({
    id: roomType.id,
    name: roomType.name?.trim() || `Room Type ${roomType.id.slice(0, 8)}`,
  }));
}

export async function createRoom(payload: CreateRoomPayload): Promise<RoomResponse> {
  const { roomTypes, ...rest } = payload;
  const json = {
    ...rest,
    roomTypeId: payload.roomTypeId ?? roomTypes?.id,
  };
  const res = await http.post("room/room", { json }).json<ApiResponse<RoomResponse>>();
  return enrichRoom((res.result ?? res.content) as RoomResponse);
}

export async function getRoom(id: string): Promise<RoomResponse> {
  const res = await http.get(`room/room/customer/${id}`).json<ApiResponse<RoomResponse>>();
  return enrichRoom((res.result ?? res.content) as RoomResponse);
}

export async function updateRoom(id: string, payload: CreateRoomPayload): Promise<RoomResponse> {
  const { roomTypes, ...rest } = payload;
  const json = {
    ...rest,
    roomTypeId: payload.roomTypeId ?? roomTypes?.id,
  };
  const res = await http.put(`room/room/${id}`, { json }).json<ApiResponse<RoomResponse>>();
  return enrichRoom((res.result ?? res.content) as RoomResponse);
}

export async function setupBuilding(payload: BuildingSetupPayload): Promise<BuildingSetupResponse> {
  const res = await http.post("room/building/setup", { json: payload }).json<ApiResponse<BuildingSetupResponse>>();
  return (res.result ?? res.content) as BuildingSetupResponse;
}

export async function getBuildings(): Promise<BuildingResponse[]> {
  const res = await http.get("room/building").json<ApiResponse<BuildingResponse[]>>();
  return (res.result ?? res.content) as BuildingResponse[];
}

export async function getFloorsByBuilding(buildingId: string): Promise<FloorResponse[]> {
  const res = await http.get(`room/building/${buildingId}/floors`).json<ApiResponse<FloorResponse[]>>();
  return (res.result ?? res.content) as FloorResponse[];
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

  const url = `${clientEnv.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "")}/room/room/${roomId}/images`;
  const response = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!response.ok) {
    let message = "Upload room images failed";
    try {
      const body = (await response.json()) as { message?: string };
      if (body?.message) {
        message = body.message;
      }
    } catch {
      // Keep default message when the response body is not JSON.
    }
    throw new Error(message);
  }
}

export async function deleteRoomImage(roomId: string, imageId: string): Promise<void> {
  await http.delete(`room/room/${roomId}/images/${imageId}`);
}

export async function getAllRooms(page = 0,
  size = 20): Promise<{ data: RoomResponse[]; total: number }> {
  const res = await http
    .get("room/room/customer", {
      searchParams: { page, size },
    })
    .json<ApiResponse<SpringPage<RoomResponse>>>();
  const pageData = (res.result ?? res.content) as SpringPage<RoomResponse> | undefined;
  return {
    data: await enrichRooms(pageData?.content ?? []),
    total: pageData?.totalElements ?? 0,
  };
}

async function enrichRoom(room: RoomResponse): Promise<RoomResponse> {
  const [enriched] = await enrichRooms([room]);
  return enriched;
}

async function enrichRooms(rooms: RoomResponse[]): Promise<RoomResponse[]> {
  if (rooms.length === 0) {
    return rooms;
  }

  const roomTypeIds = new Set(rooms.map((room) => room.roomTypeId).filter(Boolean));
  if (roomTypeIds.size === 0) {
    return rooms;
  }

  const { data: roomTypes } = await getRoomTypes(0, 500);
  const roomTypeMap = new Map(roomTypes.map((roomType) => [roomType.id, roomType]));

  return rooms.map((room) => ({
    ...room,
    roomTypes: room.roomTypes ?? (room.roomTypeId ? roomTypeMap.get(room.roomTypeId) ?? null : null),
  }));
}

async function enrichAmenityRoom(item: AmenityRoomResponse): Promise<AmenityRoomResponse> {
  const [enriched] = await enrichAmenityRooms([item]);
  return enriched;
}

async function enrichAmenityRooms(items: AmenityRoomResponse[]): Promise<AmenityRoomResponse[]> {
  if (items.length === 0) {
    return items;
  }

  const { data: amenities } = await getAmenities(0, 500);
  const amenityMap = new Map(amenities.map((amenity) => [amenity.id, amenity]));

  return items.map((item) => ({
    ...item,
    amenity: item.amenity ?? amenityMap.get(item.amenityId),
  }));
}
