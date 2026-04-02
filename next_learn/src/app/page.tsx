import { BedDouble, CheckCircle2, ConciergeBell, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { FeatureCard } from "@/components/ui/feature-card";
import { StatsHighlight } from "@/components/ui/stats-highlight";

const featureHighlights = [
  {
    title: "Suites đẳng cấp",
    description:
      "Phòng nghỉ rộng rãi với ban công riêng, trang thiết bị cao cấp và tiêu chuẩn 5 sao.",
    icon: <BedDouble className="h-6 w-6" />,
  },
  {
    title: "Trải nghiệm cá nhân hóa",
    description:
      "Dịch vụ concierge 24/7, hỗ trợ đặt xe, tour và thực đơn theo nhu cầu riêng.",
    icon: <ConciergeBell className="h-6 w-6" />,
  },
  {
    title: "Vị trí trung tâm",
    description:
      "Chỉ vài phút tới khu tài chính, trung tâm mua sắm và điểm du lịch nổi tiếng.",
    icon: <MapPin className="h-6 w-6" />,
  },
  {
    title: "Không gian sự kiện",
    description:
      "Sảnh tiệc sang trọng với hệ thống âm thanh ánh sáng hiện đại cho mọi dịp.",
    icon: <Sparkles className="h-6 w-6" />,
  },
];

const stats = [
  { label: "Đánh giá hài lòng", value: "97%" },
  { label: "Phòng & suite", value: "120" },
  { label: "Sự kiện mỗi tháng", value: "25+" },
];

const heroPerks = [
  "Miễn phí nhận phòng sớm và trả muộn tùy thuộc tình trạng phòng.",
  "Xe riêng đưa đón sân bay cùng đồ uống chào mừng đặc biệt.",
  "Liệu trình spa 90 phút cho mỗi kỳ lưu trú từ 2 đêm trở lên.",
];

export type LearningResource = {
  id: number;
  title: string;
  description: string;
  url: string;
};

const fallbackResources: LearningResource[] = [
  {
    id: 1,
    title: "Ưu đãi gói nghỉ dưỡng 3 ngày 2 đêm",
    description:
      "Bao gồm bữa sáng buffet, liệu trình spa 60 phút và đưa đón sân bay bằng xe riêng.",
    url: "https://continental.example.com/offers/3n2d",
  },
  {
    id: 2,
    title: "Hành trình ẩm thực ven biển",
    description:
      "Thực đơn hải sản theo mùa do bếp trưởng Continental tuyển chọn, phục vụ tại phòng hoặc nhà hàng Lagoon.",
    url: "https://continental.example.com/dining/lagoon-experience",
  },
  {
    id: 3,
    title: "Tour khám phá phố cổ về đêm",
    description:
      "Xe buggy riêng và hướng dẫn viên song ngữ đưa bạn dạo phố cổ và thưởng thức cà phê rooftop.",
    url: "https://continental.example.com/experiences/night-tour",
  },
];

export default async function Home() {

  return (
    <>
      <section className="border-border/60 via-background to-background/80 border-b bg-gradient-to-b from-[#f9f3ea]">
        <Container className="py-20 md:py-24">
          <div className="grid gap-14 md:grid-cols-[minmax(0,1fr),380px] md:items-center">
            <div className="space-y-7 md:max-w-2xl">
              <span className="border-border/60 bg-background/80 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                Trải nghiệm 5 sao
              </span>
              <h1 className="text-foreground text-4xl leading-tight font-semibold sm:text-5xl">
                Kỳ nghỉ thanh lịch giữa lòng thành phố biển.
              </h1>
              <p className="text-muted-foreground text-lg">
                Tận hưởng phòng nghỉ tràn ngập ánh sáng, không gian spa đẳng cấp và dịch
                vụ cá nhân hóa được thiết kế cho kỳ nghỉ hoàn hảo của bạn.
              </p>
              <ul className="text-muted-foreground space-y-3 text-sm">
                {heroPerks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3">
                    <span className="bg-ring/15 text-ring mt-1 rounded-full p-1">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-4">
                <Button href="https://www.booking.com" target="_blank" rel="noreferrer">
                  Đặt phòng ngay
                </Button>
                <Button
                  href="https://maps.app.goo.gl/"
                  variant="secondary"
                  target="_blank"
                  rel="noreferrer"
                >
                  Xem vị trí khách sạn
                </Button>
              </div>
            </div>
            <div id="rooms" className="relative w-full md:max-w-md">
              <div
                className="from-ring/25 absolute -inset-4 rounded-3xl bg-gradient-to-br via-transparent to-transparent blur-2xl"
                aria-hidden="true"
              />
              <div className="border-border/50 bg-background/95 relative overflow-hidden rounded-3xl border p-8 shadow-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                      Bảng đặt phòng
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Chọn hạng phòng yêu thích trong chớp mắt.
                    </p>
                  </div>
                  <span className="bg-ring/15 text-ring rounded-full px-3 py-1 text-xs font-semibold">
                    Ưu đãi 20%
                  </span>
                </div>
                <div className="mt-6">
                  <StatsHighlight
                    items={stats}
                    className="border-none bg-transparent p-0 shadow-none sm:grid-cols-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="amenities" className="border-border/60 bg-background border-b">
        <Container className="py-16 md:py-20">
          <div className="grid gap-6 md:grid-cols-2">
            {featureHighlights.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </Container>
      </section>

      <section id="contact" className="bg-muted/30">
        <Container className="flex flex-col gap-10 py-16 md:flex-row md:items-start md:justify-between md:py-20">
          <div className="md:max-w-sm">
            <h2 className="text-foreground text-2xl font-semibold">Sẵn sàng hỗ trợ</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Đội ngũ lễ tân và concierge túc trực 24/7 để hỗ trợ mọi nhu cầu của bạn từ
              khi nhận phòng tới lúc rời đi.
            </p>
            <p className="text-muted-foreground mt-4 text-xs tracking-wide uppercase">
              Tình trạng dịch vụ: <span className="font-semibold">Sẵn sàng phục vụ</span>
            </p>
          </div>
          <div className="grid flex-1 gap-4">
            {fallbackResources.map((resource) => (
              <article
                key={resource.id}
                className="group border-border/40 from-background/96 via-background/92 to-background/75 flex flex-col gap-3 rounded-3xl border bg-gradient-to-br p-6 shadow-[0_22px_55px_-35px_rgba(31,41,55,0.45)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-foreground text-base font-semibold">
                    {resource.title}
                  </h3>
                  <Link
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ring text-xs font-semibold transition-opacity group-hover:opacity-100"
                  >
                    Tìm hiểu thêm
                  </Link>
                </div>
                <p className="text-muted-foreground text-sm">{resource.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
