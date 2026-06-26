import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type ServiceOrderDetailStatus = "WAITING" | "SERVED";
export type ServiceOrderApprovalStatus = "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED";
export type ServiceOrderSource = "INCLUDED" | "EXTRA";
export type ServiceOrderPaymentStatus = "POST_TO_ROOM" | "PENDING_PAYMENT" | "PAID";
export type ServiceOrderCheckoutPaymentMethod = "CASH" | "BANK_TRANSFER";

export type ServiceOrderDetailPayload = {
  roomBookingId: string;
  serviceId: string;
  quantity: number;
  description?: string;
};

export type ServiceOrderDetailResponse = {
  id: string;
  serviceId: string;
  serviceName?: string;
  roomBookingId?: string;
  roomBookingDetailId: string;
  roomId?: string;
  roomName?: string;
  quantity: number;
  amount: number;
  price: number;
  totalPrice: number;
  description?: string;
  status: ServiceOrderDetailStatus;
  approvalStatus?: ServiceOrderApprovalStatus;
  source?: ServiceOrderSource;
  chargeable?: boolean;
  paymentStatus?: ServiceOrderPaymentStatus;
  paymentRequestId?: string;
  paymentTime?: string;
  paidBy?: string;
  assignedTo?: string;
  assignedBy?: string;
  assignedTime?: string;
  servedTime?: string;
  servedBy?: string;
  createdTime?: string;
  createdBy?: string;
};

export async function getServiceOrderDetails(roomBookingId?: string) {
  const searchParams = roomBookingId ? { roomBookingId } : undefined;
  const res = await http
    .get("billing/service-order-details", { searchParams })
    .json<ApiResponse<ServiceOrderDetailResponse[]>>();
  return (res.result ?? res.content ?? []) as ServiceOrderDetailResponse[];
}

export async function createServiceOrderDetail(payload: ServiceOrderDetailPayload) {
  const res = await http
    .post("billing/service-order-details", { json: payload })
    .json<ApiResponse<ServiceOrderDetailResponse>>();
  return (res.result ?? res.content) as ServiceOrderDetailResponse;
}

export async function ensureIncludedServiceOrderDetails(roomBookingId: string) {
  const res = await http
    .post(`billing/service-order-details/bookings/${roomBookingId}/included`)
    .json<ApiResponse<ServiceOrderDetailResponse[]>>();
  return (res.result ?? res.content ?? []) as ServiceOrderDetailResponse[];
}

export async function markServiceOrderServed(id: string) {
  const res = await http
    .post(`billing/service-order-details/${id}/serve`)
    .json<ApiResponse<ServiceOrderDetailResponse>>();
  return (res.result ?? res.content) as ServiceOrderDetailResponse;
}

export async function assignServiceOrder(id: string) {
  const res = await http
    .post(`billing/service-order-details/${id}/assign`)
    .json<ApiResponse<ServiceOrderDetailResponse>>();
  return (res.result ?? res.content) as ServiceOrderDetailResponse;
}

export async function approveServiceOrder(id: string) {
  const res = await http
    .post(`billing/service-order-details/${id}/approve`)
    .json<ApiResponse<ServiceOrderDetailResponse>>();
  return (res.result ?? res.content) as ServiceOrderDetailResponse;
}

export async function rejectServiceOrder(id: string) {
  const res = await http
    .post(`billing/service-order-details/${id}/reject`)
    .json<ApiResponse<ServiceOrderDetailResponse>>();
  return (res.result ?? res.content) as ServiceOrderDetailResponse;
}

export async function markBookingServiceOrdersPaidAtCheckout(
  roomBookingId: string,
  payload: { paymentMethod: ServiceOrderCheckoutPaymentMethod; note?: string },
) {
  const res = await http
    .post(`billing/service-order-details/bookings/${roomBookingId}/checkout-payment`, {
      json: payload,
    })
    .json<ApiResponse<ServiceOrderDetailResponse[]>>();
  return (res.result ?? res.content ?? []) as ServiceOrderDetailResponse[];
}

export async function deleteServiceOrderDetail(id: string) {
  await http.delete(`billing/service-order-details/${id}`).json<ApiResponse<void>>();
}
