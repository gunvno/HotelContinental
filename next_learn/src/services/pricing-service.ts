import { publicHttp } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type RoomRateQuoteItem = {
  date: string;
  basePrice: number;
  multiplier: number;
  ruleName: string;
  ruleType: string;
  finalUnitPrice: number;
  quantity: number;
  finalPrice: number;
};

export type RoomRateQuoteResponse = {
  roomTypeId?: string;
  basePrice: number;
  totalPrice: number;
  items: RoomRateQuoteItem[];
};

export type RoomRateQuotePayload = {
  roomTypeId?: string;
  basePrice: number;
  checkin: string;
  checkout: string;
  stayType: "NIGHT" | "HOUR";
};

export async function quoteRoomRate(
  payload: RoomRateQuotePayload,
): Promise<RoomRateQuoteResponse> {
  const res = await publicHttp
    .post("catalog/room-rate-rules/quote", { json: payload })
    .json<ApiResponse<RoomRateQuoteResponse>>();

  return (res.result ?? res.content) as RoomRateQuoteResponse;
}
