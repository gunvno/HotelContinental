"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  tone: ToastTone;
  message: string;
};

type ToastInput = {
  tone?: ToastTone;
  message: string;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_DURATION_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((toast: ToastInput) => {
    const message = toast.message.trim();
    if (!message) return;

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    setToasts((items) => [
      ...items,
      {
        id,
        tone: toast.tone ?? "info",
        message,
      },
    ]);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (message) => showToast({ tone: "success", message }),
      error: (message) => showToast({ tone: "error", message }),
      info: (message) => showToast({ tone: "info", message }),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex w-[min(420px,calc(100vw-40px))] flex-col gap-3">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onClose, TOAST_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [onClose]);

  const toneClass =
    toast.tone === "success"
      ? "border-green-200 bg-green-50 text-green-800"
      : toast.tone === "error"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-[#decdb9] bg-white text-[#17213a]";
  const iconClass =
    toast.tone === "success"
      ? "text-green-700"
      : toast.tone === "error"
        ? "text-red-700"
        : "text-[#9b5c24]";
  const Icon =
    toast.tone === "success" ? CheckCircle2 : toast.tone === "error" ? XCircle : Info;

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-semibold shadow-[0_18px_40px_-24px_rgba(23,33,58,0.55)] ${toneClass}`}
      role="status"
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`} />
      <p className="min-w-0 flex-1 leading-5">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
        aria-label="Đóng thông báo"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastBridge({
  success,
  error,
  onClearSuccess,
  onClearError,
}: {
  success?: string | null;
  error?: string | null;
  onClearSuccess?: () => void;
  onClearError?: () => void;
}) {
  const toast = useToast();

  useEffect(() => {
    if (!success) return;
    if (isErrorLikeMessage(success)) {
      toast.error(success);
    } else {
      toast.success(success);
    }
    onClearSuccess?.();
  }, [onClearSuccess, success, toast]);

  useEffect(() => {
    if (!error) return;
    toast.error(error);
    onClearError?.();
  }, [error, onClearError, toast]);

  return null;
}

function isErrorLikeMessage(message: string) {
  const normalized = message.trim().toLowerCase();
  return [
    "không",
    "khong",
    "lỗi",
    "loi",
    "vui lòng",
    "vui long",
    "token",
    "unauthorized",
    "unauthenticated",
    "cannot",
    "failed",
  ].some((prefix) => normalized.startsWith(prefix));
}
