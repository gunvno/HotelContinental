"use client";

import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  type ChatConversationResponse,
  type ChatMessageResponse,
  getChatMessages,
  getOrCreateMyConversation,
  markChatAsRead,
  sendMyChatMessage,
} from "@/services/chat-service";
import { useAuthStore } from "@/store/auth-store";

export function FloatingChat() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const userName = useAuthStore((state) => state.userName);
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversationResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function openSupportChat() {
      handleOpen();
    }

    window.addEventListener("open-support-chat", openSupportChat);
    return () => window.removeEventListener("open-support-chat", openSupportChat);
  }, [token]);

  useEffect(() => {
    if (!open || !token) return;

    let alive = true;

    async function loadConversation() {
      setLoading(true);
      setError(null);

      try {
        const activeConversation = await getOrCreateMyConversation();
        const history = await getChatMessages(activeConversation.id);
        await markChatAsRead(activeConversation.id);

        if (!alive) return;
        setConversation(activeConversation);
        setMessages(history);
      } catch {
        if (alive) {
          setError("Chưa thể kết nối bộ phận hỗ trợ. Vui lòng thử lại sau.");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    void loadConversation();

    return () => {
      alive = false;
    };
  }, [open, token]);

  useEffect(() => {
    if (!open || !conversation?.id) return;

    const intervalId = window.setInterval(async () => {
      if (document.hidden) return;

      try {
        const history = await getChatMessages(conversation.id);
        setMessages(history);
      } catch {
        // Keep current messages visible if a short polling request fails.
      }
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [conversation?.id, open]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, open]);

  function handleOpen() {
    if (!token) {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    setOpen(true);
  }

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = draft.trim();
    if (!content || sending || loading) return;

    setSending(true);
    setError(null);
    setDraft("");

    try {
      const sentMessage = await sendMyChatMessage(content);
      setMessages((current) => [...current, sentMessage]);

      if (!conversation) {
        const activeConversation = await getOrCreateMyConversation();
        setConversation(activeConversation);
      }
    } catch {
      setDraft(content);
      setError("Không gửi được tin nhắn. Bạn thử lại nhé.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed right-5 bottom-6 z-[70] sm:right-8 sm:bottom-8">
      {open ? (
        <section className="bg-background flex h-[min(560px,calc(100vh-130px))] w-[calc(100vw-40px)] max-w-[380px] flex-col overflow-hidden rounded-3xl border border-[#ead8c4] shadow-[0_28px_90px_-30px_rgba(35,20,8,0.55)]">
          <header className="border-border/70 flex items-center justify-between border-b bg-[#fbf5ed] px-4 py-3 dark:bg-white/[0.06]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5319] to-[#d19345] text-white shadow-[0_14px_26px_-18px_rgba(0,0,0,0.8)]">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-foreground text-sm font-bold">Hỗ trợ Continental</h2>
                <p className="text-muted-foreground text-xs">
                  {loading ? "Đang kết nối..." : "Lễ tân sẽ phản hồi tại đây"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng chat"
              className="border-border/70 text-muted-foreground hover:bg-background hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full border transition"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div
            ref={bodyRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[#fffaf4] px-4 py-4 dark:bg-[#0b0f17]"
          >
            {loading ? (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải hội thoại...
              </div>
            ) : messages.length === 0 ? (
              <div className="border-border/70 bg-background text-muted-foreground rounded-2xl border p-4 text-sm leading-6">
                Xin chào {userName || "bạn"}, Continental có thể hỗ trợ gì cho kỳ nghỉ của
                bạn?
              </div>
            ) : (
              messages.map((message) => {
                const mine = message.senderType === "CUSTOMER";

                return (
                  <div
                    key={message.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm leading-6 shadow-sm ${
                        mine
                          ? "rounded-br-md bg-[#c47a34] text-white"
                          : "border-border/70 bg-background text-foreground rounded-bl-md border"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p
                        className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted-foreground"}`}
                      >
                        {formatTime(message.createdTime)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {error ? (
            <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">
              {error}
            </p>
          ) : null}

          <form
            onSubmit={handleSend}
            className="border-border/70 bg-background flex items-end gap-2 border-t p-3"
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={sending || loading}
              rows={1}
              placeholder="Nhập tin nhắn..."
              className="border-border bg-muted/30 text-foreground min-h-11 flex-1 resize-none rounded-2xl border px-3 py-3 text-sm transition outline-none focus:border-[#c47a34] disabled:cursor-not-allowed disabled:opacity-70"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending || loading}
              aria-label="Gửi tin nhắn"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#c47a34] text-white shadow-[0_16px_32px_-20px_rgba(196,122,52,0.9)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Mở chat hỗ trợ"
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5319] via-[#c47a34] to-[#ffd45e] text-white shadow-[0_24px_50px_-20px_rgba(90,47,9,0.85)] transition hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-22px_rgba(90,47,9,0.95)]"
        >
          <span className="absolute inset-1 rounded-full border border-white/25" />
          <MessageCircle className="relative h-7 w-7" />
        </button>
      )}
    </div>
  );
}

function formatTime(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
