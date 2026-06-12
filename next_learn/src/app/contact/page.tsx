import {
  CalendarCheck,
  ChevronDown,
  Clock,
  ConciergeBell,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  Search,
} from "lucide-react";

export default function ContactPage() {
  return (
    <main className="bg-background text-foreground min-h-screen font-sans">
      {/* ─── Hero Section ─── */}
      <section className="pt-20">
        <div className="px-6 py-24 text-center sm:px-8 md:py-32 lg:px-12 xl:px-16 2xl:px-20">
          <p className="text-ring mb-6 text-sm font-semibold tracking-[0.3em] uppercase">
            Trung tâm hỗ trợ
          </p>
          <h1 className="mb-6 font-serif text-4xl leading-tight font-bold sm:text-5xl md:text-6xl lg:text-7xl">
            Chúng tôi có thể giúp gì cho bạn?
          </h1>
          <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-lg leading-relaxed md:text-xl">
            Tìm kiếm câu trả lời nhanh chóng cho các thắc mắc phổ biến về kỳ nghỉ của bạn
            tại Continental Grand.
          </p>

          {/* Search Bar */}
          <div className="group relative mx-auto max-w-2xl">
            <div className="text-ring pointer-events-none absolute inset-y-0 left-6 flex items-center">
              <Search className="h-6 w-6" />
            </div>
            <input
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:ring-ring/30 focus:border-ring/40 w-full rounded-full border py-5 pr-8 pl-16 text-lg shadow-sm transition-all outline-none focus:ring-2"
              placeholder="Nhập câu hỏi hoặc từ khóa..."
              type="text"
            />
          </div>
        </div>
      </section>

      {/* ─── Contact Info Cards ─── */}
      <section className="px-6 pb-20 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {/* Phone */}
          <div className="group bg-muted/50 dark:bg-muted/10 border-border hover:border-ring/30 rounded-2xl border p-8 text-center transition-all duration-300 hover:shadow-lg lg:p-10">
            <div className="bg-ring/10 text-ring mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
              <Phone className="h-7 w-7" />
            </div>
            <h3 className="mb-2 font-serif text-xl font-bold">Điện thoại</h3>
            <p className="text-muted-foreground mb-4 text-sm">Đường dây nóng 24/7</p>
            <a
              href="tel:+842812345678"
              className="text-ring text-lg font-semibold underline-offset-4 hover:underline"
            >
              +84 28 1234 5678
            </a>
          </div>

          {/* Email */}
          <div className="group bg-muted/50 dark:bg-muted/10 border-border hover:border-ring/30 rounded-2xl border p-8 text-center transition-all duration-300 hover:shadow-lg lg:p-10">
            <div className="bg-ring/10 text-ring mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
              <Mail className="h-7 w-7" />
            </div>
            <h3 className="mb-2 font-serif text-xl font-bold">Email</h3>
            <p className="text-muted-foreground mb-4 text-sm">Phản hồi trong 2 giờ</p>
            <a
              href="mailto:concierge@continental.vn"
              className="text-ring text-lg font-semibold underline-offset-4 hover:underline"
            >
              concierge@continental.vn
            </a>
          </div>

          {/* Address */}
          <div className="group bg-muted/50 dark:bg-muted/10 border-border hover:border-ring/30 rounded-2xl border p-8 text-center transition-all duration-300 hover:shadow-lg lg:p-10">
            <div className="bg-ring/10 text-ring mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
              <MapPin className="h-7 w-7" />
            </div>
            <h3 className="mb-2 font-serif text-xl font-bold">Địa chỉ</h3>
            <p className="text-muted-foreground mb-4 text-sm">Trung tâm thành phố</p>
            <p className="text-ring text-lg font-semibold">Quận 1, TP. Hồ Chí Minh</p>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="px-6 py-20 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="text-ring mb-4 text-sm font-semibold tracking-[0.3em] uppercase">
            FAQ
          </p>
          <h2 className="font-serif text-3xl font-bold md:text-4xl lg:text-5xl">
            Câu hỏi thường gặp
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
          {/* ── Category: Đặt phòng ── */}
          <div id="booking" className="scroll-mt-32">
            <div className="mb-8 flex items-center gap-3">
              <div className="bg-ring/10 text-ring flex h-10 w-10 items-center justify-center rounded-xl">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <h3 className="text-ring font-serif text-2xl font-bold">Đặt phòng</h3>
            </div>
            <div className="space-y-4">
              <details className="group bg-muted/50 dark:bg-muted/10 border-border hover:border-ring/20 overflow-hidden rounded-2xl border transition-colors [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 select-none">
                  <h4 className="pr-4 text-base font-semibold lg:text-lg">
                    Làm thế nào để tôi thay đổi ngày đặt phòng?
                  </h4>
                  <ChevronDown className="text-ring h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-muted-foreground px-6 pb-6 text-[15px] leading-relaxed">
                  Bạn có thể thay đổi ngày đặt phòng bằng cách đăng nhập vào tài khoản của
                  mình hoặc liên hệ trực tiếp với bộ phận hỗ trợ khách hàng qua hotline.
                  Vui lòng lưu ý các điều khoản về thời hạn thay đổi tối thiểu 48 giờ
                  trước ngày nhận phòng.
                </div>
              </details>

              <details className="group bg-muted/50 dark:bg-muted/10 border-border hover:border-ring/20 overflow-hidden rounded-2xl border transition-colors [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 select-none">
                  <h4 className="pr-4 text-base font-semibold lg:text-lg">
                    Chính sách hủy phòng của khách sạn là gì?
                  </h4>
                  <ChevronDown className="text-ring h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-muted-foreground px-6 pb-6 text-[15px] leading-relaxed">
                  Đối với hầu hết các loại phòng, chúng tôi cho phép hủy miễn phí trước 72
                  giờ. Các trường hợp hủy muộn hoặc không đến nhận phòng có thể chịu phí
                  tương đương với đêm nghỉ đầu tiên. Chi tiết vui lòng xem trong xác nhận
                  đặt phòng của bạn.
                </div>
              </details>

              <details className="group bg-muted/50 dark:bg-muted/10 border-border hover:border-ring/20 overflow-hidden rounded-2xl border transition-colors [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 select-none">
                  <h4 className="pr-4 text-base font-semibold lg:text-lg">
                    Tôi có thể yêu cầu nhận phòng sớm không?
                  </h4>
                  <ChevronDown className="text-ring h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-muted-foreground px-6 pb-6 text-[15px] leading-relaxed">
                  Việc nhận phòng sớm tùy thuộc vào tình trạng phòng trống tại thời điểm
                  khách đến. Chúng tôi sẽ cố gắng hết sức để sắp xếp phòng cho quý khách
                  sớm nhất có thể.
                </div>
              </details>
            </div>
          </div>

          {/* ── Category: Thanh toán ── */}
          <div id="payment" className="scroll-mt-32">
            <div className="mb-8 flex items-center gap-3">
              <div className="bg-ring/10 text-ring flex h-10 w-10 items-center justify-center rounded-xl">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="text-ring font-serif text-2xl font-bold">Thanh toán</h3>
            </div>
            <div className="space-y-4">
              <details className="group bg-muted/50 dark:bg-muted/10 border-border hover:border-ring/20 overflow-hidden rounded-2xl border transition-colors [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 select-none">
                  <h4 className="pr-4 text-base font-semibold lg:text-lg">
                    Khách sạn chấp nhận những phương thức thanh toán nào?
                  </h4>
                  <ChevronDown className="text-ring h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-muted-foreground px-6 pb-6 text-[15px] leading-relaxed">
                  Chúng tôi chấp nhận tất cả các loại thẻ tín dụng phổ biến (Visa,
                  Mastercard, Amex), chuyển khoản ngân hàng, và các ví điện tử phổ biến
                  tại Việt Nam như MoMo và VNPAY.
                </div>
              </details>

              <details className="group bg-muted/50 dark:bg-muted/10 border-border hover:border-ring/20 overflow-hidden rounded-2xl border transition-colors [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 select-none">
                  <h4 className="pr-4 text-base font-semibold lg:text-lg">
                    Tôi có cần phải đặt cọc trước không?
                  </h4>
                  <ChevronDown className="text-ring h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-muted-foreground px-6 pb-6 text-[15px] leading-relaxed">
                  Tùy thuộc vào chương trình ưu đãi, một số gói phòng yêu cầu thanh toán
                  trước 100%. Đối với giá phòng tiêu chuẩn, bạn chỉ cần cung cấp thông tin
                  thẻ để đảm bảo và thanh toán khi nhận phòng.
                </div>
              </details>
            </div>
          </div>

          {/* ── Category: Dịch vụ khách sạn ── */}
          <div id="services" className="scroll-mt-32">
            <div className="mb-8 flex items-center gap-3">
              <div className="bg-ring/10 text-ring flex h-10 w-10 items-center justify-center rounded-xl">
                <ConciergeBell className="h-5 w-5" />
              </div>
              <h3 className="text-ring font-serif text-2xl font-bold">
                Dịch vụ khách sạn
              </h3>
            </div>
            <div className="space-y-4">
              <details className="group bg-muted/50 dark:bg-muted/10 border-border hover:border-ring/20 overflow-hidden rounded-2xl border transition-colors [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 select-none">
                  <h4 className="pr-4 text-base font-semibold lg:text-lg">
                    Khách sạn có dịch vụ đưa đón sân bay không?
                  </h4>
                  <ChevronDown className="text-ring h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-muted-foreground px-6 pb-6 text-[15px] leading-relaxed">
                  Có, chúng tôi cung cấp dịch vụ đưa đón sân bay bằng xe hạng sang. Vui
                  lòng cung cấp thông tin chuyến bay của bạn ít nhất 24 giờ trước khi đến
                  để chúng tôi sắp xếp chu đáo nhất.
                </div>
              </details>

              <details className="group bg-muted/50 dark:bg-muted/10 border-border hover:border-ring/20 overflow-hidden rounded-2xl border transition-colors [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 select-none">
                  <h4 className="pr-4 text-base font-semibold lg:text-lg">
                    Bữa sáng được phục vụ vào thời gian nào?
                  </h4>
                  <ChevronDown className="text-ring h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="text-muted-foreground px-6 pb-6 text-[15px] leading-relaxed">
                  Bữa sáng buffet được phục vụ tại nhà hàng L&apos;Avenue từ 6:30 sáng đến
                  10:30 sáng hàng ngày. Chúng tôi cũng cung cấp thực đơn bữa sáng tại
                  phòng 24/7.
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="px-6 pb-24 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="from-ring via-ring/90 to-ring/70 dark:from-ring dark:via-ring/80 dark:to-ring/60 relative overflow-hidden rounded-[2rem] bg-gradient-to-br p-12 md:p-16 lg:p-20">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/4 translate-y-1/3 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute top-0 right-0 h-full w-1/2 translate-x-20 skew-x-12 bg-gradient-to-l from-white/5 to-transparent" />

          <div className="relative z-10 flex flex-col items-center justify-between gap-10 lg:flex-row">
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-sm">
                <Clock className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white/90">Hỗ trợ 24/7</span>
              </div>
              <h2 className="mb-4 font-serif text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Vẫn chưa tìm thấy câu trả lời?
              </h2>
              <p className="max-w-lg text-lg leading-relaxed text-white/80">
                Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7 qua điện thoại
                hoặc tin nhắn trực tuyến.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button className="text-ring cursor-pointer rounded-full bg-white px-8 py-4 text-lg font-bold shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                Gửi tin nhắn ngay
              </button>
              <button className="cursor-pointer rounded-full border border-white/25 bg-white/15 px-8 py-4 text-lg font-bold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/25">
                Gọi trực tiếp
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
