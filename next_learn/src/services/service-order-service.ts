import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type ServiceOrderDetailStatus = "WAITING" | "SERVED";
export type ServiceOrderApprovalStatus = "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED";
export type ServiceOrderSource = "INCLUDED" | "EXTRA";
export type ServiceOrderPaymentStatus = "POST_TO_ROOM" | "PENDING_PAYMENT" | "PAID";

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
  servedTime?: string;
  servedBy?: string;
  createdTime?: string;
  createdBy?: string;
};

export async function getMyServiceOrderDetails(roomBookingId: string) {
  const res = await http
    .get("billing/service-order-details/me", {
      searchParams: { roomBookingId },
    })
    .json<ApiResponse<ServiceOrderDetailResponse[]>>();

  return (res.result ?? res.content ?? []) as ServiceOrderDetailResponse[];
}

export async function createMyServiceOrderDetail(payload: ServiceOrderDetailPayload) {
  const res = await http
    .post("billing/service-order-details/me", { json: payload })
    .json<ApiResponse<ServiceOrderDetailResponse>>();

  return (res.result ?? res.content) as ServiceOrderDetailResponse;
}
