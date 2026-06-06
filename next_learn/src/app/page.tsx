import Link from "next/link";
import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  ArrowRight, Bath, BedDouble, CarFront, ChefHat, Clock, Coffee, Flower2, MapPin,
  Phone, Mail, Sparkles, Star, Utensils, Wifi, Wine, Users, Eye, Shield,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════ */

const heroStats = [
  { value: "150+", label: "Phòng & Suite" },
  { value: "24/7", label: "Dịch vụ phòng" },
  { value: "4.9", label: "Đánh giá khách", suffix: "/5" },
  { value: "15+", label: "Năm kinh nghiệm" },
];

const featuredRooms = [
  {
    name: "Deluxe Suite",
    price: "1.200.000đ",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
    tag: "Phổ biến",
    guests: 2,
    size: "45m²",
    href: "/room/listroom",
  },
  {
    name: "Ocean View Suite",
    price: "1.800.000đ",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    tag: "Tầm nhìn biển",
    guests: 2,
    size: "60m²",
    href: "/room/listroom",
  },
  {
    name: "Presidential Suite",
    price: "4.500.000đ",
    image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80",
    tag: "Đẳng cấp",
    guests: 4,
    size: "120m²",
    href: "/room/listroom",
  },
];

const services = [
  {
    title: "Spa & Wellness",
    desc: "Liệu trình thư giãn độc quyền, xông hơi thảo mộc và bể ngâm riêng tư.",
    icon: Flower2,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Fine Dining",
    desc: "Ẩm thực Việt – Pháp tinh tế, rượu vang tuyển chọn và không gian riêng tư.",
    icon: Utensils,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Rooftop Lounge",
    desc: "Cocktail signature, nhạc sống và khung nhìn thành phố về đêm.",
    icon: Wine,
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Limousine Transfer",
    desc: "Đón sân bay riêng, hỗ trợ hành lý và lịch trình linh hoạt.",
    icon: CarFront,
    image: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=800&q=80",
  },
];

const amenities = [
  { icon: Wifi, label: "Wi-Fi tốc độ cao" },
  { icon: Coffee, label: "Minibar cao cấp" },
  { icon: Bath, label: "Bồn tắm cẩm thạch" },
  { icon: BedDouble, label: "Giường King-size" },
  { icon: Shield, label: "Két an toàn" },
  { icon: ChefHat, label: "Phục vụ phòng 24/7" },
  { icon: Eye, label: "View thành phố" },
  { icon: Sparkles, label: "Concierge riêng" },
];

