import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type PaymentRequestStatus = "PENDING" | "PAID" | "EXPIRED" | "FAILED";
export type PaymentRequestPurpose = "ROOM_BOOKING" | "SERVICE_ORDER";

export type PaymentRequestResponse = {
  id: string;
  roomBookingId: string;
  purpose?: PaymentRequestPurpose;
  serviceOrderId?: string;
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

export type InvoiceResponse = {
  invoiceNo: string;
  roomBookingId: string;
  paymentId?: string;
  customerId?: string;
  roomId?: string;
  totalRoomPrice: number;
  totalServicePrice: number;
  totalExtraPrice: number;
  voucherCode?: string;
  discountAmount: number;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  refundStatus?: string;
  refundAmount: number;
  paymentMethod?: string;
  paymentTime?: string;
  issuedTime?: string;
};

export async function getLatestPaymentRequestByBooking(roomBookingId: string) {
  const res = await http
    .get(`billing/payment-requests/booking/${roomBookingId}`)
    .json<ApiResponse<PaymentRequestResponse>>();
  return (res.result ?? res.content) as PaymentRequestResponse;
}

export async function getInvoiceByBooking(roomBookingId: string) {
  const res = await http
    .get(`billing/invoices/booking/${roomBookingId}`)
    .json<ApiResponse<InvoiceResponse>>();
  return (res.result ?? res.content) as InvoiceResponse;
}

export async function mockPaymentRequestPaid(id: string) {
  const res = await http
    .post(`billing/payment-requests/${id}/mock-paid`)
    .json<ApiResponse<PaymentRequestResponse>>();
  return (res.result ?? res.content) as PaymentRequestResponse;
}
