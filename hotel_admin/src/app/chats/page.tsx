"use client";

import {
  Archive,
  CheckCircle2,
  Circle,
  Inbox,
  Loader2,
  RefreshCcw,
  Search,
  Send,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastBridge } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import { cn } from "@/lib/utils";
import {
  type ChatConversationResponse,
  type ChatMessageResponse,
  closeChatConversation,
  getChatConversations,
  getChatMessages,
  markChatAsRead,
  replyChatMessage,
} from "@/services/chat-service";

const statusLabel: Record<ChatConversationResponse["status"], string> = {
  OPEN: "Mở",
  CLOSED: "Đã đóng",
};

export default function ChatsPage() {
  const permission = usePermission();
  const canView = permission.has("CHAT_STAFF_VIEW");
  const canReply = permission.has("CHAT_STAFF_REPLY");
  const canClose = permission.has("CHAT_CLOSE");

  const [conversations, setConversations] = useState<ChatConversationResponse[]>([]);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [action, setAction] = useState<"reply" | "close" | "refresh" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const isBusy = action !== null;

  const loadConversations = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) setLoadingConversations(true);

      try {
        const data = await getChatConversations();
        const sorted = [...data].sort(
          (a, b) =>
            getTime(b.lastMessageTime ?? b.createdTime) -
            getTime(a.lastMessageTime ?? a.createdTime),
        );

        setConversations(sorted);
        setSelectedId((current) => {
          if (current && sorted.some((conversation) => conversation.id === current))
            return current;
          return (
            sorted.find((conversation) => conversation.status === "OPEN")?.id ??
            sorted[0]?.id ??
            null
          );
        });
        setError(null);
      } catch {
        setError(
          "Không thể tải danh sách hội thoại. Hãy kiểm tra chat-service, api-gateway và quyền CHAT_STAFF_VIEW.",
        );
      } finally {
        if (!silent) setLoadingConversations(false);
      }
    },
    [],
  );

  const loadMessages = useCallback(
    async (conversationId: string, { silent = false }: { silent?: boolean } = {}) => {
      if (!silent) setLoadingMessages(true);

      try {
        const data = await getChatMessages(conversationId);
        setMessages(data);
        void markChatAsRead(conversationId).catch(() => undefined);
        setError(null);
      } catch {
        setError("Không thể tải tin nhắn của hội thoại này.");
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!canView) return;

    void loadConversations();
    const intervalId = window.setInterval(() => {
      if (document.hidden) return;
      void loadConversations({ silent: true });
    }, 15000);
    return () => window.clearInterval(intervalId);
  }, [canView, loadConversations]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    void loadMessages(selectedId);
    const intervalId = window.setInterval(() => {
      if (document.hidden) return;
      void loadMessages(selectedId, { silent: true });
    }, 8000);
    return () => window.clearInterval(intervalId);
  }, [loadMessages, selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, selectedId]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const filteredConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return conversations.filter((conversation) => {
      const customerText =
        `${displayCustomerName(conversation)} ${conversation.customerId}`.toLowerCase();
      const messageText = (conversation.lastMessage ?? "").toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        customerText.includes(normalizedQuery) ||
        messageText.includes(normalizedQuery);
      return matchesQuery;
    });
  }, [conversations, query]);

  async function handleRefresh() {
    if (isBusy) return;

    setAction("refresh");
    try {
      await loadConversations();
      if (selectedId) await loadMessages(selectedId);
    } finally {
      setAction(null);
    }
  }

  async function handleReply() {
    const content = draft.trim();
    if (!selectedId || !content || isBusy || !canReply) return;

    setAction("reply");
    setError(null);
    try {
      const sent = await replyChatMessage(selectedId, content);
      setMessages((items) => [...items, sent]);
      setDraft("");
      await loadConversations({ silent: true });
    } catch {
      setError(
        "Không thể gửi phản hồi. Hãy kiểm tra quyền CHAT_STAFF_REPLY hoặc trạng thái hội thoại.",
      );
    } finally {
      setAction(null);
    }
  }

  async function handleClose() {
    if (!selectedId || isBusy || !canClose) return;

    setAction("close");
    setError(null);
    try {
      const updated = await closeChatConversation(selectedId);
      setConversations((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch {
      setError("Không thể đóng hội thoại. Hãy kiểm tra quyền CHAT_CLOSE.");
    } finally {
      setAction(null);
    }
  }

  if (!canView) {
    return (
      <PermissionDenied message="Bạn không có quyền CHAT_STAFF_VIEW để xem tin nhắn hỗ trợ." />
    );
  }

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-4 rounded-2xl border border-[#decdb9] bg-white/85 p-5 shadow-sm md:flex-row md:items-center md:justify-between dark:border-[#3a2e24] dark:bg-white/[0.06]">
        <div>
          <p className="text-sm font-bold tracking-[0.2em] text-[#9b5c24] uppercase">
            Hỗ trợ khách hàng
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#17213a] dark:text-[#f8f1e7]">
            Tin nhắn
          </h2>
        </div>
        <Button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loadingConversations || isBusy}
          className="gap-2"
        >
          <RefreshCcw
            className={cn(
              "h-4 w-4",
              action === "refresh" || loadingConversations ? "animate-spin" : "",
            )}
          />
          Tải lại
        </Button>
      </section>

      {error ? (
        <ToastBridge error={error} onClearError={() => setError(null)} />
      ) : null}

      <section className="flex min-h-[700px] flex-col overflow-hidden rounded-2xl border border-[#decdb9] bg-white shadow-sm lg:flex-row dark:border-[#3a2e24] dark:bg-[#15110d]">
        <aside className="flex shrink-0 flex-col border-b border-[#decdb9] bg-[#fbf8f2] lg:w-[360px] lg:border-r lg:border-b-0 dark:border-[#3a2e24] dark:bg-[#17130f]">
          <div className="space-y-3 border-b border-[#decdb9] p-4 dark:border-[#3a2e24]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9b5c24]" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm khách hoặc nội dung..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loadingConversations ? (
              <LoadingState label="Đang tải hội thoại..." />
            ) : filteredConversations.length === 0 ? (
              <EmptyState label="Chưa có hội thoại phù hợp." />
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setSelectedId(conversation.id)}
                  className={cn(
                    "mb-1.5 w-full rounded-xl border px-3 py-3 text-left transition",
                    selectedId === conversation.id
                      ? "border-[#c8792a] bg-[#fff6df] dark:bg-[#2a2015]"
                      : "border-transparent bg-white hover:border-[#decdb9] dark:bg-white/[0.04] dark:hover:border-[#3a2e24]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#17213a] dark:text-[#f8f1e7]">
                        {displayCustomerName(conversation)}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#8a7967] dark:text-[#cbbba8]">
                        {conversation.lastMessage || "Chưa có tin nhắn"}
                      </p>
                    </div>
                    <StatusPill status={conversation.status} compact />
                  </div>
                  <p className="mt-2 text-[11px] font-semibold text-[#9b5c24]">
                    {formatDateTime(
                      conversation.lastMessageTime ?? conversation.createdTime,
                    )}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          {selectedConversation ? (
            <>
              <header className="flex items-center justify-between gap-4 border-b border-[#decdb9] px-5 py-4 dark:border-[#3a2e24]">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#9b5c24] text-base font-black text-white">
                    {displayCustomerName(selectedConversation).slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-[#17213a] dark:text-[#f8f1e7]">
                      {displayCustomerName(selectedConversation)}
                    </h3>
                    <p className="truncate text-xs text-[#8a7967] dark:text-[#cbbba8]">
                      ID: {shortId(selectedConversation.customerId)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusPill status={selectedConversation.status} />
                  {selectedConversation.status === "OPEN" && canClose ? (
                    <button
                      type="button"
                      onClick={() => void handleClose()}
                      disabled={isBusy}
                      className="inline-flex h-9 items-center gap-2 rounded-full border border-[#decdb9] px-3 text-xs font-bold text-[#6d5c4b] transition hover:bg-[#fbf8f2] disabled:opacity-50 dark:border-[#3a2e24] dark:text-[#d8c9b7]"
                    >
                      {action === "close" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Archive className="h-3.5 w-3.5" />
                      )}
                      Kết thúc
                    </button>
                  ) : null}
                </div>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto bg-[#f8f3eb] p-5 dark:bg-[#120f0c]">
                {loadingMessages ? (
                  <LoadingState label="Đang tải tin nhắn..." />
                ) : messages.length === 0 ? (
                  <EmptyState label="Hội thoại này chưa có tin nhắn." />
                ) : (
                  messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <footer className="border-t border-[#decdb9] bg-white p-4 dark:border-[#3a2e24] dark:bg-[#17130f]">
                {selectedConversation.status === "CLOSED" ? (
                  <div className="rounded-xl bg-[#f1ece4] p-3 text-sm font-semibold text-[#7c6f63] dark:bg-white/[0.06] dark:text-[#d8c9b7]">
                    Hội thoại đã kết thúc.
                  </div>
                ) : (
                  <div className="flex items-end gap-3">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void handleReply();
                        }
                      }}
                      placeholder={
                        canReply ? "Nhập phản hồi..." : "Bạn chưa có quyền trả lời"
                      }
                      disabled={!canReply || isBusy}
                      rows={1}
                      className="min-h-12 flex-1 resize-none rounded-2xl border border-[#decdb9] bg-white px-4 py-3 text-sm transition outline-none focus:border-[#c8792a] focus:ring-2 focus:ring-[#c8792a]/20 disabled:opacity-60 dark:border-[#3a2e24] dark:bg-[#211a14]"
                    />
                    <button
                      type="button"
                      onClick={() => void handleReply()}
                      disabled={!canReply || isBusy || !draft.trim()}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#c47a34] text-white shadow-[0_16px_32px_-20px_rgba(196,122,52,0.9)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Gửi phản hồi"
                    >
                      {action === "reply" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </footer>
            </>
          ) : (
            <div className="flex min-h-[700px] items-center justify-center p-8">
              <EmptyState label="Chọn một hội thoại để bắt đầu xử lý." />
            </div>
          )}
        </main>
      </section>
    </div>
  );
}

function StatusPill({
  status,
  compact = false,
}: {
  status: ChatConversationResponse["status"];
  compact?: boolean;
}) {
  const open = status === "OPEN";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full font-black tracking-[0.12em] uppercase",
        compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1 text-[11px]",
        open ? "bg-emerald-50 text-emerald-700" : "bg-[#f1ece4] text-[#66584b]",
      )}
    >
      {open ? (
        <Circle className="h-2.5 w-2.5 fill-current" />
      ) : (
        <CheckCircle2 className="h-3 w-3" />
      )}
      {statusLabel[status]}
    </span>
  );
}

function MessageBubble({ message }: { message: ChatMessageResponse }) {
  const fromCustomer = message.senderType === "CUSTOMER";
  const fromSystem = message.senderType === "SYSTEM";

  return (
    <div
      className={cn("flex", fromCustomer || fromSystem ? "justify-start" : "justify-end")}
    >
      <div
        className={cn(
          "max-w-[76%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
          fromSystem
            ? "border border-[#decdb9] bg-white text-[#7c6f63]"
            : fromCustomer
              ? "rounded-bl-md bg-white text-[#17213a] dark:bg-white/[0.08] dark:text-[#f8f1e7]"
              : "rounded-br-md bg-[#9b5c24] text-white",
        )}
      >
        <p className="leading-6 whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            "mt-1 text-[10px]",
            fromCustomer || fromSystem ? "text-[#8a7967]" : "text-white/70",
          )}
        >
          {formatTime(message.createdTime)}
        </p>
      </div>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-[#7c6f63] dark:text-[#d8c9b7]">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center text-sm font-semibold text-[#7c6f63] dark:text-[#d8c9b7]">
      <Inbox className="h-10 w-10 text-[#c8792a]" />
      {label}
    </div>
  );
}

function displayCustomerName(conversation: ChatConversationResponse) {
  const name = conversation.customerName?.trim();
  if (name && name !== conversation.customerId && !looksLikeUuid(name)) return name;
  return `Khách #${shortId(conversation.customerId)}`;
}

function looksLikeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function getTime(value?: string) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function formatDateTime(value?: string) {
  if (!value) return "Chưa có thời gian";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function formatTime(value?: string) {
  if (!value) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function shortId(value?: string) {
  if (!value) return "N/A";
  return value.length > 12 ? `${value.slice(0, 8)}...${value.slice(-4)}` : value;
}
