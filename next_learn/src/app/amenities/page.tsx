"use client";

import {
  ArrowRight,
  Bath,
  BedDouble,
  ChefHat,
  Coffee,
  Eye,
  Shield,
  Sparkles,
  Wifi,
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
    <div className="bg-background min-h-screen pb-24">
      {/* ─── Hero Header ─── */}
      <section className="pt-20">
        <div className="px-6 pt-12 pb-16 sm:px-8 md:pt-16 md:pb-20 lg:px-12 xl:px-16 2xl:px-20">
          {/* Decorative label */}
          <div className="mb-8 flex items-center gap-4">
            <span className="text-ring text-[11px] font-bold tracking-[0.25em] uppercase">
              Phòng & Suite
            </span>
            <span className="bg-ring/40 h-px max-w-[120px] flex-1" />
          </div>

          <div className="max-w-3xl">
            <h1 className="text-foreground font-serif text-[44px] leading-[1.05] font-bold sm:text-[56px] md:text-[68px] lg:text-[76px]">
              Nâng tầm kỳ nghỉ
              <br />
              <span className="text-ring">của bạn</span>
            </h1>
            <p className="text-muted-foreground mt-8 max-w-xl text-[15px] leading-relaxed md:text-[16px]">
              Từ những buổi trị liệu Spa thư giãn đến tinh hoa ẩm thực đẳng cấp, hãy để
              chúng tôi biến chuyến đi của bạn thành một hành trình đáng nhớ.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Bento Grid ─── */}
      <section>
        <div className="mb-24 px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="grid h-auto gap-5 md:grid-cols-2 lg:h-[820px] lg:grid-cols-3 lg:grid-rows-2">
            {/* Card 1 — Spa & Wellness (large, col-span-2) */}
            <div className="group relative min-h-[340px] overflow-hidden rounded-2xl md:col-span-2 lg:min-h-0">
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
                    <span className="mb-4 inline-block rounded-full border border-emerald-400/20 bg-emerald-400/20 px-3.5 py-1 text-[10px] font-bold tracking-[0.15em] text-emerald-300 uppercase backdrop-blur-sm">
                      Spa & Wellness
                    </span>
                    <h3 className="mb-3 font-serif text-[30px] leading-tight font-bold md:text-[36px]">
                      Thánh đường Wellness Spa
                    </h3>
                    <p className="max-w-sm text-[13px] leading-relaxed text-white/80">
                      Liệu pháp massage đá nóng và thảo mộc truyền thống, giúp phục hồi
                      năng lượng và cân bằng tâm trí.
                    </p>
                  </div>

                  {/* Price badge */}
                  <div className="shrink-0 rounded-2xl border border-white/10 bg-black/40 p-5 text-left backdrop-blur-xl md:w-[185px] md:text-center">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-amber-400 uppercase">
                      Từ
                    </p>
                    <p className="mt-1 font-serif text-[24px] leading-none font-bold text-white">
                      1.800.000
                      <span className="text-lg underline decoration-1 underline-offset-4">
                        đ
                      </span>
                    </p>
                    <button className="bg-ring mt-4 w-full cursor-pointer rounded-full py-2.5 text-[12px] font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0">
                      Thêm vào kỳ nghỉ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 — Fine Dining (tall, row-span-2) */}
            <div className="bg-muted border-border relative flex h-[520px] flex-col overflow-hidden rounded-2xl border shadow-sm md:row-span-2 lg:h-full">
              {/* Image */}
              <div className="relative h-56 w-full shrink-0 overflow-hidden lg:h-[340px]">
                <img
                  src="https://images.unsplash.com/photo-1544025162-88229b4ddb36?q=80&w=600&auto=format&fit=crop"
                  alt="Fine Dining"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              {/* Text */}
              <div className="flex flex-1 flex-col justify-between p-7 lg:p-8">
                <div>
                  <span className="text-ring mb-3 inline-block text-[10px] font-bold tracking-[0.2em] uppercase">
                    Ẩm thực
                  </span>
                  <h3 className="text-foreground font-serif text-[26px] leading-snug font-bold lg:text-[28px]">
                    Ẩm thực Fine‑dining
                  </h3>
                  <p className="text-muted-foreground mt-3 text-[13px] leading-relaxed">
                    Thưởng thức thực đơn nếm thử (tasting menu) được chế biến bởi các đầu
                    bếp danh tiếng thế giới.
                  </p>
                </div>

                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-muted-foreground text-[10px] font-bold tracking-[0.15em] uppercase">
                      Mỗi khách
                    </p>
                    <p className="text-ring mt-1 font-serif text-[24px] leading-none font-bold">
                      2.500.000
                      <span className="text-lg underline decoration-1 underline-offset-4">
                        đ
                      </span>
                    </p>
                  </div>
                  <button className="bg-ring flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-white shadow-md transition-all hover:scale-110 hover:shadow-lg active:scale-100">
                    <span className="text-xl leading-none font-light">+</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3 — Hồ bơi vô cực (horizontal) */}
            <div className="bg-background border-border flex h-auto flex-col overflow-hidden rounded-2xl border shadow-sm sm:h-[280px] sm:flex-row lg:h-auto">
              {/* Image left */}
              <div className="relative h-52 w-full shrink-0 overflow-hidden sm:h-full sm:w-[45%]">
                <img
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop"
                  alt="Hồ bơi vô cực"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              {/* Text right */}
              <div className="flex flex-col justify-center p-7 sm:w-[55%]">
                <p className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-sky-600 uppercase dark:text-sky-400">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-current text-[9px]">
                    ≈
                  </span>
                  Hồ bơi vô cực
                </p>
                <h3 className="text-foreground mb-2 font-serif text-[24px] leading-snug font-bold lg:text-[26px]">
                  Thư giãn bên hồ
                </h3>
                <p className="text-muted-foreground mb-5 text-[12px] leading-relaxed">
                  Tận hưởng tầm nhìn panorama toàn thành phố và những ly cocktail đặc sắc
                  tại quầy bar tầng thượng.
                </p>
                <p className="text-ring font-serif text-[20px] font-bold">
                  650.000
                  <span className="text-[14px]">đ</span>{" "}
                  <span className="text-muted-foreground font-sans text-[11px] font-normal">
                    / ngày
                  </span>
                </p>
                <button className="border-ring text-ring hover:bg-ring/10 mt-4 w-full cursor-pointer rounded-full border bg-transparent py-2.5 text-[12px] font-bold transition-colors">
                  Đặt chỗ ngay
                </button>
              </div>
            </div>

            {/* Card 4 — Đưa đón sân bay (horizontal reversed) */}
            <div className="bg-muted border-border flex h-auto flex-col-reverse overflow-hidden rounded-2xl border shadow-sm sm:h-[280px] sm:flex-row lg:h-auto">
              {/* Text left */}
              <div className="flex flex-col justify-center p-7 sm:w-[55%]">
                <p className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-emerald-700 uppercase dark:text-emerald-400">
                  <span className="text-sm">🚕</span>
                  Đưa đón
                </p>
                <h3 className="text-foreground mb-2 font-serif text-[24px] leading-snug font-bold lg:text-[26px]">
                  Đưa đón sân bay
                </h3>
                <p className="text-muted-foreground mb-5 text-[12px] leading-relaxed">
                  Dịch vụ xe Limousine sang trọng với tài xế riêng, đảm bảo sự riêng tư và
                  thoải mái tuyệt đối cho quý khách.
                </p>
                <p className="text-ring font-serif text-[20px] font-bold">
                  1.200.000
                  <span className="text-[14px]">đ</span>{" "}
                  <span className="text-muted-foreground font-sans text-[11px] font-normal">
                    / lượt
                  </span>
                </p>
                <button className="border-ring text-ring hover:bg-ring/10 mt-4 w-full cursor-pointer rounded-full border bg-transparent py-2.5 text-[12px] font-bold transition-colors">
                  Thêm dịch vụ
                </button>
              </div>
              {/* Image right */}
              <div className="relative h-52 w-full shrink-0 overflow-hidden sm:h-full sm:w-[45%]">
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
        <div className="mb-24 px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          {/* Section heading */}
          <div className="mb-4 flex items-center gap-4">
            <span className="bg-ring/40 h-px w-10" />
            <span className="text-ring text-[11px] font-bold tracking-[0.25em] uppercase">
              Tiện nghi
            </span>
            <span className="bg-ring/40 h-px w-10" />
          </div>
          <h2 className="text-foreground mb-4 text-center font-serif text-[32px] font-bold md:text-[40px]">
            Mọi thứ bạn cần
          </h2>
          <p className="text-muted-foreground mx-auto mb-14 max-w-lg text-center text-[14px] md:text-[15px]">
            Mỗi chi tiết đều được chăm chút tỉ mỉ để mang đến cho bạn trải nghiệm lưu trú
            hoàn hảo nhất.
          </p>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {amenityItems.map((item) => (
              <div
                key={item.title}
                className="group border-border bg-background hover:border-ring/30 hover:shadow-ring/5 rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="bg-ring/10 text-ring group-hover:bg-ring/20 mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                  <item.icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h3 className="text-foreground mb-2 font-serif text-[18px] font-bold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-[13px] leading-relaxed">
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
          <div className="from-ring/90 to-ring relative overflow-hidden rounded-2xl bg-gradient-to-r px-8 py-14 text-center md:px-16 md:py-20">
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10">
              <h2 className="mb-4 font-serif text-[28px] leading-tight font-bold text-white md:text-[36px] lg:text-[42px]">
                Sẵn sàng cho kỳ nghỉ
                <br className="hidden sm:block" /> hoàn hảo?
              </h2>
              <p className="mx-auto mb-8 max-w-md text-[14px] leading-relaxed text-white/85 md:text-[15px]">
                Liên hệ với chúng tôi để được tư vấn và đặt phòng với những ưu đãi tốt
                nhất.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button className="text-ring flex cursor-pointer items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[13px] font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0">
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
