"use client";

import { ArrowRight, ReceiptText, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Container } from "@/components/ui/container";
import {
  getMyPaymentRequests,
  type PaymentRequestResponse,
  type PaymentRequestStatus,
} from "@/services/billing-service";
import { useAuthStore } from "@/store/auth-store";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

export default function InvoicesPage() {
  const token = useAuthStore((state) => state.token);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getMyPaymentRequests()
      .then((data) => {
        if (isMounted) setPaymentRequests(data);
      })
      .catch(() => {
        if (isMounted) setError("Không thể tải lịch sử hóa đơn.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <ProtectedRoute>
      <section className="min-h-screen bg-white">
        <Container className="py-8 sm:py-12 md:py-20 lg:py-24">
          <div className="flex flex-col items-start gap-8 md:flex-row md:gap-12 lg:gap-16">
            <AccountSidebar />

            <div className="w-full flex-1 space-y-8">
              <div className="mb-4 border-b border-[#f0ece5] pt-2 pb-6 md:pt-8">
                <h1 className="font-serif text-3xl font-bold text-[#1f1a17] sm:text-4xl md:text-[42px]">
                  Lịch sử hóa đơn
                </h1>
                <p className="mt-3 text-[14px] leading-relaxed text-[#8c8277]">
                  Theo dõi các yêu cầu thanh toán, hóa đơn đã thanh toán và các hóa đơn còn chờ xử lý.
                </p>
              </div>

              <div className="rounded-3xl border border-[#f0ece5] bg-white p-4 shadow-sm sm:p-6 md:p-8">
                {error ? (
                  <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
                ) : isLoading ? (
                  <p className="py-10 text-center text-sm text-[#8c8277]">
                    Đang tải hóa đơn...
                  </p>
                ) : paymentRequests.length === 0 ? (
                  <p className="py-10 text-center text-sm text-[#8c8277]">
                    Bạn chưa có hóa đơn nào.
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 md:hidden">
                      {paymentRequests.map((request) => (
                        <PaymentRequestCard key={request.id} request={request} />
                      ))}
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[860px] text-left">
                      <thead>
                        <tr className="border-b border-[#f0ece5]">
                          <TableHead>Mã thanh toán</TableHead>
                          <TableHead>Mã booking</TableHead>
                          <TableHead>Ngày tạo</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Tổng tiền</TableHead>
                          <TableHead alignRight>Thao tác</TableHead>
                        </tr>
                      </thead>
                      <tbody className="text-[14px] font-medium text-[#1f1a17]">
                        {paymentRequests.map((request, index) => (
                          <tr
                            key={request.id}
                            className={
                              index !== paymentRequests.length - 1
                                ? "border-b border-[#f0ece5]/60"
                                : ""
                            }
                          >
                            <td className="py-6">
                              <div className="font-semibold">{shortCode(request.id)}</div>
                              <div className="mt-1 text-xs text-[#9d8f82]">{request.id}</div>
                            </td>
                            <td className="py-6 text-[#8c8277]">
                              <div>{shortCode(request.roomBookingId)}</div>
                              <div className="mt-1 text-xs">{request.roomBookingId}</div>
                            </td>
                            <td className="py-6 text-[#8c8277]">
                              {formatDate(request.paidTime ?? request.createdTime)}
                            </td>
                            <td className="py-6">
                              <StatusBadge status={request.status} />
                            </td>
                            <td className="py-6 font-bold text-[#b97a38]">
                              {formatMoney(request.amount)}
                            </td>
                            <td className="py-6 text-right">
                              <InvoiceAction request={request} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </ProtectedRoute>
  );
}

function AccountSidebar() {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-5 md:sticky md:top-32 md:w-[240px] md:gap-8 lg:w-[280px]">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#1f1a17] md:text-[28px]">
          Cài đặt tài khoản
        </h2>
        <p className="mt-2 text-sm text-[#8c8277]">
          Quản lý thông tin và lịch sử thanh toán
        </p>
      </div>

      <nav className="grid grid-cols-1 gap-3 text-[15px] sm:grid-cols-3 md:flex md:flex-col md:gap-5">
        <AccountLink href="/account" icon={<UserRound className="h-[18px] w-[18px]" />}>
          Hồ sơ cá nhân
        </AccountLink>
        <AccountLink
          href="/account/invoices"
          active
          icon={<ReceiptText className="h-[18px] w-[18px]" />}
        >
          Lịch sử hóa đơn
        </AccountLink>
        <button
          type="button"
          className="flex items-center gap-4 text-[#8c8277] transition-colors hover:text-[#1f1a17]"
        >
          <Settings className="h-[18px] w-[18px]" />
          Cài đặt chung
        </button>
      </nav>
    </aside>
  );
}

function AccountLink({
  href,
  icon,
  active = false,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 transition-colors hover:text-[#1f1a17] ${
        active ? "font-semibold text-[#b87932]" : "text-[#8c8277]"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function TableHead({
  children,
  alignRight = false,
}: {
  children: React.ReactNode;
  alignRight?: boolean;
}) {
  return (
    <th
      className={`pb-4 text-[10px] font-bold tracking-widest text-[#8c8277] uppercase ${
        alignRight ? "text-right" : ""
      }`}
    >
      {children}
    </th>
  );
}

function StatusBadge({ status }: { status: PaymentRequestStatus }) {
  const config = {
    PENDING: {
      label: "Chờ thanh toán",
      className: "bg-amber-50 text-amber-700",
    },
    PAID: {
      label: "Đã thanh toán",
      className: "bg-emerald-50 text-emerald-700",
    },
    EXPIRED: {
      label: "Đã hết hạn",
      className: "bg-stone-100 text-stone-600",
    },
    FAILED: {
      label: "Thất bại",
      className: "bg-red-50 text-red-700",
    },
  }[status];

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}

function PaymentRequestCard({ request }: { request: PaymentRequestResponse }) {
  return (
    <article className="rounded-2xl border border-[#f0ece5] bg-[#fffaf5] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-widest text-[#8c8277] uppercase">
            Mã thanh toán
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-[#1f1a17]">
            {shortCode(request.id)}
          </p>
          <p className="mt-1 break-all text-xs text-[#9d8f82]">{request.id}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm">
        <InfoLine label="Mã booking" value={request.roomBookingId} />
        <InfoLine label="Ngày tạo" value={formatDate(request.paidTime ?? request.createdTime)} />
        <InfoLine label="Tổng tiền" value={formatMoney(request.amount)} strong />
      </div>

      <div className="mt-4 border-t border-[#f0ece5] pt-3 text-right">
        <InvoiceAction request={request} />
      </div>
    </article>
  );
}

function InfoLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[#8c8277]">{label}</span>
      <span
        className={`min-w-0 break-all text-right ${
          strong ? "font-bold text-[#b97a38]" : "font-medium text-[#1f1a17]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function InvoiceAction({ request }: { request: PaymentRequestResponse }) {
  if (request.status === "PENDING") {
    const params = new URLSearchParams({
      bookingId: request.roomBookingId,
      paymentRequestId: request.id,
      total: String(request.amount),
    });

    return (
      <Link
        href={`/payment/qr?${params.toString()}`}
        className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-wide text-[#b97a38] uppercase transition-colors hover:text-[#8a5724]"
      >
        Thanh toán <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    );
  }

  if (request.status === "PAID") {
    const params = new URLSearchParams({
      bookingId: request.roomBookingId,
      paymentId: request.providerTransactionId || request.id,
      total: String(request.amount),
    });

    return (
      <Link
        href={`/payment/invoice?${params.toString()}`}
        className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-wide text-[#b97a38] uppercase transition-colors hover:text-[#8a5724]"
      >
        Xem chi tiết <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    );
  }

  return <span className="text-xs font-semibold text-[#9d8f82]">Không khả dụng</span>;
}

function shortCode(value?: string) {
  return value ? value.slice(0, 8).toUpperCase() : "N/A";
}

function formatMoney(value?: number) {
  return `${currencyFormatter.format(Number(value ?? 0))}đ`;
}

function formatDate(value?: string) {
  if (!value) return "Chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}
