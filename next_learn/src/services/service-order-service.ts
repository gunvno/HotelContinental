import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type ServiceOrderDetailStatus = "WAITING" | "SERVED";

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
  quantity: number;
  amount: number;
  price: number;
  totalPrice: number;
  description?: string;
  status: ServiceOrderDetailStatus;
  servedTime?: string;
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
