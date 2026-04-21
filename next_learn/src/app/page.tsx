import Link from "next/link";
import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRight, Bath, CarFront, ChefHat, Flower2, Sparkles, Utensils, Wine } from "lucide-react";

const serviceStats = [
  { label: "Dịch vụ sẵn sàng", value: "24/7" },
  { label: "Gói trải nghiệm", value: "18+" },
  { label: "Đánh giá hài lòng", value: "97%" },
];

const serviceHighlights = [
  {
    title: "Spa & Wellness",
    description: "Liệu trình thư giãn, xông hơi thảo mộc và bể ngâm riêng tư trong không gian yên tĩnh.",
    label: "Từ 900.000đ",
    href: "/room/listroom",
    image:
      "linear-gradient(180deg, rgba(18, 24, 34, 0.08), rgba(18, 24, 34, 0.72)), url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1600&auto=format&fit=crop')",
    icon: Flower2,
  },
  {
    title: "Fine Dining",
    description: "Thực đơn theo mùa, rượu vang tuyển chọn và không gian bàn tiệc ấm cúng.",
    label: "Từ 450.000đ",
    href: "/room/listroom",
    image:
      "linear-gradient(180deg, rgba(18, 24, 34, 0.1), rgba(18, 24, 34, 0.68)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop')",
    icon: Utensils,
  },
  {
    title: "Rooftop Lounge",
    description: "Cocktail theo signature, âm nhạc nhẹ và khung nhìn thành phố về đêm.",
    label: "Mở cửa đến 23:30",
    href: "/room/listroom",
    image:
      "linear-gradient(180deg, rgba(18, 24, 34, 0.08), rgba(18, 24, 34, 0.7)), url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1600&auto=format&fit=crop')",
    icon: Wine,
  },
  {
    title: "Limousine Transfer",
    description: "Đón sân bay riêng, hỗ trợ hành lý và lịch trình linh hoạt theo giờ bay.",
    label: "Đặt trước 2 giờ",
    href: "/#contact",
    image:
      "linear-gradient(180deg, rgba(18, 24, 34, 0.08), rgba(18, 24, 34, 0.74)), url('https://images.unsplash.com/photo-1489824904134-891ab64532f1?q=80&w=1600&auto=format&fit=crop')",
    icon: CarFront,
  },
];

const signatureServices = [
  {
    title: "Phục vụ phòng 24/7",
    description: "Bữa sáng muộn, trà chiều và thực đơn đêm giao tận phòng theo yêu cầu.",
    icon: ChefHat,
  },
  {
    title: "Tiện ích hồ bơi & gym",
    description: "Khu vận động và thư giãn riêng cho khách lưu trú với tiêu chuẩn khách sạn 5 sao.",
    icon: Bath,
  },
  {
    title: "Concierge cá nhân",
    description: "Hỗ trợ đặt bàn, tour thành phố, vé sự kiện và các yêu cầu đặc biệt.",
    icon: Sparkles,
  },
];

