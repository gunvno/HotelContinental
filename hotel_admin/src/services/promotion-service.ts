import { http } from "@/lib/http";

type ApiResponse<T> = {
  result?: T;
  content?: T;
};

export type DiscountType = "PERCENT" | "FIXED";
export type VoucherStatus = "VALID" | "EXPIRED";

export type VoucherPayload = {
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  code: string;
  startDate: string;
  endDate: string;
};

export type VoucherResponse = {
  id: string;
  detailId: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  status: VoucherStatus;
  code: string;
  startDate: string;
  endDate: string;
  roomBookingId?: string;
};

export async function createVoucher(payload: VoucherPayload) {
  const res = await http
    .post("promotion/vouchers", { json: payload })
    .json<ApiResponse<VoucherResponse>>();
  return (res.result ?? res.content) as VoucherResponse;
}

export async function getVouchers() {
  const res = await http.get("promotion/vouchers").json<ApiResponse<VoucherResponse[]>>();
  return (res.result ?? res.content ?? []) as VoucherResponse[];
}
