"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

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
  const pages = Array.from({ length: totalPages }, (_, index) => index).filter(
    (index) => index === 0 || index === totalPages - 1 || Math.abs(index - page) <= 1,
  );

  if (totalPages <= 1) {
    return (
      <div
        className={`border-t border-[#eadfcd] px-6 py-4 text-sm font-semibold text-[#75695d] ${className}`}
      >
        Tổng {total} {itemLabel}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-3 border-t border-[#eadfcd] px-6 py-4 text-sm md:flex-row md:items-center md:justify-between ${className}`}
    >
      <p className="font-semibold text-[#75695d]">
        Tổng {total} {itemLabel} · Trang {page + 1} / {totalPages}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Trước
        </Button>
        {pages.map((pageIndex, index) => {
          const previousPage = pages[index - 1];
          const needsGap = previousPage !== undefined && pageIndex - previousPage > 1;

          return (
            <span key={pageIndex} className="flex items-center gap-2">
              {needsGap ? (
                <span className="px-1 font-black text-[#9b8c7d]">...</span>
              ) : null}
              <button
                type="button"
                onClick={() => onPageChange(pageIndex)}
                className={`grid size-10 place-items-center rounded-full border text-sm font-black transition ${
                  pageIndex === page
                    ? "border-[#9b5c24] bg-[#9b5c24] text-white"
                    : "border-[#decdb9] bg-white text-[#4d4035] hover:bg-[#fff6e8]"
                }`}
              >
                {pageIndex + 1}
              </button>
            </span>
          );
        })}
        <Button
          type="button"
          variant="secondary"
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
        >
          Sau
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
