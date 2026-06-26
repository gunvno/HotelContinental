"use client";

import {
  BadgeDollarSign,
  CalendarDays,
  ChartColumnIncreasing,
  Loader2,
  ReceiptText,
  RefreshCcw,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PermissionDenied } from "@/components/auth/permission-gate";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { MetricCard } from "@/components/ui/metric-card";
import { ToastBridge } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import { formatMoney } from "@/lib/format";
import {
  getRevenueSummary,
  type RevenueSummaryResponse,
} from "@/services/report-service";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCompactMoney(value?: number) {
  const amount = Number(value ?? 0);
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  return formatMoney(amount);
}

export default function RevenuePage() {
  const permission = usePermission();
  const canViewRevenue = permission.has("REVENUE_VIEW");
  const today = useMemo(() => new Date(), []);
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date(today);
    date.setDate(date.getDate() - 6);
    return toDateInputValue(date);
  });
  const [toDate, setToDate] = useState(() => toDateInputValue(today));
  const [summary, setSummary] = useState<RevenueSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadRevenue() {
    if (!canViewRevenue) return;
    setLoading(true);
    setMessage(null);
    try {
      setSummary(await getRevenueSummary(fromDate, toDate));
    } catch {
      setMessage(
        "Không thể tải dữ liệu doanh thu. Kiểm tra report-service, billing-service, booking-service và quyền REVENUE_VIEW.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRevenue();
  }, [canViewRevenue]);

  const maxDailyAmount = Math.max(
    1,
    ...(summary?.dailyRevenue ?? []).map((item) => item.amount),
  );

  if (!canViewRevenue) {
    return (
      <PermissionDenied message="Bạn không có quyền REVENUE_VIEW để xem báo cáo doanh thu." />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#decdb9] bg-white/85 p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-bold tracking-[0.22em] text-[#9b5c24] uppercase">
              Báo cáo quản trị
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17213a]">
              Doanh thu
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-[#7c6f63]">
              Tổng hợp tiền đã thu từ payment history, đối chiếu với booking để tách tiền
              phòng, dịch vụ phát sinh và phụ phí.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <DatePicker label="Từ ngày" value={fromDate} onChange={setFromDate} />
            <DatePicker label="Đến ngày" value={toDate} onChange={setToDate} />
            <Button
              type="button"
              onClick={() => void loadRevenue()}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Tải báo cáo
            </Button>
          </div>
        </div>
      </section>

      {message ? (
        <ToastBridge success={message} onClearSuccess={() => setMessage(null)} />
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Đã thu trong kỳ"
          value={formatCompactMoney(summary?.totalCollected)}
          detail={`${summary?.paymentCount ?? 0} giao dịch`}
          icon={<BadgeDollarSign className="h-5 w-5" />}
        />
        <MetricCard
          title="Doanh thu hôm nay"
          value={formatCompactMoney(summary?.todayCollected)}
          detail="Theo ngày thanh toán"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <MetricCard
          title="Booking đã thu tiền"
          value={`${summary?.paidBookingCount ?? 0}`}
          detail={`${summary?.bookingCount ?? 0} booking trong hệ thống`}
          icon={<ReceiptText className="h-5 w-5" />}
        />
        <MetricCard
          title="Booking chờ thu"
          value={formatCompactMoney(summary?.pendingBookingValue)}
          detail="Giá trị booking đang pending"
          icon={<WalletCards className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#17213a]">Doanh thu theo ngày</h3>
              <p className="text-sm text-[#7c6f63]">
                Khoảng {summary?.fromDate ?? fromDate} đến {summary?.toDate ?? toDate}
              </p>
            </div>
            <ChartColumnIncreasing className="h-6 w-6 text-[#9b5c24]" />
          </div>

          <div className="mt-8 flex h-72 items-end gap-3 rounded-2xl border border-[#ead8c4] bg-[#fbf8f2] p-5">
            {(summary?.dailyRevenue ?? []).map((item) => {
              const height = Math.max(8, (item.amount / maxDailyAmount) * 100);
              return (
                <div key={item.date} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-[#9b5c24] to-[#f2c478]"
                    style={{ height: `${height}%` }}
                    title={`${item.date}: ${formatMoney(item.amount)}`}
                  />
                  <span className="text-xs font-bold text-[#75695d]">
                    {item.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[#decdb9] bg-white/90 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#17213a]">Cơ cấu doanh thu</h3>
          <p className="mt-1 text-sm text-[#7c6f63]">
            Tách theo tổng booking đã phát sinh payment.
          </p>

          <div className="mt-6 space-y-4">
            {(summary?.breakdown ?? []).map((item) => {
              const percent =
                summary && summary.totalCollected > 0
                  ? Math.min(100, (item.amount / summary.totalCollected) * 100)
                  : 0;
              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-semibold text-[#17213a]">{item.label}</span>
                    <span className="font-bold text-[#9b5c24]">
                      {formatMoney(item.amount)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#efe3d5]">
                    <div
                      className="h-full rounded-full bg-[#9b5c24]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl bg-[#fbf8f2] p-4 text-sm text-[#6f5f50]">
            <p>
              Đang lưu trú: <b>{summary?.checkedInBookingCount ?? 0}</b>
            </p>
            <p>
              Đã checkout: <b>{summary?.checkedOutBookingCount ?? 0}</b>
            </p>
            <p>
              Tiền dịch vụ phát sinh: <b>{formatMoney(summary?.serviceRevenue)}</b>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


