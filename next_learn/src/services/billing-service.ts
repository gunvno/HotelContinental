import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "ONLINE_PAYMENT";
export type PaymentRequestStatus = "PENDING" | "PAID" | "EXPIRED" | "FAILED";
export type PaymentRequestPurpose = "ROOM_BOOKING" | "SERVICE_ORDER";

export type CreatePaymentPayload = {
  roomBookingId: string;
  paymentMethod?: PaymentMethod;
  amount: number;
  note?: string;
};

export type PaymentHistoryResponse = {
  id: string;
  roomBookingId: string;
  purpose?: PaymentRequestPurpose;
  serviceOrderId?: string;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentTime: string;
  note?: string;
  createdTime?: string;
};

export type PaymentRequestResponse = {
  id: string;
  roomBookingId: string;
  purpose?: PaymentRequestPurpose;
  serviceOrderId?: string;
  paymentMethod: PaymentMethod;
  amount: number;
  bankAccountNo: string;
  bankAccountName: string;
  bankName: string;
  transferContent: string;
  status: PaymentRequestStatus;
  providerTransactionId?: string;
  provider?: string;
  providerOrderCode?: number;
  providerPaymentLinkId?: string;
  providerCheckoutUrl?: string;
  providerQrCode?: string;
  paidTime?: string;
  expiredTime?: string;
  createdTime?: string;
};

export type InvoiceResponse = {
  invoiceNo: string;
  roomBookingId: string;
  paymentId: string;
  customerId: string;
  roomId: string;
  totalRoomPrice: number;
  totalServicePrice: number;
  totalExtraPrice: number;
  totalPrice: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  paymentTime: string;
  issuedTime: string;
};

export async function createPayment(payload: CreatePaymentPayload) {
  const res = await http
    .post("billing/payments", { json: { paymentMethod: "ONLINE_PAYMENT", ...payload } })
    .json<ApiResponse<PaymentHistoryResponse>>();
  return (res.result ?? res.content) as PaymentHistoryResponse;
}

export async function getLatestPaymentByBooking(roomBookingId: string) {
  const res = await http
    .get(`billing/payments/booking/${roomBookingId}`)
    .json<ApiResponse<PaymentHistoryResponse>>();
  return (res.result ?? res.content) as PaymentHistoryResponse;
}

export async function getMyPayments() {
  const res = await http
    .get("billing/payments/my")
    .json<ApiResponse<PaymentHistoryResponse[]>>();
  return (res.result ?? res.content ?? []) as PaymentHistoryResponse[];
}

export async function createPaymentRequest(payload: {
  roomBookingId: string;
  serviceOrderId?: string;
  purpose?: PaymentRequestPurpose;
  amount: number;
}) {
  const res = await http
    .post("billing/payment-requests", { json: payload })
    .json<ApiResponse<PaymentRequestResponse>>();
  return (res.result ?? res.content) as PaymentRequestResponse;
}

export async function getPaymentRequest(id: string) {
  const res = await http
    .get(`billing/payment-requests/${id}`)
    .json<ApiResponse<PaymentRequestResponse>>();
  return (res.result ?? res.content) as PaymentRequestResponse;
}

export async function getLatestPaymentRequestByBooking(roomBookingId: string) {
  const res = await http
    .get(`billing/payment-requests/booking/${roomBookingId}`)
    .json<ApiResponse<PaymentRequestResponse>>();
  return (res.result ?? res.content) as PaymentRequestResponse;
}

export async function getMyPaymentRequests() {
  const res = await http
    .get("billing/payment-requests/my")
    .json<ApiResponse<PaymentRequestResponse[]>>();
  return (res.result ?? res.content ?? []) as PaymentRequestResponse[];
}

export async function getInvoiceByBooking(roomBookingId: string) {
  const res = await http
    .get(`billing/invoices/booking/${roomBookingId}`)
    .json<ApiResponse<InvoiceResponse>>();
  return (res.result ?? res.content) as InvoiceResponse;
}
