"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  className?: string;
};

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  itemLabel = "bản ghi",
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  const pages = Array.from({ length: totalPages }, (_, index) => index).filter(
    (index) => index === 0 || index === totalPages - 1 || Math.abs(index - page) <= 1,
  );

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border border-[#e8ddd0] bg-white p-4 shadow-[0_4px_20px_-8px_rgba(120,90,50,0.08)] md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-white/[0.05] ${className}`}
    >
      <p className="text-sm font-medium text-[#6b5e50] dark:text-[#c9b8a4]">
        Hiển thị {from}-{to} trong {total} {itemLabel}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="inline-flex items-center gap-1 rounded-full border border-[#e8ddd0] px-4 py-2 text-sm font-semibold text-[#6b5e50] transition hover:border-[#c47a34] hover:text-[#c47a34] disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:text-[#c9b8a4]"
        >
          <ChevronLeft className="h-4 w-4" />
          Trước
        </button>

        {pages.map((pageIndex, index) => {
          const previousPage = pages[index - 1];
          const needsGap = previousPage !== undefined && pageIndex - previousPage > 1;

          return (
            <span key={pageIndex} className="flex items-center gap-2">
              {needsGap ? (
                <span className="px-1 text-sm font-bold text-[#8b7a6a]">...</span>
              ) : null}
              <button
                type="button"
                onClick={() => onPageChange(pageIndex)}
                className={`grid size-10 place-items-center rounded-full border text-sm font-bold transition ${
                  pageIndex === page
                    ? "border-[#c47a34] bg-[#c47a34] text-white shadow-md shadow-[#c47a34]/20"
                    : "border-[#e8ddd0] bg-white text-[#6b5e50] hover:border-[#c47a34] hover:text-[#c47a34] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#c9b8a4]"
                }`}
              >
                {pageIndex + 1}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          className="inline-flex items-center gap-1 rounded-full border border-[#e8ddd0] px-4 py-2 text-sm font-semibold text-[#6b5e50] transition hover:border-[#c47a34] hover:text-[#c47a34] disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:text-[#c9b8a4]"
        >
          Sau
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
