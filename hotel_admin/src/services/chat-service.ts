import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api-types";

export type ConversationStatus = "OPEN" | "CLOSED";
export type SenderType = "CUSTOMER" | "STAFF" | "ADMIN" | "SYSTEM";

export type ChatConversationResponse = {
  id: string;
  customerId: string;
  customerName?: string;
  assignedStaffId?: string;
  status: ConversationStatus;
  lastMessage?: string;
  lastMessageTime?: string;
  createdTime?: string;
};

export type ChatMessageResponse = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderType: SenderType;
  content: string;
  readTime?: string;
  createdTime?: string;
};

export async function getChatConversations() {
  const res = await http
    .get("chat/conversations")
    .json<ApiResponse<ChatConversationResponse[]>>();
  return (res.result ?? res.content ?? []) as ChatConversationResponse[];
}

export async function getChatMessages(conversationId: string, after?: string) {
  const searchParams = after ? { after } : undefined;
  const res = await http
    .get(`chat/conversations/${conversationId}/messages`, { searchParams })
    .json<ApiResponse<ChatMessageResponse[]>>();
  return (res.result ?? res.content ?? []) as ChatMessageResponse[];
}

export async function replyChatMessage(conversationId: string, content: string) {
  const res = await http
    .post(`chat/conversations/${conversationId}/reply`, { json: { content } })
    .json<ApiResponse<ChatMessageResponse>>();
  return (res.result ?? res.content) as ChatMessageResponse;
}

export async function closeChatConversation(conversationId: string) {
  const res = await http
    .post(`chat/conversations/${conversationId}/close`)
    .json<ApiResponse<ChatConversationResponse>>();
  return (res.result ?? res.content) as ChatConversationResponse;
}

export async function markChatAsRead(conversationId: string) {
  await http.post(`chat/conversations/${conversationId}/read`).json<ApiResponse<void>>();
}
