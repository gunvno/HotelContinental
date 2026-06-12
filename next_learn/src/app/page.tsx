import {
  ArrowRight,
  Bath,
  BedDouble,
  CarFront,
  ChefHat,
  Clock,
  Coffee,
  Eye,
  Flower2,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  Star,
  Users,
  Utensils,
  Wifi,
  Wine,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

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
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
    tag: "Phổ biến",
    guests: 2,
    size: "45m²",
    href: "/room/listroom",
  },
  {
    name: "Ocean View Suite",
    price: "1.800.000đ",
    image:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    tag: "Tầm nhìn biển",
    guests: 2,
    size: "60m²",
    href: "/room/listroom",
  },
  {
    name: "Presidential Suite",
    price: "4.500.000đ",
    image:
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80",
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
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Fine Dining",
    desc: "Ẩm thực Việt – Pháp tinh tế, rượu vang tuyển chọn và không gian riêng tư.",
    icon: Utensils,
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Rooftop Lounge",
    desc: "Cocktail signature, nhạc sống và khung nhìn thành phố về đêm.",
    icon: Wine,
    image:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Limousine Transfer",
    desc: "Đón sân bay riêng, hỗ trợ hành lý và lịch trình linh hoạt.",
    icon: CarFront,
    image:
      "https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=800&q=80",
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
  {
    src: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
    span: "col-span-2 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=600&q=80",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
    span: "",
  },
];

const testimonials = [
  {
    name: "Nguyễn Minh Anh",
    role: "Doanh nhân",
    text: "Không gian sang trọng, dịch vụ chu đáo đến từng chi tiết. Đây là khách sạn tốt nhất tôi từng ở tại Việt Nam.",
    rating: 5,
  },
  {
    name: "David Chen",
    role: "Travel Blogger",
    text: "The Continental redefines luxury hospitality. The attention to detail is impeccable, from the room design to the staff service.",
    rating: 5,
  },
  {
    name: "Trần Thu Hà",
    role: "Kiến trúc sư",
    text: "Thiết kế nội thất kết hợp hoàn hảo giữa nét cổ điển và hiện đại. Mỗi góc đều là một tác phẩm nghệ thuật.",
    rating: 5,
  },
];

/* ═══════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════ */

