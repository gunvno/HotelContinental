"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CreditCard, ReceiptText, Settings, UserRound } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Container } from "@/components/ui/container";
import { getMyPayments, type PaymentHistoryResponse } from "@/services/billing-service";
import { useAuthStore } from "@/store/auth-store";

export default function InvoicesPage() {
  const token = useAuthStore((state) => state.token);
  const [payments, setPayments] = useState<PaymentHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currency = new Intl.NumberFormat("vi-VN");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getMyPayments()
      .then((data) => {
        if (!isMounted) return;
        setPayments(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Không thể tải lịch sử hóa đơn.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <ProtectedRoute>
    <section className="min-h-screen bg-white">
      <Container className="py-12 md:py-20 lg:py-24">
        <div className="flex flex-col items-start gap-16 md:flex-row">
          <aside className="flex w-full shrink-0 flex-col gap-8 md:sticky md:top-32 md:w-[240px] lg:w-[280px]">
            <div>
              <h2 className="font-serif text-[28px] font-bold text-[#1f1a17]">Cài đặt tài khoản</h2>
              <p className="mt-2 text-sm text-[#8c8277]">Quản lý thông tin và lịch sử thanh toán</p>
            </div>

            <nav className="flex flex-col gap-5 text-[15px]">
              <Link href="/account" className="flex items-center gap-4 text-[#8c8277] transition-colors hover:text-[#1f1a17]">
                <UserRound className="h-[18px] w-[18px]" />
                Hồ sơ cá nhân
              </Link>
              <Link href="/account/invoices" className="flex items-center gap-4 font-semibold text-[#00b0a6] transition-colors">
                <ReceiptText className="h-[18px] w-[18px]" />
                Lịch sử hóa đơn
              </Link>
              <Link href="/payment" className="flex items-center gap-4 text-[#8c8277] transition-colors hover:text-[#1f1a17]">
                <CreditCard className="h-[18px] w-[18px]" />
                Thanh toán
              </Link>
              <button type="button" className="flex items-center gap-4 text-[#8c8277] transition-colors hover:text-[#1f1a17]">
                <Settings className="h-[18px] w-[18px]" />
                Cài đặt chung
              </button>
            </nav>
          </aside>

          <div className="w-full flex-1 space-y-8">
            <div className="mb-4 border-b border-[#f0ece5] pb-6 pt-8">
              <h1 className="font-serif text-[42px] font-bold text-[#1f1a17]">Lịch sử hóa đơn</h1>
              <p className="mt-3 text-[14px] leading-relaxed text-[#8c8277]">
                Danh sách thanh toán được lấy từ bảng payment_history.
              </p>
            </div>

            <div className="rounded-3xl border border-[#f0ece5] bg-white p-6 shadow-sm md:p-8">
              {error ? (
                <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
              ) : isLoading ? (
                <p className="py-10 text-center text-sm text-[#8c8277]">Đang tải hóa đơn...</p>
              ) : payments.length === 0 ? (
                <p className="py-10 text-center text-sm text-[#8c8277]">Bạn chưa có hóa đơn nào.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#f0ece5]">
                        <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-[#8c8277]">Mã thanh toán</th>
                        <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-[#8c8277]">Mã booking</th>
                        <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-[#8c8277]">Ngày thanh toán</th>
                        <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-[#8c8277]">Tổng tiền</th>
                        <th className="pb-4 text-right text-[10px] font-bold uppercase tracking-widest text-[#8c8277]">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="text-[14px] font-medium text-[#1f1a17]">
                      {payments.map((payment, index) => (
                        <tr key={payment.id} className={index !== payments.length - 1 ? "border-b border-[#f0ece5]/60" : ""}>
                          <td className="py-6">{payment.id}</td>
                          <td className="py-6 text-[#8c8277]">{payment.roomBookingId}</td>
                          <td className="py-6 text-[#8c8277]">{payment.paymentTime}</td>
                          <td className="py-6 font-bold text-[#b97a38]">{currency.format(payment.amount)}đ</td>
                          <td className="py-6 text-right">
                            <Link
                              href={`/payment/invoice?bookingId=${encodeURIComponent(payment.roomBookingId)}&paymentId=${encodeURIComponent(payment.id)}&total=${payment.amount}`}
                              className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-[#b97a38] transition-colors hover:text-[#8a5724]"
                            >
                              Xem chi tiết <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
    </ProtectedRoute>
  );
}
