import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type RevenueTimePointResponse = {
  date: string;
  amount: number;
};

export type RevenueBreakdownResponse = {
  label: string;
  amount: number;
};

export type RevenueSummaryResponse = {
  fromDate: string;
  toDate: string;
  totalCollected: number;
  todayCollected: number;
  roomRevenue: number;
  serviceRevenue: number;
  extraRevenue: number;
  pendingBookingValue: number;
  paymentCount: number;
  bookingCount: number;
  paidBookingCount: number;
  checkedInBookingCount: number;
  checkedOutBookingCount: number;
  dailyRevenue: RevenueTimePointResponse[];
  breakdown: RevenueBreakdownResponse[];
};

export async function getRevenueSummary(from?: string, to?: string) {
  const searchParams: Record<string, string> = {};
  if (from) searchParams.from = from;
  if (to) searchParams.to = to;

  const res = await http
    .get("report/revenue/summary", { searchParams })
    .json<ApiResponse<RevenueSummaryResponse>>();

  return (res.result ?? res.content) as RevenueSummaryResponse;
}