function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100svh-5rem)] flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=2000&q=80"
          alt="Continental Grand Hotel"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a07]/85 via-[#0c0a07]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a07]/60 via-transparent to-[#0c0a07]/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 items-center px-6 pt-20 pb-12 sm:px-8 sm:pt-24 lg:px-16 lg:pb-14 xl:px-20">
        <div className="max-w-3xl space-y-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-[#d7a25f]" />
            <span className="text-sm font-semibold tracking-[0.3em] text-[#d7a25f] uppercase">
              Khách sạn 5 sao
            </span>
          </div>

          <h1 className="font-serif text-5xl leading-[0.95] font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
            Continental
            <br />
            <span className="text-[#d7a25f]">Grand Hotel</span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed font-light text-white/75 sm:text-xl">
            Nơi hội tụ tinh hoa của sự sang trọng, thanh lịch và dịch vụ đỉnh cao – mang
            đến trải nghiệm nghỉ dưỡng không thể quên giữa lòng thành phố.
          </p>

          <div className="relative z-10 flex flex-wrap gap-4 pt-2">
            <Link
              href="/room/listroom"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#865316] to-[#c68948] px-8 py-4 text-sm font-bold tracking-widest text-white uppercase shadow-2xl shadow-[#865316]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[#865316]/50"
            >
              Khám phá phòng
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#about"
              className="inline-flex items-center gap-3 rounded-full border-2 border-white/30 px-8 py-4 text-sm font-semibold tracking-widest text-white uppercase backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/10"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative z-10">
        <div className="border-t border-white/15 bg-[#0c0a07]/55 backdrop-blur-xl">
          <div className="px-6 sm:px-8 lg:px-16 xl:px-20">
            <div className="grid grid-cols-2 divide-x divide-white/15 md:grid-cols-4">
              {heroStats.map((stat) => (
                <div key={stat.label} className="px-4 py-5 text-center md:px-8 md:py-7">
                  <p className="font-serif text-3xl font-bold text-white md:text-4xl">
                    {stat.value}
                    <span className="text-lg text-[#d7a25f]">{stat.suffix || ""}</span>
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/60">{stat.label}</p>
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
    <section id="about" className="bg-background scroll-mt-20 py-20 md:py-28">
      <div className="px-6 sm:px-8 lg:px-16 xl:px-20">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Images */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]">
                  <img
                    src="https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=600&q=80"
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-2xl shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=400&q=80"
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="aspect-square overflow-hidden rounded-2xl shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80"
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]">
                  <img
                    src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80"
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-2xl bg-gradient-to-r from-[#865316] to-[#c68948] px-8 py-4 text-center text-white shadow-2xl shadow-[#865316]/30">
              <p className="font-serif text-3xl font-bold">15+</p>
              <p className="text-sm font-medium text-white/80">Năm phục vụ</p>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-ring h-px w-10" />
                <span className="text-ring text-xs font-bold tracking-[0.3em] uppercase">
                  Về chúng tôi
                </span>
              </div>
              <h2 className="text-foreground font-serif text-4xl leading-[1.1] font-bold md:text-5xl">
                Nơi hội tụ tinh hoa
                <br />
                <span className="text-ring">nghệ thuật nghỉ dưỡng</span>
              </h2>
              <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
                Continental Grand Hotel tọa lạc tại trung tâm thành phố, mang đến không
                gian nghỉ dưỡng đẳng cấp với kiến trúc cổ điển châu Âu kết hợp tiện nghi
                hiện đại bậc nhất.
              </p>
              <p className="text-muted-foreground max-w-xl leading-relaxed">
                Với hơn 15 năm kinh nghiệm, chúng tôi tự hào phục vụ hàng nghìn du khách
                trong và ngoài nước, mang đến những kỷ niệm nghỉ dưỡng khó quên.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: BedDouble, label: "150+ phòng & suite" },
                { icon: Utensils, label: "3 nhà hàng cao cấp" },
                { icon: Flower2, label: "Spa & bể bơi vô cực" },
                { icon: Clock, label: "Phục vụ 24/7" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border-border/60 bg-muted/40 flex items-center gap-3 rounded-xl border px-4 py-3 dark:bg-white/[0.03]"
                >
                  <item.icon className="text-ring h-5 w-5 shrink-0" />
                  <span className="text-foreground text-sm font-medium">
                    {item.label}
                  </span>
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
    <section className="bg-muted/50 border-border/40 border-y py-20 md:py-28 dark:bg-[#0a0e16]">
      <div className="px-6 sm:px-8 lg:px-16 xl:px-20">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-ring h-px w-10" />
              <span className="text-ring text-xs font-bold tracking-[0.3em] uppercase">
                Phòng & Suite
              </span>
            </div>
            <h2 className="text-foreground font-serif text-4xl leading-tight font-bold md:text-5xl">
              Không gian nghỉ dưỡng
              <br />
              đẳng cấp 5 sao
            </h2>
            <p className="text-muted-foreground max-w-xl text-lg">
              Mỗi căn phòng đều được thiết kế tỉ mỉ, mang đến sự thoải mái tối đa cho kỳ
              nghỉ của bạn.
            </p>
          </div>
          <Button href="/room/listroom" variant="secondary" size="lg">
            Xem tất cả
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featuredRooms.map((room) => (
            <Link key={room.name} href={room.href} className="group">
              <article className="border-border/50 bg-background overflow-hidden rounded-[1.5rem] border shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] dark:bg-white/[0.03] dark:shadow-none">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="bg-ring absolute top-4 left-4 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-wider text-white uppercase shadow-lg">
                    {room.tag}
                  </span>
                  <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-white">
                        {room.name}
                      </h3>
                    </div>
                    <span className="rounded-full border border-white/20 bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">
                      {room.price}
                      <span className="font-normal text-white/60">/đêm</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-5">
                  <div className="text-muted-foreground flex items-center gap-5 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {room.guests} khách
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      {room.size}
                    </span>
                  </div>
                  <span className="text-ring flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-3">
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
        <div className="mb-14 space-y-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="bg-ring h-px w-10" />
            <span className="text-ring text-xs font-bold tracking-[0.3em] uppercase">
              Dịch vụ
            </span>
            <span className="bg-ring h-px w-10" />
          </div>
          <h2 className="text-foreground font-serif text-4xl font-bold md:text-5xl">
            Trải nghiệm dịch vụ
            <br />
            chuẩn 5 sao
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Từ spa thư giãn, ẩm thực tinh tế đến xe đưa đón riêng, mọi dịch vụ đều được
            thiết kế để nâng tầm kỳ nghỉ của bạn.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map((svc) => (
            <article
              key={svc.title}
              className="group border-border/30 relative min-h-[380px] overflow-hidden rounded-[1.5rem] border shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10"
            >
              <img
                src={svc.image}
                alt={svc.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a07]/90 via-[#0c0a07]/40 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-6">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/15 backdrop-blur-md">
                  <svc.icon className="h-6 w-6 text-[#d7a25f]" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">{svc.title}</h3>
                <p className="text-sm leading-relaxed text-white/70">{svc.desc}</p>
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
    <section className="bg-muted/50 border-border/40 border-y py-20 md:py-28 dark:bg-[#0a0e16]">
      <div className="px-6 sm:px-8 lg:px-16 xl:px-20">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-ring h-px w-10" />
                <span className="text-ring text-xs font-bold tracking-[0.3em] uppercase">
                  Tiện nghi
                </span>
              </div>
              <h2 className="text-foreground font-serif text-4xl leading-tight font-bold md:text-5xl">
                Tiện nghi đẳng cấp
                <br />
                trong từng chi tiết
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Mỗi phòng đều được trang bị đầy đủ tiện nghi cao cấp, đảm bảo sự thoải mái
                tuyệt đối cho kỳ nghỉ của bạn.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {amenities.map((item) => (
                <div
                  key={item.label}
                  className="border-border/50 bg-background hover:border-ring/40 hover:bg-ring/5 group flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all duration-300 dark:bg-white/[0.03]"
                >
                  <div className="bg-ring/10 dark:bg-ring/15 group-hover:bg-ring/20 inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors">
                    <item.icon className="text-ring h-5 w-5" />
                  </div>
                  <span className="text-foreground text-sm font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid h-[500px] grid-cols-3 grid-rows-3 gap-3">
            <div className="col-span-2 row-span-2 overflow-hidden rounded-2xl">
              <img
                src={gallery[0].src}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="overflow-hidden rounded-2xl">
              <img
                src={gallery[1].src}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="overflow-hidden rounded-2xl">
              <img
                src={gallery[2].src}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="overflow-hidden rounded-2xl">
              <img
                src={gallery[3].src}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="col-span-2 overflow-hidden rounded-2xl">
              <img
                src={gallery[4].src}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
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
        <div className="mb-14 space-y-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="bg-ring h-px w-10" />
            <span className="text-ring text-xs font-bold tracking-[0.3em] uppercase">
              Đánh giá
            </span>
            <span className="bg-ring h-px w-10" />
          </div>
          <h2 className="text-foreground font-serif text-4xl font-bold md:text-5xl">
            Khách hàng nói gì
            <br />
            về chúng tôi
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <article
              key={t.name}
              className="border-border/50 bg-muted/30 hover:border-ring/30 rounded-[1.5rem] border p-7 transition-all duration-300 hover:shadow-lg dark:bg-white/[0.03]"
            >
              <div className="mb-5 flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-[#d7a25f] text-[#d7a25f]" />
                ))}
              </div>
              <p className="text-foreground/90 mb-6 text-[15px] leading-relaxed italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="border-border/40 flex items-center gap-3 border-t pt-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#865316] to-[#c68948] text-sm font-bold text-white shadow-lg">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-foreground text-sm font-bold">{t.name}</p>
                  <p className="text-muted-foreground text-xs">{t.role}</p>
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
    <section
      id="contact"
      className="relative scroll-mt-20 overflow-hidden py-20 md:py-28"
    >
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0c0a07]/80" />
      </div>

      <div className="relative px-6 sm:px-8 lg:px-16 xl:px-20">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#d7a25f]" />
            <span className="text-xs font-bold tracking-[0.3em] text-[#d7a25f] uppercase">
              Liên hệ
            </span>
            <span className="h-px w-10 bg-[#d7a25f]" />
          </div>
          <h2 className="font-serif text-4xl leading-tight font-bold text-white md:text-5xl lg:text-6xl">
            Sẵn sàng cho kỳ nghỉ
            <br />
            đẳng cấp của bạn?
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/70">
            Liên hệ đội ngũ concierge của chúng tôi để được tư vấn và đặt phòng với ưu đãi
            tốt nhất.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/room/listroom"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#865316] to-[#c68948] px-8 py-4 text-sm font-bold tracking-widest text-white uppercase shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              Đặt phòng ngay
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="tel:+842812345678"
              className="inline-flex items-center gap-3 rounded-full border-2 border-white/30 px-8 py-4 text-sm font-semibold tracking-widest text-white uppercase transition-all duration-300 hover:border-white/50 hover:bg-white/10"
            >
              <Phone className="h-4 w-4" />
              +84 28 1234 5678
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-8 pt-6 text-sm text-white/60">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Quận 1, TP.HCM
            </span>
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              concierge@continental.vn
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Check-in: 14:00 | Check-out: 12:00
            </span>
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
