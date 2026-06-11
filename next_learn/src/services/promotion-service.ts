import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type DiscountType = "PERCENT" | "FIXED";

export type VoucherApplyResponse = {
  voucherId: string;
  voucherDetailId: string;
  code: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  orderAmount: number;
  discountAmount: number;
  finalAmount: number;
};

export async function applyVoucher(code: string, orderAmount: number) {
  const res = await http
    .post("promotion/vouchers/apply", { json: { code, orderAmount } })
    .json<ApiResponse<VoucherApplyResponse>>();
  return (res.result ?? res.content) as VoucherApplyResponse;
}

export async function consumeVoucher(code: string, roomBookingId: string) {
  const res = await http
    .post("promotion/vouchers/consume", { json: { code, roomBookingId } })
    .json<ApiResponse<unknown>>();
  return res.result ?? res.content;
}
