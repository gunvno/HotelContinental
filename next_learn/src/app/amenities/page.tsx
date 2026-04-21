"use client";

import { Container } from "@/components/ui/container";
import { Link } from "lucide-react";
import Image from "next/image";

const amenities = [
  {
    category: "SPA & WELLNESS",
    title: "Thánh đường Wellness Spa",
    desc: "Liệu pháp massage đá nóng và thảo mộc truyền thống, giúp phục hồi năng lượng và cân bằng tâm trí.",
    price: "1.800.000đ",
    pricePrefix: "TỪ",
    buttonText: "Thêm vào kỳ nghỉ",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
    colSpan: "col-span-1 border-none",
    rowSpan: "row-span-1",
  },
];

export default function AmenitiesPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24">
      {/* Header section */}
      <section className="pt-24 pb-16">
        <Container className="relative">
          <div className="max-w-2xl">
            <nav className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d6af7a]">
              <span>TRANG CHỦ</span>
              <span>›</span>
              <span>TRẢI NGHIỆM</span>
              <span>›</span>
              <span className="text-[#8c8277]">DỊCH VỤ CAO CẤP</span>
            </nav>

            <h1 className="font-serif text-[48px] font-bold leading-[1.1] text-[#1f1a17] sm:text-[56px] md:text-[64px]">
              Nâng tầm kỳ nghỉ của bạn
            </h1>
            <p className="mt-8 text-[15px] leading-relaxed text-[#6c6054] md:max-w-xl">
              Từ những buổi trị liệu Spa thư giãn đến tinh hoa ẩm thực đẳng cấp, hãy để chúng tôi biến chuyến đi của bạn thành một hành trình đáng nhớ.
            </p>
          </div>
        </Container>
      </section>

      {/* Grid section */}
      <section>
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 h-auto lg:h-[800px] mb-20">
            
            {/* Card 1: Vùng Grid lớn nhất - Spa */}
            <div className="group relative overflow-hidden rounded-3xl md:col-span-2 shadow-sm bg-black">
              <img 
                src="https://images.unsplash.com/photo-1544161515-4ab2ce6cd8e1?q=80&w=1200&auto=format&fit=crop" 
                alt="Spa" 
                className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-8 md:p-10">
                <div className="flex w-full flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="max-w-md text-white">
                    <span className="inline-block rounded-full bg-[#8ce0d7] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#006e62] mb-4">
                      SPA & WELLNESS
                    </span>
                    <h3 className="font-serif text-[32px] md:text-[38px] font-bold leading-tight mb-3">
                      Thánh đường Wellness Spa
                    </h3>
                    <p className="text-[14px] text-white/90 leading-relaxed max-w-sm">
                      Liệu pháp massage đá nóng và thảo mộc truyền thống, giúp phục hồi năng lượng và cân bằng tâm trí.
                    </p>
                  </div>
                  
                  <div className="shrink-0 rounded-2xl bg-[#36271c]/60 backdrop-blur-md p-5 border border-white/10 md:w-[180px] text-left md:text-center">
                    <p className="text-[10px] uppercase font-bold text-[#d6af7a] tracking-widest">TỪ</p>
                    <p className="mt-1 font-serif text-[24px] font-bold text-white leading-none">1.800.000<span className="text-xl underline underline-offset-4 decoration-1">đ</span></p>
                    <button className="mt-4 w-full rounded-full bg-[#eca853] py-2.5 text-[12px] font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5">
                      Thêm vào kỳ nghỉ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Ẩm thực */}
            <div className="relative overflow-hidden rounded-3xl bg-[#f2ece4] flex flex-col md:row-span-2 h-full shadow-sm">
              <div className="h-64 shrink-0 lg:h-[360px] w-full relative overflow-hidden">
                 <img 
                  src="https://images.unsplash.com/photo-1544025162-88229b4ddb36?q=80&w=600&auto=format&fit=crop" 
                  alt="Fine-dining" 
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-8">
                <div>
                  <h3 className="font-serif text-[28px] font-bold text-[#1f1a17]">Ẩm thực Fine-dining</h3>
                  <p className="mt-4 text-[13px] leading-relaxed text-[#6c6054]">
                    Thưởng thức thực đơn nếm thử (tasting menu) được chế biến bởi các đầu bếp danh tiếng thế giới.
                  </p>
                </div>
                
                <div className="flex items-end justify-between mt-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c8277]">MỖI KHÁCH</p>
                    <p className="mt-1 font-serif text-[24px] font-bold text-[#9e7039]">2.500.000<span className="text-xl underline underline-offset-4 decoration-1">đ</span></p>
                  </div>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8b5e34] text-white shadow-md transition-transform hover:scale-105">
                    <span className="text-xl font-light mb-[2px]">+</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Hồ bơi vô cực */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm flex flex-col sm:flex-row h-[280px]">
              <div className="w-full sm:w-[45%] h-full relative">
                 <img 
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop" 
                  alt="Hồ bơi" 
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-8 sm:w-[55%]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#00897b] mb-3 flex items-center gap-2">
                  <span className="h-4 w-4 shrink-0 inline-flex border border-current items-center justify-center rounded-sm">≈</span> HỒ BƠI VÔ CỰC
                </p>
                <h3 className="font-serif text-[26px] font-bold text-[#1f1a17] mb-3">Thư giãn bên hồ</h3>
                <p className="text-[12px] leading-relaxed text-[#6c6054] mb-6">
                  Tận hưởng tầm nhìn panorama toàn thành phố và những ly cocktail đặc sắc tại quầy bar tầng thượng.
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-serif text-[20px] font-bold text-[#b98446]">650.000<span className="text-[14px]">đ</span> <span className="text-[11px] font-normal font-sans text-[#8c8277]">/ ngày</span></p>
                </div>
                <button className="mt-4 w-full rounded-full border border-[#d6af7a] bg-transparent py-2 text-[12px] font-bold text-[#b98446] transition-colors hover:bg-[#faf8f5]">
                  Đặt chỗ ngay
                </button>
              </div>
            </div>

            {/* Card 4: Đưa đón */}
            <div className="overflow-hidden rounded-3xl bg-[#faf8f5] border border-[#f0ece5] shadow-sm flex flex-col sm:flex-row h-[280px]">
              <div className="flex flex-col justify-center p-8 sm:w-[55%] border-r border-[#f0ece5]/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#2e7d32] mb-3 flex items-center gap-2">
                  <span className="mr-1">🚕</span> ĐƯA ĐÓN
                </p>
                <h3 className="font-serif text-[26px] font-bold text-[#1f1a17] mb-3">Đưa đón sân bay</h3>
                <p className="text-[12px] leading-relaxed text-[#6c6054] mb-6">
                  Dịch vụ xe Limousine sang trọng với tài xế riêng, đảm bảo sự riêng tư và thoải mái tuyệt đối cho quý khách.
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-serif text-[20px] font-bold text-[#b98446]">1.200.000<span className="text-[14px]">đ</span> <span className="text-[11px] font-normal font-sans text-[#8c8277]">/ lượt</span></p>
                </div>
                <button className="mt-4 w-full rounded-full border border-[#d6af7a] bg-transparent py-2 text-[12px] font-bold text-[#b98446] transition-colors hover:bg-white">
                  Thêm dịch vụ
                </button>
              </div>
              <div className="w-full sm:w-[45%] h-full relative bg-gray-100">
                 <img 
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=400&auto=format&fit=crop" 
                  alt="Limousine" 
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>

          </div>
        </Container>
      </section>
    </div>
  );
}