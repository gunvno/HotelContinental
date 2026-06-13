"use client";

import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  type AiConversationResponse,
  type AiMessageResponse,
  type AiRoomSuggestionResponse,
  getAiMessages,
  getOrCreateMyAiConversation,
  sendAiMessage,
} from "@/services/ai-assistant-service";
import { useAuthStore } from "@/store/auth-store";

type SuggestionByMessage = Record<string, AiRoomSuggestionResponse[]>;

const suggestedPrompts = [
  "Tôi cần phòng 2 người dưới 2 triệu từ 15/06 đến 17/06",
  "Có phòng nào thuê theo giờ không?",
  "Tôi muốn phòng có bồn tắm và view đẹp",
];

export function FloatingAiAssistant() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<AiConversationResponse | null>(null);
  const [messages, setMessages] = useState<AiMessageResponse[]>([]);
  const [suggestionsByMessage, setSuggestionsByMessage] = useState<SuggestionByMessage>({});
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !token) return;

    let alive = true;

    async function loadConversation() {
      setLoading(true);
      setError(null);
      try {
        const activeConversation = await getOrCreateMyAiConversation();
        const history = await getAiMessages(activeConversation.id);
        if (!alive) return;
        setConversation(activeConversation);
        setMessages(history);
        setSuggestionsByMessage(extractSuggestions(history));
      } catch {
        if (alive) {
          setError("Chưa thể kết nối AI tư vấn. Kiểm tra ai-assistant-service và api-gateway.");
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

  async function submitMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || sending || loading) return;

    setSending(true);
    setError(null);
    setDraft("");

    try {
      const result = await sendAiMessage(trimmed, conversation?.id);
      setConversation(result.conversation);
      setMessages((current) => [...current, result.userMessage, result.assistantMessage]);
      setSuggestionsByMessage((current) => ({
        ...current,
        [result.assistantMessage.id]: result.suggestions ?? [],
      }));
    } catch {
      setDraft(trimmed);
      setError("AI chưa trả lời được lúc này. Vui lòng thử lại sau.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed right-5 bottom-28 z-[69] sm:right-8">
      {open ? (
        <section className="bg-background flex h-[min(620px,calc(100vh-160px))] w-[calc(100vw-40px)] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-[#ead8c4] shadow-[0_28px_90px_-30px_rgba(35,20,8,0.55)]">
          <header className="flex items-center justify-between border-b border-[#ead8c4] bg-[#fff6e8] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7b4513] to-[#f6c86f] text-white">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#1f2937]">AI tư vấn phòng</h2>
                <p className="text-xs text-[#7c6f63]">
                  Hỏi giá, ngày thuê, tiện nghi và phòng phù hợp
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng AI tư vấn"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ead8c4] text-[#7c6f63] transition hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={bodyRef} className="flex-1 space-y-4 overflow-y-auto bg-[#fffaf4] px-4 py-4">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-[#7c6f63]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải hội thoại AI...
              </div>
            ) : messages.length === 0 ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#ead8c4] bg-white p-4 text-sm leading-6 text-[#3f3429]">
                  Mình có thể gợi ý phòng theo ngân sách, ngày lưu trú, thuê theo giờ và tiện nghi bạn cần.
                </div>
                <div className="space-y-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void submitMessage(prompt)}
                      className="w-full rounded-2xl border border-[#ead8c4] bg-white px-3 py-2 text-left text-xs text-[#5f5144] transition hover:border-[#c47a34] hover:text-[#9b5c24]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const mine = message.senderType === "CUSTOMER";
                const suggestions = suggestionsByMessage[message.id] ?? [];

                return (
                  <div key={message.id} className={`space-y-2 ${mine ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block max-w-[86%] rounded-2xl px-3.5 py-2 text-sm leading-6 shadow-sm ${
                        mine
                          ? "rounded-br-md bg-[#c47a34] text-white"
                          : "rounded-bl-md border border-[#ead8c4] bg-white text-[#3f3429]"
                      }`}
                    >
                      {message.content}
                    </div>
                    {suggestions.length > 0 ? <SuggestionList suggestions={suggestions} /> : null}
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
            onSubmit={(event) => {
              event.preventDefault();
              void submitMessage(draft);
            }}
            className="flex items-end gap-2 border-t border-[#ead8c4] bg-white p-3"
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={sending || loading}
              rows={1}
              placeholder="Ví dụ: phòng 2 người dưới 2 triệu từ 15/06 đến 17/06..."
              className="min-h-11 flex-1 resize-none rounded-2xl border border-[#ead8c4] bg-[#fffaf4] px-3 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#c47a34] disabled:opacity-70"
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
              aria-label="Gửi AI"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#9b5c24] text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Mở AI tư vấn phòng"
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#7b4513] to-[#f6c86f] text-white shadow-[0_22px_48px_-20px_rgba(90,47,9,0.9)] transition hover:-translate-y-0.5"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

function SuggestionList({ suggestions }: { suggestions: AiRoomSuggestionResponse[] }) {
  return (
    <div className="space-y-2 text-left">
      {suggestions.map((room) => (
        <Link
          key={room.roomId}
          href={`/room/roomdetail/${room.roomId}`}
          className="grid grid-cols-[64px_1fr] gap-3 rounded-2xl border border-[#ead8c4] bg-white p-2 text-left shadow-sm transition hover:border-[#c47a34]"
        >
          <div className="overflow-hidden rounded-xl bg-[#f4eadc]">
            {room.image ? (
              <img src={room.image} alt={room.roomName} className="h-16 w-16 object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#1f2937]">{room.roomName}</p>
            <p className="mt-0.5 text-xs font-semibold text-[#c47a34]">
              {formatMoney(room.pricePerDay)} / đêm
            </p>
            {room.reason ? (
              <p className="mt-1 line-clamp-2 text-xs text-[#7c6f63]">{room.reason}</p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}

function extractSuggestions(messages: AiMessageResponse[]): SuggestionByMessage {
  return Object.fromEntries(
    messages
      .map((message) => [message.id, parseSuggestions(message.metadataJson)] as const)
      .filter(([, suggestions]) => suggestions.length > 0),
  );
}

function parseSuggestions(metadataJson?: string): AiRoomSuggestionResponse[] {
  if (!metadataJson) return [];
  try {
    const parsed = JSON.parse(metadataJson) as { suggestions?: AiRoomSuggestionResponse[] };
    return Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
  } catch {
    return [];
  }
}

function formatMoney(value?: number) {
  if (!value) return "Đang cập nhật";
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}
