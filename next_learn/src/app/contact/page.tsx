import { CalendarCheck, ChevronDown, ConciergeBell, CreditCard, Search } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="pt-32 pb-24 bg-background min-h-screen text-foreground font-sans">
      {/* Hero Section & Search */}
      <section className="max-w-screen-xl mx-auto px-8 mb-20 text-center">
        <h1 className="font-serif text-5xl md:text-6xl mb-6 leading-tight font-bold">
          Chúng tôi có thể giúp gì cho bạn?
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-12 text-lg">
          Tìm kiếm câu trả lời nhanh chóng cho các thắc mắc phổ biến về kỳ nghỉ của bạn tại Continental Grand.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-ring">
            <Search className="w-6 h-6" />
          </div>
          <input
            className="w-full bg-muted border-none rounded-full py-5 pl-16 pr-8 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/20 transition-all shadow-sm outline-none"
            placeholder="Nhập câu hỏi hoặc từ khóa..."
            type="text"
          />
        </div>
      </section>

      {/* FAQ Content */}
      <section className="max-w-screen-lg mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-3 space-y-4 hidden md:block">
            <div className="sticky top-28">
              <h3 className="font-serif font-bold text-xl mb-6">Chuyên mục</h3>
              <nav className="flex flex-col space-y-2">
                <a href="#booking" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-ring/10 text-ring font-semibold transition-all">
                  <CalendarCheck className="w-5 h-5" />
                  <span>Đặt phòng</span>
                </a>
                <a href="#payment" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted transition-all">
                  <CreditCard className="w-5 h-5" />
                  <span>Thanh toán</span>
                </a>
                <a href="#services" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted transition-all">
                  <ConciergeBell className="w-5 h-5" />
                  <span>Dịch vụ</span>
                </a>
              </nav>
            </div>
          </aside>

          {/* FAQ Accordions */}
          <div className="md:col-span-9 space-y-12">
            {/* Category: Đặt phòng */}
            <div id="booking" className="scroll-mt-32">
              <h2 className="font-serif text-2xl font-bold mb-8 flex items-center text-ring">
                <span className="w-8 h-[1px] bg-ring mr-4"></span>
                Đặt phòng
              </h2>
              <div className="space-y-4">
                <details className="group bg-muted rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                    <h4 className="font-semibold text-lg">Làm thế nào để tôi thay đổi ngày đặt phòng?</h4>
                    <ChevronDown className="text-ring transition-transform duration-300 group-open:rotate-180 w-6 h-6" />
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed relative top-[-8px]">
                    Bạn có thể thay đổi ngày đặt phòng bằng cách đăng nhập vào tài khoản của mình hoặc liên hệ trực tiếp với bộ phận hỗ trợ khách hàng qua hotline. Vui lòng lưu ý các điều khoản về thời hạn thay đổi tối thiểu 48 giờ trước ngày nhận phòng.
                  </div>
                </details>

                <details className="group bg-muted rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                    <h4 className="font-semibold text-lg">Chính sách hủy phòng của khách sạn là gì?</h4>
                    <ChevronDown className="text-ring transition-transform duration-300 group-open:rotate-180 w-6 h-6" />
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed relative top-[-8px]">
                    Đối với hầu hết các loại phòng, chúng tôi cho phép hủy miễn phí trước 72 giờ. Các trường hợp hủy muộn hoặc không đến nhận phòng có thể chịu phí tương đương với đêm nghỉ đầu tiên. Chi tiết vui lòng xem trong xác nhận đặt phòng của bạn.
                  </div>
                </details>

                <details className="group bg-muted rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                    <h4 className="font-semibold text-lg">Tôi có thể yêu cầu nhận phòng sớm không?</h4>
                    <ChevronDown className="text-ring transition-transform duration-300 group-open:rotate-180 w-6 h-6" />
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed relative top-[-8px]">
                    Việc nhận phòng sớm tùy thuộc vào tình trạng phòng trống tại thời điểm khách đến. Chúng tôi sẽ cố gắng hết sức để sắp xếp phòng cho quý khách sớm nhất có thể.
                  </div>
                </details>
              </div>
            </div>

            {/* Category: Thanh toán */}
            <div id="payment" className="scroll-mt-32">
              <h2 className="font-serif text-2xl font-bold mb-8 flex items-center text-ring">
                <span className="w-8 h-[1px] bg-ring mr-4"></span>
                Thanh toán
              </h2>
              <div className="space-y-4">
                <details className="group bg-muted rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                    <h4 className="font-semibold text-lg">Khách sạn chấp nhận những phương thức thanh toán nào?</h4>
                    <ChevronDown className="text-ring transition-transform duration-300 group-open:rotate-180 w-6 h-6" />
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed relative top-[-8px]">
                    Chúng tôi chấp nhận tất cả các loại thẻ tín dụng phổ biến (Visa, Mastercard, Amex), chuyển khoản ngân hàng, và các ví điện tử phổ biến tại Việt Nam như MoMo và VNPAY.
                  </div>
                </details>

                <details className="group bg-muted rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                    <h4 className="font-semibold text-lg">Tôi có cần phải đặt cọc trước không?</h4>
                    <ChevronDown className="text-ring transition-transform duration-300 group-open:rotate-180 w-6 h-6" />
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed relative top-[-8px]">
                    Tùy thuộc vào chương trình ưu đãi, một số gói phòng yêu cầu thanh toán trước 100%. Đối với giá phòng tiêu chuẩn, bạn chỉ cần cung cấp thông tin thẻ để đảm bảo và thanh toán khi nhận phòng.
                  </div>
                </details>
              </div>
            </div>

            {/* Category: Dịch vụ khách sạn */}
            <div id="services" className="scroll-mt-32">
              <h2 className="font-serif text-2xl font-bold mb-8 flex items-center text-ring">
                <span className="w-8 h-[1px] bg-ring mr-4"></span>
                Dịch vụ khách sạn
              </h2>
              <div className="space-y-4">
                <details className="group bg-muted rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                    <h4 className="font-semibold text-lg">Khách sạn có dịch vụ đưa đón sân bay không?</h4>
                    <ChevronDown className="text-ring transition-transform duration-300 group-open:rotate-180 w-6 h-6" />
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed relative top-[-8px]">
                    Có, chúng tôi cung cấp dịch vụ đưa đón sân bay bằng xe hạng sang. Vui lòng cung cấp thông tin chuyến bay của bạn ít nhất 24 giờ trước khi đến để chúng tôi sắp xếp chu đáo nhất.
                  </div>
                </details>

                <details className="group bg-muted rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                    <h4 className="font-semibold text-lg">Bữa sáng được phục vụ vào thời gian nào?</h4>
                    <ChevronDown className="text-ring transition-transform duration-300 group-open:rotate-180 w-6 h-6" />
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed relative top-[-8px]">
                    Bữa sáng buffet được phục vụ tại nhà hàng L'Avenue từ 6:30 sáng đến 10:30 sáng hàng ngày. Chúng tôi cũng cung cấp thực đơn bữa sáng tại phòng 24/7.
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-screen-xl mx-auto px-8 mt-24">
        <div className="bg-[#006a64] p-12 md:p-20 rounded-[2.5rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="relative z-10 text-center md:text-left">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Vẫn chưa tìm thấy câu trả lời?</h2>
            <p className="text-white/80 text-lg max-w-md">Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7 qua điện thoại hoặc tin nhắn trực tuyến.</p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4">
            <button className="bg-white text-[#006a64] px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-transform">
              Gửi tin nhắn ngay
            </button>
            <button className="bg-[#80f6ec]/20 text-white backdrop-blur-md border border-white/20 px-8 py-4 rounded-full font-bold hover:bg-[#80f6ec]/30 transition-all">
              Gọi trực tiếp
            </button>
          </div>
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-12 transform translate-x-20"></div>
        </div>
      </section>
    </main>
  );
}