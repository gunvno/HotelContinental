import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type AiSenderType = "CUSTOMER" | "AI";

export type AiConversationResponse = {
  id: string;
  customerId: string;
  customerName?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  createdTime?: string;
};

export type AiMessageResponse = {
  id: string;
  conversationId: string;
  senderType: AiSenderType;
  content: string;
  metadataJson?: string;
  createdTime?: string;
};

export type AiRoomSuggestionResponse = {
  roomId: string;
  roomName: string;
  image?: string;
  pricePerDay?: number;
  pricePerHour?: number;
  description?: string;
  reason?: string;
};

export type AiChatResponse = {
  conversation: AiConversationResponse;
  userMessage: AiMessageResponse;
  assistantMessage: AiMessageResponse;
  suggestions: AiRoomSuggestionResponse[];
};

export async function getOrCreateMyAiConversation() {
  const res = await http
    .get("ai/conversations/me")
    .json<ApiResponse<AiConversationResponse>>();
  return (res.result ?? res.content) as AiConversationResponse;
}

export async function getAiMessages(conversationId: string) {
  const res = await http
    .get(`ai/conversations/${conversationId}/messages`)
    .json<ApiResponse<AiMessageResponse[]>>();
  return (res.result ?? res.content ?? []) as AiMessageResponse[];
}

export async function sendAiMessage(content: string, conversationId?: string) {
  const res = await http
    .post("ai/conversations/chat", { json: { content, conversationId } })
    .json<ApiResponse<AiChatResponse>>();
  return (res.result ?? res.content) as AiChatResponse;
}