const gallery = [
  { src: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", span: "col-span-2 row-span-2" },
  { src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80", span: "" },
  { src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80", span: "" },
  { src: "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=600&q=80", span: "" },
  { src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80", span: "" },
];

const testimonials = [
  { name: "Nguyễn Minh Anh", role: "Doanh nhân", text: "Không gian sang trọng, dịch vụ chu đáo đến từng chi tiết. Đây là khách sạn tốt nhất tôi từng ở tại Việt Nam.", rating: 5 },
  { name: "David Chen", role: "Travel Blogger", text: "The Continental redefines luxury hospitality. The attention to detail is impeccable, from the room design to the staff service.", rating: 5 },
  { name: "Trần Thu Hà", role: "Kiến trúc sư", text: "Thiết kế nội thất kết hợp hoàn hảo giữa nét cổ điển và hiện đại. Mỗi góc đều là một tác phẩm nghệ thuật.", rating: 5 },
];

/* ═══════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════ */

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=2000&q=80"
          alt="Continental Grand Hotel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a07]/85 via-[#0c0a07]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a07]/60 via-transparent to-[#0c0a07]/30" />
      </div>

      {/* Content */}
      <div className="relative w-full px-6 sm:px-8 lg:px-16 xl:px-20 pt-32 pb-20">
        <div className="max-w-3xl space-y-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-[#d7a25f]" />
            <span className="text-[#d7a25f] text-sm font-semibold tracking-[0.3em] uppercase">
              Khách sạn 5 sao
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight">
            Continental<br />
            <span className="text-[#d7a25f]">Grand Hotel</span>
          </h1>

          <p className="text-white/75 text-lg sm:text-xl max-w-xl leading-relaxed font-light">
            Nơi hội tụ tinh hoa của sự sang trọng, thanh lịch và dịch vụ đỉnh cao – mang đến trải nghiệm nghỉ dưỡng không thể quên giữa lòng thành phố.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/room/listroom"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#865316] to-[#c68948] px-8 py-4 text-white font-bold text-sm uppercase tracking-widest shadow-2xl shadow-[#865316]/30 hover:-translate-y-1 hover:shadow-[#865316]/50 transition-all duration-300"
            >
              Khám phá phòng
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#about"
              className="inline-flex items-center gap-3 rounded-full border-2 border-white/30 px-8 py-4 text-white font-semibold text-sm uppercase tracking-widest backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border-t border-white/15">
          <div className="px-6 sm:px-8 lg:px-16 xl:px-20">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/15">
              {heroStats.map((stat) => (
                <div key={stat.label} className="py-6 md:py-8 px-4 md:px-8 text-center">
                  <p className="text-white text-3xl md:text-4xl font-serif font-bold">
                    {stat.value}<span className="text-[#d7a25f] text-lg">{stat.suffix || ""}</span>
                  </p>
                  <p className="text-white/60 text-sm mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 bg-background py-20 md:py-28">
      <div className="px-6 sm:px-8 lg:px-16 xl:px-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Images */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden aspect-[3/4] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]">
                  <img src="https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=600&q=80" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="rounded-2xl overflow-hidden aspect-square shadow-lg">
                  <img src="https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=400&q=80" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
              <div className="pt-8 space-y-4">
                <div className="rounded-2xl overflow-hidden aspect-square shadow-lg">
                  <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="rounded-2xl overflow-hidden aspect-[3/4] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]">
                  <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#865316] to-[#c68948] text-white rounded-2xl px-8 py-4 shadow-2xl shadow-[#865316]/30 text-center">
              <p className="text-3xl font-serif font-bold">15+</p>
              <p className="text-sm text-white/80 font-medium">Năm phục vụ</p>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-ring" />
                <span className="text-ring text-xs font-bold tracking-[0.3em] uppercase">Về chúng tôi</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-[1.1]">
                Nơi hội tụ tinh hoa<br />
                <span className="text-ring">nghệ thuật nghỉ dưỡng</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                Continental Grand Hotel tọa lạc tại trung tâm thành phố, mang đến không gian nghỉ dưỡng đẳng cấp với kiến trúc cổ điển châu Âu kết hợp tiện nghi hiện đại bậc nhất.
              </p>
              <p className="text-muted-foreground leading-relaxed max-w-xl">
                Với hơn 15 năm kinh nghiệm, chúng tôi tự hào phục vụ hàng nghìn du khách trong và ngoài nước, mang đến những kỷ niệm nghỉ dưỡng khó quên.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: BedDouble, label: "150+ phòng & suite" },
                { icon: Utensils, label: "3 nhà hàng cao cấp" },
                { icon: Flower2, label: "Spa & bể bơi vô cực" },
                { icon: Clock, label: "Phục vụ 24/7" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 dark:bg-white/[0.03] px-4 py-3">
                  <item.icon className="h-5 w-5 text-ring shrink-0" />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
              ))}
            </div>

            <Button href="/room/listroom" size="lg">
              Xem tất cả phòng
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoomShowcase() {
  return (
    <section className="bg-muted/50 dark:bg-[#0a0e16] py-20 md:py-28 border-y border-border/40">
      <div className="px-6 sm:px-8 lg:px-16 xl:px-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-ring" />
              <span className="text-ring text-xs font-bold tracking-[0.3em] uppercase">Phòng & Suite</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Không gian nghỉ dưỡng<br />đẳng cấp 5 sao
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Mỗi căn phòng đều được thiết kế tỉ mỉ, mang đến sự thoải mái tối đa cho kỳ nghỉ của bạn.
            </p>
          </div>
          <Button href="/room/listroom" variant="secondary" size="lg">
            Xem tất cả
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featuredRooms.map((room) => (
            <Link key={room.name} href={room.href} className="group">
              <article className="rounded-[1.5rem] overflow-hidden border border-border/50 bg-background dark:bg-white/[0.03] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] dark:shadow-none hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-2">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 rounded-full bg-ring px-4 py-1.5 text-[11px] font-bold text-white uppercase tracking-wider shadow-lg">
                    {room.tag}
                  </span>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <h3 className="text-white text-2xl font-serif font-bold">{room.name}</h3>
                    </div>
                    <span className="bg-white/20 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white text-sm font-bold">
                      {room.price}<span className="text-white/60 font-normal">/đêm</span>
                    </span>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{room.guests} khách</span>
                    <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{room.size}</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-ring text-sm font-semibold group-hover:gap-3 transition-all">
                    Chi tiết <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="px-6 sm:px-8 lg:px-16 xl:px-20">
        <div className="text-center mb-14 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-ring" />
            <span className="text-ring text-xs font-bold tracking-[0.3em] uppercase">Dịch vụ</span>
            <span className="h-px w-10 bg-ring" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            Trải nghiệm dịch vụ<br />chuẩn 5 sao
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Từ spa thư giãn, ẩm thực tinh tế đến xe đưa đón riêng, mọi dịch vụ đều được thiết kế để nâng tầm kỳ nghỉ của bạn.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((svc) => (
            <article key={svc.title} className="group relative rounded-[1.5rem] overflow-hidden min-h-[380px] border border-border/30 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <img src={svc.image} alt={svc.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a07]/90 via-[#0c0a07]/40 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-6">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
                  <svc.icon className="h-6 w-6 text-[#d7a25f]" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">{svc.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{svc.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AmenitiesSection() {
  return (
    <section className="bg-muted/50 dark:bg-[#0a0e16] py-20 md:py-28 border-y border-border/40">
      <div className="px-6 sm:px-8 lg:px-16 xl:px-20">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-ring" />
                <span className="text-ring text-xs font-bold tracking-[0.3em] uppercase">Tiện nghi</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Tiện nghi đẳng cấp<br />trong từng chi tiết
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Mỗi phòng đều được trang bị đầy đủ tiện nghi cao cấp, đảm bảo sự thoải mái tuyệt đối cho kỳ nghỉ của bạn.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {amenities.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-xl border border-border/50 bg-background dark:bg-white/[0.03] px-4 py-3.5 hover:border-ring/40 hover:bg-ring/5 transition-all duration-300 group">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ring/10 dark:bg-ring/15 group-hover:bg-ring/20 transition-colors">
                    <item.icon className="h-5 w-5 text-ring" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-3 grid-rows-3 gap-3 h-[500px]">
            <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden">
              <img src={gallery[0].src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img src={gallery[1].src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img src={gallery[2].src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img src={gallery[3].src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="col-span-2 rounded-2xl overflow-hidden">
              <img src={gallery[4].src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="px-6 sm:px-8 lg:px-16 xl:px-20">
        <div className="text-center mb-14 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-ring" />
            <span className="text-ring text-xs font-bold tracking-[0.3em] uppercase">Đánh giá</span>
            <span className="h-px w-10 bg-ring" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            Khách hàng nói gì<br />về chúng tôi
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <article key={t.name} className="rounded-[1.5rem] border border-border/50 bg-muted/30 dark:bg-white/[0.03] p-7 hover:border-ring/30 hover:shadow-lg transition-all duration-300">
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-[#d7a25f] text-[#d7a25f]" />
                ))}
              </div>
              <p className="text-foreground/90 leading-relaxed mb-6 text-[15px] italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#865316] to-[#c68948] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="contact" className="scroll-mt-20 relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=2000&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0c0a07]/80" />
      </div>

      <div className="relative px-6 sm:px-8 lg:px-16 xl:px-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#d7a25f]" />
            <span className="text-[#d7a25f] text-xs font-bold tracking-[0.3em] uppercase">Liên hệ</span>
            <span className="h-px w-10 bg-[#d7a25f]" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Sẵn sàng cho kỳ nghỉ<br />đẳng cấp của bạn?
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Liên hệ đội ngũ concierge của chúng tôi để được tư vấn và đặt phòng với ưu đãi tốt nhất.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/room/listroom"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#865316] to-[#c68948] px-8 py-4 text-white font-bold text-sm uppercase tracking-widest shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              Đặt phòng ngay
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="tel:+842812345678"
              className="inline-flex items-center gap-3 rounded-full border-2 border-white/30 px-8 py-4 text-white font-semibold text-sm uppercase tracking-widest hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              <Phone className="h-4 w-4" />
              +84 28 1234 5678
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-8 pt-6 text-white/60 text-sm">
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />Quận 1, TP.HCM</span>
            <span className="flex items-center gap-2"><Mail className="h-4 w-4" />concierge@continental.vn</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" />Check-in: 14:00 | Check-out: 12:00</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════ */

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <RoomShowcase />
      <ServicesSection />
      <AmenitiesSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
