import { http, publicHttp } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type FeedbackResponse = {
  id: string;
  roomBookingDetailId: string;
  roomId?: string | null;
  rating: number;
  comment: string;
  customerName?: string | null;
  anonymous?: boolean;
  createdTime?: string;
  createdBy?: string;
  modifiedTime?: string;
  modifiedBy?: string;
};

export type FeedbackPayload = {
  roomBookingDetailId: string;
  roomId: string;
  rating: number;
  comment: string;
  customerName?: string | null;
  anonymous?: boolean;
};

export async function submitFeedback(payload: FeedbackPayload) {
  const res = await http
    .post("feedback/feedbacks", { json: payload })
    .json<ApiResponse<FeedbackResponse>>();
  return (res.result ?? res.content) as FeedbackResponse;
}

export async function getMyFeedback(roomBookingDetailId: string) {
  const res = await http
    .get(`feedback/feedbacks/me/${roomBookingDetailId}`)
    .json<ApiResponse<FeedbackResponse | null>>();
  return (res.result ?? res.content ?? null) as FeedbackResponse | null;
}

export async function getRoomFeedbacks(roomId: string) {
  const res = await publicHttp
    .get(`feedback/feedbacks/room/${roomId}`)
    .json<ApiResponse<FeedbackResponse[]>>();
  return (res.result ?? res.content ?? []) as FeedbackResponse[];
}
