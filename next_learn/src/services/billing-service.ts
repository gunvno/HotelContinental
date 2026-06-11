import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "ONLINE_PAYMENT";

export type CreatePaymentPayload = {
  roomBookingId: string;
  paymentMethod?: PaymentMethod;
  amount: number;
  note?: string;
};

export type PaymentHistoryResponse = {
  id: string;
  roomBookingId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentTime: string;
  note?: string;
  createdTime?: string;
};

export async function createPayment(payload: CreatePaymentPayload) {
  const res = await http
    .post("billing/payments", { json: { paymentMethod: "ONLINE_PAYMENT", ...payload } })
    .json<ApiResponse<PaymentHistoryResponse>>();
  return (res.result ?? res.content) as PaymentHistoryResponse;
}

export async function getLatestPaymentByBooking(roomBookingId: string) {
  const res = await http.get(`billing/payments/booking/${roomBookingId}`).json<ApiResponse<PaymentHistoryResponse>>();
  return (res.result ?? res.content) as PaymentHistoryResponse;
}

export async function getMyPayments() {
  const res = await http.get("billing/payments/my").json<ApiResponse<PaymentHistoryResponse[]>>();
  return (res.result ?? res.content ?? []) as PaymentHistoryResponse[];
}
