import { http } from "@/lib/http";
import type { RoomEntity } from "@/components/room/roomcard";
import type { ApiResponse } from "@/types/api-types";

type SpringPage<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
};

type RoomForCustomerApi = {
  id: string;
  roomTypes?: RoomEntity["roomTypes"];
  image?: string | null;
  name: string;
  pricePerDay: number;
  pricePerHour: number;
  address: string;
  description?: string | null;
  roomSize: string;
  status: string;
};

export type RoomCustomerListResult = {
  rooms: RoomEntity[];
  totalPages: number;
  totalElements: number;
};

export async function getRoomsForCustomer(page = 0, size = 200): Promise<RoomCustomerListResult> {
  const res = await http
    .get("room/customer", {
      searchParams: {
        page,
        size,
      },
    })
    .json<ApiResponse<SpringPage<RoomForCustomerApi>>>();

  const pageData = res.result ?? res.content;
  const content = pageData?.content ?? [];

  return {
    rooms: content.map((room) => ({
      id: room.id,
      name: room.name,
      description: room.description ?? "",
      image: room.image ?? null,
      images: [],
      roomSize: room.roomSize,
      pricePerDay: room.pricePerDay,
      pricePerHour: room.pricePerHour,
      address: room.address,
      status: room.status,
      roomTypes: room.roomTypes ?? null,
    })),
    totalPages: pageData?.totalPages ?? 1,
    totalElements: pageData?.totalElements ?? content.length,
  };
}