function ServiceCard({
  title,
  description,
  label,
  href,
  image,
  icon: Icon,
  large = false,
}: {
  title: string;
  description: string;
  label: string;
  href: string;
  image: string;
  icon: ComponentType<{ className?: string }>;
  large?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        large
          ? "group relative overflow-hidden rounded-[2rem] border border-white/20 bg-slate-900 text-white shadow-[0_30px_90px_-45px_rgba(15,10,5,0.85)]"
          : "group relative overflow-hidden rounded-[1.75rem] border border-white/20 bg-slate-900 text-white shadow-[0_24px_70px_-38px_rgba(15,10,5,0.8)]"
      }
    >
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: image }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#120c07]/60 via-transparent to-[#120c07]/80" />
      <div className="relative flex h-full min-h-[280px] flex-col justify-between p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90 backdrop-blur-md">
            <Icon className="h-3.5 w-3.5" />
            {label}
          </span>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/90 backdrop-blur-md">
            5 sao
          </span>
        </div>

        <div className="space-y-3">
          <h3 className={large ? "max-w-xl text-3xl font-semibold" : "max-w-lg text-2xl font-semibold"}>
            {title}
          </h3>
          <p className={large ? "max-w-lg text-sm leading-6 text-white/82" : "max-w-md text-sm leading-6 text-white/80"}>
            {description}
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            Khám phá chi tiết
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <>
      <section id="amenities" className="border-border/60 relative overflow-hidden border-b bg-gradient-to-b from-[#f7f0e5] via-[#fcfaf5] to-[#f1e5d3] scroll-mt-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-[#d5a15f]/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#7f5b31]/10 blur-3xl" />
        </div>

        <Container className="relative py-20 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.12fr),minmax(320px,0.88fr)] lg:items-center">
            <div className="space-y-7">
              <span className="border-border/60 bg-white/70 text-[#8b5e22] inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-[0.28em] uppercase shadow-sm backdrop-blur-md">
                Trải nghiệm khách sạn
              </span>
              <div className="space-y-4">
                <h1 className="max-w-2xl font-serif text-5xl leading-[1.02] font-semibold tracking-tight text-[#24170f] sm:text-6xl">
                  Nâng tầm kỳ nghỉ của bạn với dịch vụ được chăm chút đến từng chi tiết.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[#5a493a]">
                  Từ spa, ẩm thực đến xe đưa đón và concierge riêng, mọi trải nghiệm đều được thiết kế để mang lại cảm giác thanh lịch, riêng tư và trọn vẹn.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {serviceStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.5rem] border border-white/60 bg-white/75 p-4 shadow-[0_18px_40px_-28px_rgba(66,45,22,0.45)] backdrop-blur-md"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b5e22]">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[#24170f]">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Button href="/room/listroom">Khám phá phòng</Button>
                <Button href="/#contact" variant="secondary">
                  Liên hệ concierge
                </Button>
              </div>
            </div>

            <div id="rooms" className="relative scroll-mt-28">
              <div className="absolute -inset-6 rounded-[2.25rem] bg-[#d5a15f]/10 blur-2xl" aria-hidden="true" />
              <div className="relative grid gap-4 rounded-[2.25rem] border border-white/70 bg-white/75 p-4 shadow-[0_28px_80px_-40px_rgba(66,45,22,0.55)] backdrop-blur-xl sm:p-5">
                <div className="grid gap-4 sm:grid-cols-[1.2fr,0.8fr]">
                  <div className="min-h-[260px] rounded-[1.75rem] border border-white/50 bg-cover bg-center p-5 text-white shadow-[0_22px_55px_-35px_rgba(0,0,0,0.55)]" style={{ backgroundImage: "linear-gradient(180deg, rgba(12, 18, 26, 0.08), rgba(12, 18, 26, 0.72)), url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop')" }}>
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] backdrop-blur-md">
                          Signature suite
                        </span>
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold backdrop-blur-md">
                          4.9/5
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm uppercase tracking-[0.3em] text-white/75">Phòng nghỉ</p>
                        <h2 className="max-w-xs text-2xl font-semibold">Không gian ấm, sáng và riêng tư cho kỳ nghỉ trọn vẹn.</h2>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-[1.75rem] border border-border/50 bg-[#f5eee2] p-5 text-[#24170f] shadow-[0_18px_40px_-28px_rgba(66,45,22,0.35)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b5e22]">Dịch vụ nổi bật</p>
                      <div className="mt-4 space-y-4 text-sm text-[#5a493a]">
                        <div className="flex items-start gap-3">
                          <Sparkles className="mt-0.5 h-4 w-4 text-[#8b5e22]" />
                          <span>Ưu tiên nhận phòng sớm và trả phòng muộn theo tình trạng phòng.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <Flower2 className="mt-0.5 h-4 w-4 text-[#8b5e22]" />
                          <span>Trị liệu spa riêng với âm nhạc, tinh dầu và khu ngâm thư giãn.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <CarFront className="mt-0.5 h-4 w-4 text-[#8b5e22]" />
                          <span>Xe đưa đón và concierge hỗ trợ toàn bộ lịch trình của bạn.</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-white/60 bg-white/80 p-5 shadow-[0_18px_40px_-28px_rgba(66,45,22,0.35)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b5e22]">Đặt lịch nhanh</p>
                      <p className="mt-3 text-sm leading-6 text-[#5a493a]">
                        Chọn dịch vụ phù hợp và để đội ngũ của chúng tôi xử lý phần còn lại.
                      </p>
                      <Button href="/#contact" className="mt-4 w-full">
                        Nhận tư vấn
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-border/60 border-b bg-[#fcfaf5]">
        <Container className="py-16 md:py-20">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8b5e22]">Dịch vụ tiêu biểu</p>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#24170f] sm:text-4xl">
                Những trải nghiệm được chọn lọc cho kỳ nghỉ sang trọng.
              </h2>
              <p className="text-[#5a493a]">
                Bố cục lấy cảm hứng từ gallery dịch vụ cao cấp: một điểm nhấn lớn, các thẻ phụ cân bằng và thông tin ngắn gọn, dễ quét.
              </p>
            </div>
            <Button href="/room/listroom" variant="secondary">
              Xem toàn bộ dịch vụ
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
            <ServiceCard {...serviceHighlights[0]} large />

            <div className="grid gap-4">
              <ServiceCard {...serviceHighlights[1]} />
              <div className="grid gap-4 sm:grid-cols-2">
                <ServiceCard {...serviceHighlights[2]} />
                <ServiceCard {...serviceHighlights[3]} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#f3ece1]">
        <Container className="py-16 md:py-20">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8b5e22]">Tiện nghi cao cấp</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[#24170f] sm:text-4xl">
              Nâng tầm trải nghiệm lưu trú
            </h2>
            <p className="mt-3 text-[#5a493a] max-w-2xl mx-auto">
              Từ chăm sóc sức khỏe, phục vụ phòng đến đội ngũ concierge tận tâm, mọi dịch vụ đều sẵn sàng hỗ trợ bạn.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {signatureServices.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.title}
                  className="rounded-[1.75rem] border border-white/70 bg-white/75 p-6 shadow-[0_18px_40px_-30px_rgba(66,45,22,0.35)] backdrop-blur-md"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8b5e22]/10 text-[#8b5e22]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#24170f]">{service.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5a493a]">{service.description}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="contact" className="scroll-mt-28 border-border/60 border-t bg-[#fcfaf5]">
        <Container className="flex flex-col gap-10 py-16 md:flex-row md:items-start md:justify-between md:py-20">
          <div className="md:max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8b5e22]">Liên hệ concierge</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-[#24170f]">Đặt dịch vụ theo nhu cầu riêng của bạn.</h2>
            <p className="mt-3 text-[#5a493a]">
              Từ ẩm thực, xe đưa đón đến spa và sự kiện riêng, đội ngũ lễ tân sẽ thiết kế lịch trình phù hợp với từng kỳ nghỉ.
            </p>
          </div>

          <div className="grid flex-1 gap-4">
            <article className="rounded-[1.75rem] border border-white/70 bg-[#24170f] p-6 text-white shadow-[0_22px_60px_-35px_rgba(15,10,5,0.75)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65">Ưu tiên hỗ trợ</p>
              <p className="mt-3 text-lg leading-7 text-white/88">
                Chỉ cần gửi yêu cầu, chúng tôi sẽ phản hồi với gợi ý phù hợp, sắp xếp chi tiết và xác nhận trong thời gian sớm nhất.
              </p>
            </article>

            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_40px_-30px_rgba(66,45,22,0.35)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b5e22]">Email</p>
                <p className="mt-2 text-[#24170f]">concierge@continental.example</p>
              </article>
              <article className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_40px_-30px_rgba(66,45,22,0.35)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b5e22]">Hotline</p>
                <p className="mt-2 text-[#24170f]">+84 28 1234 5678</p>
              </article>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
