import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type CreateRoomBookingPayload = {
  roomId: string;
  checkin: string;
  checkout: string;
  bookingType?: "ONLINE" | "OFFLINE";
  roomPrice: number;
  totalRoomPrice: number;
  totalServicePrice: number;
  totalExtraPrice: number;
  totalPrice: number;
  deposit?: number;
};

export type RoomBookingResponse = {
  id: string;
  bookingDetailId: string;
  customerId: string;
  roomId: string;
  bookingType: "ONLINE" | "OFFLINE";
  status: "PENDING" | "DEPOSITED" | "CHECKED_IN" | "CANCEL" | "DONE";
  detailStatus: "BOOKED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELED" | "NO_SHOW";
  checkin: string;
  checkout: string;
  checkinReality?: string;
  checkoutReality?: string;
  roomPrice: number;
  totalRoomPrice: number;
  totalServicePrice: number;
  totalExtraPrice: number;
  totalPrice: number;
  deposit: number;
};

export type UpdateRoomBookingTotalsPayload = {
  totalRoomPrice: number;
  totalServicePrice: number;
  totalExtraPrice: number;
  totalPrice: number;
};

export async function createRoomBooking(payload: CreateRoomBookingPayload) {
  const res = await http
    .post("booking/room-bookings", {
      json: { bookingType: "ONLINE", deposit: 0, ...payload },
    })
    .json<ApiResponse<RoomBookingResponse>>();
  return (res.result ?? res.content) as RoomBookingResponse;
}

export async function getRoomBooking(id: string) {
  const res = await http
    .get(`booking/room-bookings/${id}`)
    .json<ApiResponse<RoomBookingResponse>>();
  return (res.result ?? res.content) as RoomBookingResponse;
}

export async function markRoomBookingDeposited(id: string) {
  const res = await http
    .post(`booking/room-bookings/${id}/mark-deposited`)
    .json<ApiResponse<RoomBookingResponse>>();
  return (res.result ?? res.content) as RoomBookingResponse;
}

export async function updateRoomBookingTotals(
  id: string,
  payload: UpdateRoomBookingTotalsPayload,
) {
  const res = await http
    .post(`booking/room-bookings/${id}/totals`, { json: payload })
    .json<ApiResponse<RoomBookingResponse>>();
  return (res.result ?? res.content) as RoomBookingResponse;
}
