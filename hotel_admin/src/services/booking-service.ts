import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type RoomBookingStatus =
  | "PENDING"
  | "DEPOSITED"
  | "CHECKED_IN"
  | "CANCEL"
  | "DONE";
export type RoomBookingDetailStatus =
  | "BOOKED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELED"
  | "NO_SHOW";

export type RoomBookingResponse = {
  id: string;
  bookingDetailId?: string;
  customerId: string;
  roomId: string;
  bookingType: "ONLINE" | "OFFLINE";
  status: RoomBookingStatus;
  detailStatus?: RoomBookingDetailStatus;
  checkin?: string;
  checkout?: string;
  checkinReality?: string;
  checkoutReality?: string;
  roomPrice: number;
  totalRoomPrice: number;
  totalServicePrice: number;
  totalExtraPrice: number;
  totalPrice: number;
  deposit: number;
};

export async function getRoomBookings() {
  const res = await http
    .get("booking/room-bookings")
    .json<ApiResponse<RoomBookingResponse[]>>();
  return (res.result ?? res.content ?? []) as RoomBookingResponse[];
}

export async function checkInRoomBooking(id: string) {
  const res = await http
    .post(`booking/room-bookings/${id}/check-in`)
    .json<ApiResponse<RoomBookingResponse>>();
  return (res.result ?? res.content) as RoomBookingResponse;
}

export async function checkOutRoomBooking(id: string) {
  const res = await http
    .post(`booking/room-bookings/${id}/check-out`)
    .json<ApiResponse<RoomBookingResponse>>();
  return (res.result ?? res.content) as RoomBookingResponse;
}
