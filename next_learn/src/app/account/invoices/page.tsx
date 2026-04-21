"use client";

import {
  ArrowRight,
  Award,
  CreditCard,
  ReceiptText,
  Settings,
  ShieldCheck,
  UserRound} from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { useKeycloakAuth } from "@/providers/keycloak-auth-provider";
import { useAuthStore } from "@/store/auth-store";

export default function InvoicesPage() {
  const { logout } = useKeycloakAuth();
  const logoutLocal = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logoutLocal();
    logout();
  };

  const invoices = [
    { id: "#CG-2024-8891", date: "15 Th05, 2024", total: "12.500.000 đ", status: "Đã thanh toán", statusColor: "success" },
    { id: "#CG-2024-8742", date: "02 Th05, 2024", total: "8.200.000 đ", status: "Đã thanh toán", statusColor: "success" },
    { id: "#CG-2024-9102", date: "20 Th05, 2024", total: "24.000.000 đ", status: "Chờ xử lý", statusColor: "pending" },
    { id: "#CG-2024-8550", date: "28 Th04, 2024", total: "5.500.000 đ", status: "Đã thanh toán", statusColor: "success" },
  ];

  return (
    <section className="min-h-screen bg-white">
      <Container className="py-12 md:py-20 lg:py-24">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          {/* Left Sidebar */}
          <aside className="w-full md:w-[240px] lg:w-[280px] shrink-0 md:sticky md:top-32 flex flex-col gap-8 md:gap-10">
            <div>
              <h2 className="font-serif text-[28px] font-bold text-[#1f1a17]">Cài đặt tài khoản</h2>
              <p className="mt-2 text-sm text-[#8c8277]">Quản lý thông tin và bảo mật</p>
            </div>

            <nav className="flex flex-col gap-5 text-[15px]">
              <Link href="/account" className="flex items-center gap-4 text-[#8c8277] transition-colors hover:text-[#1f1a17]">
                <UserRound className="h-[18px] w-[18px]" />
                Hồ sơ cá nhân
              </Link>
              <Link href="/account/invoices" className="flex items-center gap-4 text-[#00b0a6] font-semibold transition-colors">
                <ReceiptText className="h-[18px] w-[18px]" />
                Lịch sử hóa đơn
              </Link>
              <Link href="/account/payments" className="flex items-center gap-4 text-[#8c8277] transition-colors hover:text-[#1f1a17]">
                <CreditCard className="h-[18px] w-[18px]" />
                Thanh toán
              </Link>
              <button type="button" className="flex items-center gap-4 text-[#8c8277] transition-colors hover:text-[#1f1a17]">
                <Settings className="h-[18px] w-[18px]" />
                Cài đặt chung
              </button>
            </nav>

            <div className="pt-4 border-t border-[#f0ece5]">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#d6af7a]">TRẠNG THÁI HỘI VIÊN</p>
              <p className="mt-2 font-serif text-[22px] font-bold text-[#1f1a17]">Hạng Gold Member</p>
              <p className="mt-3 text-[13px] leading-relaxed text-[#8c8277]">Tận hưởng ưu đãi độc quyền tại mọi sảnh chờ của Continental.</p>
            </div>
          </aside>

          <div className="flex-1 w-full space-y-8">
            <div className="pt-8 mb-4 border-b border-[#f0ece5] pb-6">
              <h1 className="font-serif text-[42px] font-bold text-[#1f1a17]">Lịch sử hóa đơn</h1>
              <p className="mt-3 text-[14px] leading-relaxed text-[#8c8277]">
                Xem lại tất cả các giao dịch và chi tiết đặt phòng của bạn tại Continental Grand.
              </p>
            </div>
            
            {/* Table Invoices */}
            <div className="rounded-3xl bg-white p-6 md:p-8 shadow-sm border border-[#f0ece5]">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#f0ece5]">
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-[#8c8277]">MÃ HÓA ĐƠN</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-[#8c8277]">NGÀY THANH TOÁN</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-[#8c8277]">TỔNG TIỀN</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-[#8c8277]">TRẠNG THÁI</th>
                      <th className="pb-4 text-right text-[10px] font-bold uppercase tracking-widest text-[#8c8277]">THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px] font-medium text-[#1f1a17]">
                    {invoices.map((inv, idx) => (
                      <tr key={inv.id} className={idx !== invoices.length - 1 ? "border-b border-[#f0ece5]/60" : ""}>
                        <td className="py-6">{inv.id}</td>
                        <td className="py-6 text-[#8c8277]">{inv.date}</td>
                        <td className="py-6 font-bold text-[#b97a38]">{inv.total}</td>
                        <td className="py-6">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                            inv.statusColor === "success" 
                              ? "bg-[#e8f7f5] text-[#00897b]" 
                              : "bg-[#fff3e0] text-[#e65100]"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${inv.statusColor === "success" ? "bg-[#00897b]" : "bg-[#e65100]"}`}></span>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-6 text-right">
                          <button className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-[#b97a38] transition-colors hover:text-[#8a5724]">
                            Xem chi tiết <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Cards */}
            <div className="grid gap-6 md:grid-cols-[1.5fr,1fr]">
              {/* Grand Elite Card */}
              <div className="relative overflow-hidden rounded-3xl bg-[#0b6356] p-8 text-white shadow-md">
                <div className="relative z-10 space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a4d4cd]">THÀNH VIÊN THÂN THIẾT</p>
                  <div>
                    <h3 className="font-serif text-[28px] font-bold">Đặc quyền Grand Elite</h3>
                    <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-[#cde7e4]">
                      Tận hưởng ưu đãi 15% cho lần lưu trú tiếp theo và miễn phí dịch vụ Spa.
                    </p>
                  </div>
                  <button className="mt-2 rounded-full bg-white px-6 py-2.5 text-[13px] font-bold text-[#0b6356] transition-transform hover:-translate-y-0.5 shadow-sm">
                    Khám phá ngay
                  </button>
                </div>
                <Award className="absolute -bottom-8 -right-8 h-48 w-48 text-[#0f7d6e] opacity-50" />
              </div>

              {/* Total Spending Card */}
              <div className="rounded-3xl bg-[#efebe4] p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8c8277]">TỔNG CHI TIÊU THÁNG 5</p>
                  <p className="mt-3 font-serif text-[32px] font-bold text-[#1f1a17]">
                    44.700.000 <span className="text-xl underline decoration-2 underline-offset-4">đ</span>
                  </p>
                </div>
                
                <div className="mt-8 space-y-3 border-t border-[#dfd8cc] pt-5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-[#8c8277]">Số đêm nghỉ</span>
                    <span className="font-bold text-[#1f1a17]">12 đêm</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#dfd8cc]">
                    <div className="h-full w-[80%] bg-[#b97a38] rounded-full"></div>
                  </div>
                  <p className="text-[11px] text-[#8c8277]">Còn 3 đêm để lên hạng Kim Cương</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </Container>
    </section>
  );
}