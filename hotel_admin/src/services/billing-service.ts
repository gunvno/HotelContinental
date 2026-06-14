import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type PaymentRequestStatus = "PENDING" | "PAID" | "EXPIRED" | "FAILED";

export type PaymentRequestResponse = {
  id: string;
  roomBookingId: string;
  amount: number;
  transferContent: string;
  status: PaymentRequestStatus;
  provider?: string;
  providerOrderCode?: number;
  providerPaymentLinkId?: string;
  providerCheckoutUrl?: string;
  providerQrCode?: string;
  paidTime?: string;
  expiredTime?: string;
};

export async function getLatestPaymentRequestByBooking(roomBookingId: string) {
  const res = await http
    .get(`billing/payment-requests/booking/${roomBookingId}`)
    .json<ApiResponse<PaymentRequestResponse>>();
  return (res.result ?? res.content) as PaymentRequestResponse;
}

export async function mockPaymentRequestPaid(id: string) {
  const res = await http
    .post(`billing/payment-requests/${id}/mock-paid`)
    .json<ApiResponse<PaymentRequestResponse>>();
  return (res.result ?? res.content) as PaymentRequestResponse;
}
