"use client";

import {
  Wifi,
  Coffee,
  Bath,
  BedDouble,
  Shield,
  ChefHat,
  Eye,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const amenityItems = [
  {
    icon: Wifi,
    title: "Wi-Fi tốc độ cao",
    desc: "Kết nối internet tốc độ cao miễn phí tại mọi khu vực trong khách sạn.",
  },
  {
    icon: Coffee,
    title: "Minibar cao cấp",
    desc: "Thưởng thức đồ uống và snack chọn lọc ngay trong phòng nghỉ của bạn.",
  },
  {
    icon: Bath,
    title: "Phòng tắm Marble",
    desc: "Phòng tắm riêng lát đá cẩm thạch với bồn tắm và vòi sen mưa.",
  },
  {
    icon: BedDouble,
    title: "Giường King-size",
    desc: "Nệm cao cấp với bộ khăn trải giường lụa Ai Cập 600 sợi.",
  },
  {
    icon: Shield,
    title: "An ninh 24/7",
    desc: "Hệ thống an ninh hiện đại và đội ngũ bảo vệ chuyên nghiệp.",
  },
  {
    icon: ChefHat,
    title: "Đầu bếp riêng",
    desc: "Dịch vụ đầu bếp riêng phục vụ tại phòng theo yêu cầu.",
  },
  {
    icon: Eye,
    title: "Tầm nhìn Panorama",
    desc: "View toàn cảnh thành phố từ các tầng cao với cửa kính lớn.",
  },
  {
    icon: Sparkles,
    title: "Dọn phòng hàng ngày",
    desc: "Dịch vụ dọn phòng hai lần mỗi ngày và turndown buổi tối.",
  },
];

export default function AmenitiesPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ─── Hero Header ─── */}
      <section className="pt-20">
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-12 pb-16 md:pt-16 md:pb-20">
          {/* Decorative label */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-ring">
              Phòng & Suite
            </span>
            <span className="h-px flex-1 max-w-[120px] bg-ring/40" />
          </div>

          <div className="max-w-3xl">
            <h1 className="font-serif text-[44px] sm:text-[56px] md:text-[68px] lg:text-[76px] font-bold leading-[1.05] text-foreground">
              Nâng tầm kỳ nghỉ
              <br />
              <span className="text-ring">của bạn</span>
            </h1>
            <p className="mt-8 text-[15px] md:text-[16px] leading-relaxed text-muted-foreground max-w-xl">
              Từ những buổi trị liệu Spa thư giãn đến tinh hoa ẩm thực đẳng
              cấp, hãy để chúng tôi biến chuyến đi của bạn thành một hành trình
              đáng nhớ.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Bento Grid ─── */}
      <section>
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 mb-24">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 h-auto lg:h-[820px]">
            {/* Card 1 — Spa & Wellness (large, col-span-2) */}
            <div className="group relative overflow-hidden rounded-2xl md:col-span-2 min-h-[340px] lg:min-h-0">
              <img
                src="https://images.unsplash.com/photo-1544161515-4ab2ce6cd8e1?q=80&w=1200&auto=format&fit=crop"
                alt="Spa & Wellness"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

              {/* Content */}
              <div className="relative flex h-full items-end p-8 md:p-10">
                <div className="flex w-full flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-md text-white">
                    <span className="mb-4 inline-block rounded-full bg-emerald-400/20 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300 backdrop-blur-sm border border-emerald-400/20">
                      Spa & Wellness
                    </span>
                    <h3 className="font-serif text-[30px] md:text-[36px] font-bold leading-tight mb-3">
                      Thánh đường Wellness Spa
                    </h3>
                    <p className="text-[13px] leading-relaxed text-white/80 max-w-sm">
                      Liệu pháp massage đá nóng và thảo mộc truyền thống, giúp
                      phục hồi năng lượng và cân bằng tâm trí.
                    </p>
                  </div>

                  {/* Price badge */}
                  <div className="shrink-0 rounded-2xl bg-black/40 backdrop-blur-xl p-5 border border-white/10 md:w-[185px] text-left md:text-center">
                    <p className="text-[10px] uppercase font-bold text-amber-400 tracking-[0.2em]">
                      Từ
                    </p>
                    <p className="mt-1 font-serif text-[24px] font-bold text-white leading-none">
                      1.800.000
                      <span className="text-lg underline underline-offset-4 decoration-1">
                        đ
                      </span>
                    </p>
                    <button className="mt-4 w-full cursor-pointer rounded-full bg-ring py-2.5 text-[12px] font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0">
                      Thêm vào kỳ nghỉ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 — Fine Dining (tall, row-span-2) */}
            <div className="relative overflow-hidden rounded-2xl bg-muted flex flex-col md:row-span-2 h-[520px] lg:h-full border border-border shadow-sm">
              {/* Image */}
              <div className="h-56 lg:h-[340px] shrink-0 w-full relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1544025162-88229b4ddb36?q=80&w=600&auto=format&fit=crop"
                  alt="Fine Dining"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              {/* Text */}
              <div className="flex flex-1 flex-col justify-between p-7 lg:p-8">
                <div>
                  <span className="mb-3 inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-ring">
                    Ẩm thực
                  </span>
                  <h3 className="font-serif text-[26px] lg:text-[28px] font-bold text-foreground leading-snug">
                    Ẩm thực Fine‑dining
                  </h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                    Thưởng thức thực đơn nếm thử (tasting menu) được chế biến
                    bởi các đầu bếp danh tiếng thế giới.
                  </p>
                </div>

                <div className="flex items-end justify-between mt-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                      Mỗi khách
                    </p>
                    <p className="mt-1 font-serif text-[24px] font-bold text-ring leading-none">
                      2.500.000
                      <span className="text-lg underline underline-offset-4 decoration-1">
                        đ
                      </span>
                    </p>
                  </div>
                  <button className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-ring text-white shadow-md transition-all hover:scale-110 hover:shadow-lg active:scale-100">
                    <span className="text-xl font-light leading-none">+</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3 — Hồ bơi vô cực (horizontal) */}
            <div className="overflow-hidden rounded-2xl bg-background border border-border shadow-sm flex flex-col sm:flex-row h-auto sm:h-[280px] lg:h-auto">
              {/* Image left */}
              <div className="w-full sm:w-[45%] h-52 sm:h-full relative shrink-0 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop"
                  alt="Hồ bơi vô cực"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              {/* Text right */}
              <div className="flex flex-col justify-center p-7 sm:w-[55%]">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 mb-2 flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-current text-[9px]">
                    ≈
                  </span>
                  Hồ bơi vô cực
                </p>
                <h3 className="font-serif text-[24px] lg:text-[26px] font-bold text-foreground mb-2 leading-snug">
                  Thư giãn bên hồ
                </h3>
                <p className="text-[12px] leading-relaxed text-muted-foreground mb-5">
                  Tận hưởng tầm nhìn panorama toàn thành phố và những ly
                  cocktail đặc sắc tại quầy bar tầng thượng.
                </p>
                <p className="font-serif text-[20px] font-bold text-ring">
                  650.000
                  <span className="text-[14px]">đ</span>{" "}
                  <span className="text-[11px] font-normal font-sans text-muted-foreground">
                    / ngày
                  </span>
                </p>
                <button className="mt-4 w-full cursor-pointer rounded-full border border-ring bg-transparent py-2.5 text-[12px] font-bold text-ring transition-colors hover:bg-ring/10">
                  Đặt chỗ ngay
                </button>
              </div>
            </div>

            {/* Card 4 — Đưa đón sân bay (horizontal reversed) */}
            <div className="overflow-hidden rounded-2xl bg-muted border border-border shadow-sm flex flex-col-reverse sm:flex-row h-auto sm:h-[280px] lg:h-auto">
              {/* Text left */}
              <div className="flex flex-col justify-center p-7 sm:w-[55%]">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                  <span className="text-sm">🚕</span>
                  Đưa đón
                </p>
                <h3 className="font-serif text-[24px] lg:text-[26px] font-bold text-foreground mb-2 leading-snug">
                  Đưa đón sân bay
                </h3>
                <p className="text-[12px] leading-relaxed text-muted-foreground mb-5">
                  Dịch vụ xe Limousine sang trọng với tài xế riêng, đảm bảo sự
                  riêng tư và thoải mái tuyệt đối cho quý khách.
                </p>
                <p className="font-serif text-[20px] font-bold text-ring">
                  1.200.000
                  <span className="text-[14px]">đ</span>{" "}
                  <span className="text-[11px] font-normal font-sans text-muted-foreground">
                    / lượt
                  </span>
                </p>
                <button className="mt-4 w-full cursor-pointer rounded-full border border-ring bg-transparent py-2.5 text-[12px] font-bold text-ring transition-colors hover:bg-ring/10">
                  Thêm dịch vụ
                </button>
              </div>
              {/* Image right */}
              <div className="w-full sm:w-[45%] h-52 sm:h-full relative shrink-0 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=400&auto=format&fit=crop"
                  alt="Đưa đón sân bay"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Amenities Grid ─── */}
      <section>
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 mb-24">
          {/* Section heading */}
          <div className="flex items-center gap-4 mb-4">
            <span className="h-px w-10 bg-ring/40" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-ring">
              Tiện nghi
            </span>
            <span className="h-px w-10 bg-ring/40" />
          </div>
          <h2 className="font-serif text-[32px] md:text-[40px] font-bold text-foreground text-center mb-4">
            Mọi thứ bạn cần
          </h2>
          <p className="text-center text-[14px] md:text-[15px] text-muted-foreground max-w-lg mx-auto mb-14">
            Mỗi chi tiết đều được chăm chút tỉ mỉ để mang đến cho bạn trải
            nghiệm lưu trú hoàn hảo nhất.
          </p>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {amenityItems.map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-border bg-background p-7 transition-all duration-300 hover:border-ring/30 hover:shadow-lg hover:shadow-ring/5 hover:-translate-y-1"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-ring/10 text-ring transition-colors group-hover:bg-ring/20">
                  <item.icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h3 className="font-serif text-[18px] font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section>
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-ring/90 to-ring px-8 py-14 md:px-16 md:py-20 text-center">
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10">
              <h2 className="font-serif text-[28px] md:text-[36px] lg:text-[42px] font-bold text-white leading-tight mb-4">
                Sẵn sàng cho kỳ nghỉ
                <br className="hidden sm:block" /> hoàn hảo?
              </h2>
              <p className="text-[14px] md:text-[15px] text-white/85 max-w-md mx-auto mb-8 leading-relaxed">
                Liên hệ với chúng tôi để được tư vấn và đặt phòng với những ưu
                đãi tốt nhất.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[13px] font-bold text-ring shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0">
                  Đặt phòng ngay
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button className="cursor-pointer rounded-full border-2 border-white/40 bg-transparent px-8 py-3.5 text-[13px] font-bold text-white transition-colors hover:border-white hover:bg-white/10">
                  Liên hệ tư vấn
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}