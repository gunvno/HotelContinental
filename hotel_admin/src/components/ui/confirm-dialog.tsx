"use client";

import { Button } from "@/components/ui/button";

export type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title = "Xác nhận thao tác",
  description,
  confirmText = "Xóa",
  cancelText = "Hủy",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#160f08]/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.75rem] border border-[#decdb9] bg-[#fffaf2] p-6 shadow-[0_30px_80px_-36px_rgba(33,23,15,0.75)]">
        <h3 className="font-serif text-3xl font-bold text-[#211a14]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#5f5144]">{description}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="border-[#decdb9] bg-white/80 text-[#211a14]"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-700 text-white hover:bg-red-800"
          >
            {isLoading ? "Đang xử lý..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
