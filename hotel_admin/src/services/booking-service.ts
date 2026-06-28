import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type RoomBookingStatus =
  | "PENDING"
  | "DEPOSITED"
  | "CANCEL_REQUESTED"
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
  customerName?: string;
  customerPhone?: string;
  customerIdentityNumber?: string;
  offlineSource?: "WALK_IN" | "PHONE" | string;
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
  voucherCode?: string;
  discountAmount: number;
  refundStatus?: string;
  refundAmount: number;
};

export type RoomBookingCreationPayload = {
  roomId: string;
  checkin: string;
  checkout: string;
  bookingType: "ONLINE" | "OFFLINE";
  customerName?: string;
  customerPhone?: string;
  customerIdentityNumber?: string;
  customerGender?: string;
  customerDateOfBirth?: string;
  offlineSource?: "WALK_IN" | "PHONE";
  roomPrice: number;
  totalRoomPrice: number;
  totalServicePrice?: number;
  totalExtraPrice?: number;
  totalPrice: number;
  deposit?: number;
  voucherCode?: string;
  discountAmount?: number;
  refundStatus?: string;
  refundAmount?: number;
};

export type EditHistoryResponse = {
  id: string;
  roomBookingDetailId?: string;
  fieldName: string;
  content: string;
  description?: string;
  modifiedAt?: string;
  modifiedBy?: string;
};

export type ResidenceRegistrationResponse = {
  id: string;
  roomBookingDetailId?: string;
  fullName: string;
  identityNumber: string;
  gender: string;
  dateOfBirth: string;
};

export type ResidenceGuestPayload = {
  fullName: string;
  identityNumber: string;
  gender: string;
  dateOfBirth: string;
};

export type RoomBookingTotalsPayload = {
  totalRoomPrice: number;
  totalServicePrice: number;
  totalExtraPrice: number;
  totalPrice: number;
  voucherCode?: string;
  discountAmount?: number;
  refundStatus?: string;
  refundAmount?: number;
};

export async function getRoomBookings() {
  const res = await http
    .get("booking/room-bookings")
    .json<ApiResponse<RoomBookingResponse[]>>();
  return (res.result ?? res.content ?? []) as RoomBookingResponse[];
}

export async function createRoomBooking(payload: RoomBookingCreationPayload) {
  const res = await http
    .post("booking/room-bookings", { json: payload })
    .json<ApiResponse<RoomBookingResponse>>();
  return (res.result ?? res.content) as RoomBookingResponse;
}

export async function getBusyRoomIds(start: string, end: string) {
  const res = await http
    .get("booking/availability/busy-room-ids", {
      searchParams: { start, end },
    })
    .json<ApiResponse<string[]>>();
  return (res.result ?? res.content ?? []) as string[];
}

export async function getRoomBooking(id: string) {
  const res = await http
    .get(`booking/room-bookings/${id}`)
    .json<ApiResponse<RoomBookingResponse>>();
  return (res.result ?? res.content) as RoomBookingResponse;
}

export async function getRoomBookingEditHistory(id: string) {
  const res = await http
    .get(`booking/room-bookings/${id}/edit-history`)
    .json<ApiResponse<EditHistoryResponse[]>>();
  return (res.result ?? res.content ?? []) as EditHistoryResponse[];
}

export async function getResidenceRegistrations(id: string) {
  const res = await http
    .get(`booking/room-bookings/${id}/residence-registrations`)
    .json<ApiResponse<ResidenceRegistrationResponse[]>>();
  return (res.result ?? res.content ?? []) as ResidenceRegistrationResponse[];
}

export async function checkInRoomBooking(id: string) {
  const res = await http
    .post(`booking/room-bookings/${id}/check-in`)
    .json<ApiResponse<RoomBookingResponse>>();
  return (res.result ?? res.content) as RoomBookingResponse;
}

export async function registerResidence(id: string, guests: ResidenceGuestPayload[]) {
  const res = await http
    .post(`booking/room-bookings/${id}/residence-registrations`, {
      json: { guests },
    })
    .json<ApiResponse<RoomBookingResponse>>();
  return (res.result ?? res.content) as RoomBookingResponse;
}

export async function checkOutRoomBooking(id: string) {
  const res = await http
    .post(`booking/room-bookings/${id}/check-out`)
    .json<ApiResponse<RoomBookingResponse>>();
  return (res.result ?? res.content) as RoomBookingResponse;
}

export async function updateRoomBookingTotals(
  id: string,
  payload: RoomBookingTotalsPayload,
) {
  const res = await http
    .post(`booking/room-bookings/${id}/totals`, { json: payload })
    .json<ApiResponse<RoomBookingResponse>>();
  return (res.result ?? res.content) as RoomBookingResponse;
}

export async function cancelRoomBooking(id: string) {
  const res = await http
    .post(`booking/room-bookings/${id}/cancel`)
    .json<ApiResponse<RoomBookingResponse>>();
  return (res.result ?? res.content) as RoomBookingResponse;
}

export async function approveRoomBookingCancellation(id: string) {
  const res = await http
    .post(`booking/room-bookings/${id}/approve-cancel`)
    .json<ApiResponse<RoomBookingResponse>>();
  return (res.result ?? res.content) as RoomBookingResponse;
}
