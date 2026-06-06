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
    <main className="bg-background min-h-screen text-foreground font-sans">
      {/* ─── Hero Section ─── */}
      <section className="pt-20">
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-24 md:py-32 text-center">
          <p className="uppercase tracking-[0.3em] text-ring text-sm font-semibold mb-6">
            Trung tâm hỗ trợ
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight font-bold">
            Chúng tôi có thể giúp gì cho bạn?
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12 text-lg md:text-xl leading-relaxed">
            Tìm kiếm câu trả lời nhanh chóng cho các thắc mắc phổ biến về kỳ
            nghỉ của bạn tại Continental Grand.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-ring">
              <Search className="w-6 h-6" />
            </div>
            <input
              className="w-full bg-muted border border-border rounded-full py-5 pl-16 pr-8 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30 focus:border-ring/40 transition-all shadow-sm outline-none text-lg"
              placeholder="Nhập câu hỏi hoặc từ khóa..."
              type="text"
            />
          </div>
        </div>
      </section>

      {/* ─── Contact Info Cards ─── */}
      <section className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Phone */}
          <div className="group bg-muted/50 dark:bg-muted/10 border border-border rounded-2xl p-8 lg:p-10 text-center hover:border-ring/30 hover:shadow-lg transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ring/10 text-ring mb-6 group-hover:scale-110 transition-transform duration-300">
              <Phone className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Điện thoại</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Đường dây nóng 24/7
            </p>
            <a
              href="tel:+842812345678"
              className="text-ring font-semibold text-lg hover:underline underline-offset-4"
            >
              +84 28 1234 5678
            </a>
          </div>

          {/* Email */}
          <div className="group bg-muted/50 dark:bg-muted/10 border border-border rounded-2xl p-8 lg:p-10 text-center hover:border-ring/30 hover:shadow-lg transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ring/10 text-ring mb-6 group-hover:scale-110 transition-transform duration-300">
              <Mail className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Email</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Phản hồi trong 2 giờ
            </p>
            <a
              href="mailto:concierge@continental.vn"
              className="text-ring font-semibold text-lg hover:underline underline-offset-4"
            >
              concierge@continental.vn
            </a>
          </div>

          {/* Address */}
          <div className="group bg-muted/50 dark:bg-muted/10 border border-border rounded-2xl p-8 lg:p-10 text-center hover:border-ring/30 hover:shadow-lg transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ring/10 text-ring mb-6 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Địa chỉ</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Trung tâm thành phố
            </p>
            <p className="text-ring font-semibold text-lg">
              Quận 1, TP. Hồ Chí Minh
            </p>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-20">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="uppercase tracking-[0.3em] text-ring text-sm font-semibold mb-4">
            FAQ
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold">
            Câu hỏi thường gặp
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          {/* ── Category: Đặt phòng ── */}
          <div id="booking" className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ring/10 text-ring">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-ring">
                Đặt phòng
              </h3>
            </div>
            <div className="space-y-4">
              <details className="group bg-muted/50 dark:bg-muted/10 border border-border rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden hover:border-ring/20 transition-colors">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                  <h4 className="font-semibold text-base lg:text-lg pr-4">
                    Làm thế nào để tôi thay đổi ngày đặt phòng?
                  </h4>
                  <ChevronDown className="text-ring transition-transform duration-300 group-open:rotate-180 w-5 h-5 shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed text-[15px]">
                  Bạn có thể thay đổi ngày đặt phòng bằng cách đăng nhập vào
                  tài khoản của mình hoặc liên hệ trực tiếp với bộ phận hỗ trợ
                  khách hàng qua hotline. Vui lòng lưu ý các điều khoản về thời
                  hạn thay đổi tối thiểu 48 giờ trước ngày nhận phòng.
                </div>
              </details>

              <details className="group bg-muted/50 dark:bg-muted/10 border border-border rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden hover:border-ring/20 transition-colors">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                  <h4 className="font-semibold text-base lg:text-lg pr-4">
                    Chính sách hủy phòng của khách sạn là gì?
                  </h4>
                  <ChevronDown className="text-ring transition-transform duration-300 group-open:rotate-180 w-5 h-5 shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed text-[15px]">
                  Đối với hầu hết các loại phòng, chúng tôi cho phép hủy miễn
                  phí trước 72 giờ. Các trường hợp hủy muộn hoặc không đến nhận
                  phòng có thể chịu phí tương đương với đêm nghỉ đầu tiên. Chi
                  tiết vui lòng xem trong xác nhận đặt phòng của bạn.
                </div>
              </details>

              <details className="group bg-muted/50 dark:bg-muted/10 border border-border rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden hover:border-ring/20 transition-colors">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                  <h4 className="font-semibold text-base lg:text-lg pr-4">
                    Tôi có thể yêu cầu nhận phòng sớm không?
                  </h4>
                  <ChevronDown className="text-ring transition-transform duration-300 group-open:rotate-180 w-5 h-5 shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed text-[15px]">
                  Việc nhận phòng sớm tùy thuộc vào tình trạng phòng trống tại
                  thời điểm khách đến. Chúng tôi sẽ cố gắng hết sức để sắp xếp
                  phòng cho quý khách sớm nhất có thể.
                </div>
              </details>
            </div>
          </div>

          {/* ── Category: Thanh toán ── */}
          <div id="payment" className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ring/10 text-ring">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-ring">
                Thanh toán
              </h3>
            </div>
            <div className="space-y-4">
              <details className="group bg-muted/50 dark:bg-muted/10 border border-border rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden hover:border-ring/20 transition-colors">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                  <h4 className="font-semibold text-base lg:text-lg pr-4">
                    Khách sạn chấp nhận những phương thức thanh toán nào?
                  </h4>
                  <ChevronDown className="text-ring transition-transform duration-300 group-open:rotate-180 w-5 h-5 shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed text-[15px]">
                  Chúng tôi chấp nhận tất cả các loại thẻ tín dụng phổ biến
                  (Visa, Mastercard, Amex), chuyển khoản ngân hàng, và các ví
                  điện tử phổ biến tại Việt Nam như MoMo và VNPAY.
                </div>
              </details>

              <details className="group bg-muted/50 dark:bg-muted/10 border border-border rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden hover:border-ring/20 transition-colors">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                  <h4 className="font-semibold text-base lg:text-lg pr-4">
                    Tôi có cần phải đặt cọc trước không?
                  </h4>
                  <ChevronDown className="text-ring transition-transform duration-300 group-open:rotate-180 w-5 h-5 shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed text-[15px]">
                  Tùy thuộc vào chương trình ưu đãi, một số gói phòng yêu cầu
                  thanh toán trước 100%. Đối với giá phòng tiêu chuẩn, bạn chỉ
                  cần cung cấp thông tin thẻ để đảm bảo và thanh toán khi nhận
                  phòng.
                </div>
              </details>
            </div>
          </div>

          {/* ── Category: Dịch vụ khách sạn ── */}
          <div id="services" className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ring/10 text-ring">
                <ConciergeBell className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-ring">
                Dịch vụ khách sạn
              </h3>
            </div>
            <div className="space-y-4">
              <details className="group bg-muted/50 dark:bg-muted/10 border border-border rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden hover:border-ring/20 transition-colors">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                  <h4 className="font-semibold text-base lg:text-lg pr-4">
                    Khách sạn có dịch vụ đưa đón sân bay không?
                  </h4>
                  <ChevronDown className="text-ring transition-transform duration-300 group-open:rotate-180 w-5 h-5 shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed text-[15px]">
                  Có, chúng tôi cung cấp dịch vụ đưa đón sân bay bằng xe hạng
                  sang. Vui lòng cung cấp thông tin chuyến bay của bạn ít nhất
                  24 giờ trước khi đến để chúng tôi sắp xếp chu đáo nhất.
                </div>
              </details>

              <details className="group bg-muted/50 dark:bg-muted/10 border border-border rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden hover:border-ring/20 transition-colors">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                  <h4 className="font-semibold text-base lg:text-lg pr-4">
                    Bữa sáng được phục vụ vào thời gian nào?
                  </h4>
                  <ChevronDown className="text-ring transition-transform duration-300 group-open:rotate-180 w-5 h-5 shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed text-[15px]">
                  Bữa sáng buffet được phục vụ tại nhà hàng L&apos;Avenue từ
                  6:30 sáng đến 10:30 sáng hàng ngày. Chúng tôi cũng cung cấp
                  thực đơn bữa sáng tại phòng 24/7.
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 pb-24">
        <div className="bg-gradient-to-br from-ring via-ring/90 to-ring/70 dark:from-ring dark:via-ring/80 dark:to-ring/60 p-12 md:p-16 lg:p-20 rounded-[2rem] relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-12 translate-x-20" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-white/90 text-sm font-medium">
                  Hỗ trợ 24/7
                </span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-4 font-bold">
                Vẫn chưa tìm thấy câu trả lời?
              </h2>
              <p className="text-white/80 text-lg max-w-lg leading-relaxed">
                Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7
                qua điện thoại hoặc tin nhắn trực tuyến.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-ring px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg cursor-pointer">
                Gửi tin nhắn ngay
              </button>
              <button className="bg-white/15 text-white backdrop-blur-md border border-white/25 px-8 py-4 rounded-full font-bold hover:bg-white/25 transition-all duration-300 text-lg cursor-pointer">
                Gọi trực tiếp
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}