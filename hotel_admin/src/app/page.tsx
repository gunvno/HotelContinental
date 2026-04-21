import {
  Activity,
  BedDouble,
  CalendarCheck,
  CircleDollarSign,
  ClipboardCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const metrics = [
  {
    label: "Doanh thu hôm nay",
    value: "45.2M",
    detail: "+12.4% so với hôm qua",
    icon: CircleDollarSign,
    tone: "from-[#9b5c24] to-[#d9a25f]",
  },
  {
    label: "Phòng còn trống",
    value: "18",
    detail: "6 phòng sẵn sàng check-in",
    icon: BedDouble,
    tone: "from-[#164e63] to-[#22d3ee]",
  },
  {
    label: "Booking mới",
    value: "27",
    detail: "9 booking chờ xác nhận",
    icon: CalendarCheck,
    tone: "from-[#365314] to-[#84cc16]",
  },
  {
    label: "Khách đang lưu trú",
    value: "83",
    detail: "14 khách checkout hôm nay",
    icon: Users,
    tone: "from-[#7c2d12] to-[#fb923c]",
  },
];

const operations = [
  { label: "Xác nhận booking", value: "9", status: "Cần xử lý trong 30 phút" },
  { label: "Phòng cần dọn", value: "12", status: "Ưu tiên tầng 4 và tầng 7" },
  { label: "Yêu cầu dịch vụ", value: "6", status: "Spa, đưa đón, minibar" },
  { label: "Hồ sơ khách thiếu thông tin", value: "4", status: "Cần bổ sung giấy tờ" },
];

const recentActivities = [
  { guest: "Nguyễn Minh Anh", action: "đặt Deluxe City View", amount: "+4.200.000 VND", time: "08:40" },
  { guest: "Trần Quốc Bảo", action: "check-in Suite Ocean", amount: "+9.600.000 VND", time: "09:15" },
  { guest: "Lê Thu Hà", action: "thêm dịch vụ đưa đón", amount: "+650.000 VND", time: "10:05" },
  { guest: "Phạm Hoàng Long", action: "hủy Standard Twin", amount: "Hoàn tiền", time: "10:32" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#decdb9] bg-[#23170f] p-6 text-white shadow-[0_30px_80px_-50px_rgba(35,23,15,0.9)] dark:border-[#3a2e24] lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(232,201,144,0.35),transparent_28%),radial-gradient(circle_at_88%_0%,rgba(255,255,255,0.14),transparent_24%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e8c990]">
              Daily command center
            </p>
            <h2 className="mt-3 max-w-3xl font-[var(--font-cormorant)] text-5xl font-bold leading-[0.95] tracking-tight lg:text-7xl">
              Điều hành khách sạn trong một màn hình.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-[#eadbc4]">
              Dashboard này nên ưu tiên nghiệp vụ vận hành: booking cần xử lý, phòng trống,
              trạng thái dọn phòng, khách đang lưu trú và doanh thu trong ngày.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#e8c990] p-3 text-[#23170f]">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Tình trạng hôm nay</p>
                <p className="text-xs text-[#d9bf9a]">Mock data, chờ tích hợp booking-service</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/[0.08] p-3">
                <p className="text-2xl font-bold">72%</p>
                <p className="text-[11px] text-[#d9bf9a]">Công suất</p>
              </div>
              <div className="rounded-2xl bg-white/[0.08] p-3">
                <p className="text-2xl font-bold">4.7</p>
                <p className="text-[11px] text-[#d9bf9a]">Đánh giá</p>
              </div>
              <div className="rounded-2xl bg-white/[0.08] p-3">
                <p className="text-2xl font-bold">11</p>
                <p className="text-[11px] text-[#d9bf9a]">Việc gấp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="group overflow-hidden rounded-[1.5rem] border border-[#decdb9] bg-white/72 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl dark:border-[#3a2e24] dark:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#75695d] dark:text-[#b7a99a]">{metric.label}</p>
                  <p className="mt-3 text-4xl font-black tracking-tight">{metric.value}</p>
                </div>
                <div className={`rounded-2xl bg-gradient-to-br ${metric.tone} p-3 text-white shadow-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#5f7f24] dark:text-[#a8d86b]">
                <TrendingUp className="h-3.5 w-3.5" />
                {metric.detail}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-[#decdb9] bg-white/72 p-6 shadow-sm backdrop-blur dark:border-[#3a2e24] dark:bg-white/[0.05]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-[var(--font-cormorant)] text-3xl font-bold">Việc cần làm</h3>
              <p className="text-sm text-[#75695d] dark:text-[#b7a99a]">Các tác vụ ảnh hưởng trực tiếp tới vận hành.</p>
            </div>
            <ClipboardCheck className="h-6 w-6 text-[#9b5c24] dark:text-[#d7a25f]" />
          </div>
          <div className="mt-5 space-y-3">
            {operations.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#eadfcd] bg-[#fbf7ef] p-4 dark:border-[#3a2e24] dark:bg-[#17130f]">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold">{item.label}</p>
                  <span className="rounded-full bg-[#23170f] px-3 py-1 text-sm font-black text-white dark:bg-[#e8c990] dark:text-[#23170f]">
                    {item.value}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#75695d] dark:text-[#b7a99a]">{item.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[#decdb9] bg-white/72 p-6 shadow-sm backdrop-blur dark:border-[#3a2e24] dark:bg-white/[0.05]">
          <div>
            <h3 className="font-[var(--font-cormorant)] text-3xl font-bold">Doanh thu 7 ngày</h3>
            <p className="text-sm text-[#75695d] dark:text-[#b7a99a]">Placeholder trực quan, nên thay bằng dữ liệu từ billing/report-service.</p>
          </div>
          <div className="mt-8 flex h-72 items-end gap-3 rounded-[1.5rem] border border-[#eadfcd] bg-[#fbf7ef] p-5 dark:border-[#3a2e24] dark:bg-[#17130f]">
            {[42, 58, 49, 76, 62, 88, 71].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-3">
                <div
                  className="w-full rounded-t-2xl bg-gradient-to-t from-[#9b5c24] to-[#e8c990] shadow-[0_18px_35px_-28px_rgba(155,92,36,0.9)]"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs font-bold text-[#75695d] dark:text-[#b7a99a]">T{index + 2}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[#decdb9] bg-white/72 p-6 shadow-sm backdrop-blur dark:border-[#3a2e24] dark:bg-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#eadfcd] p-3 text-[#9b5c24] dark:bg-[#2a211a] dark:text-[#d7a25f]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-[var(--font-cormorant)] text-3xl font-bold">Hoạt động mới</h3>
              <p className="text-sm text-[#75695d] dark:text-[#b7a99a]">Booking và dịch vụ gần nhất.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {recentActivities.map((activity) => (
              <div key={`${activity.guest}-${activity.time}`} className="border-b border-[#eadfcd] pb-4 last:border-b-0 dark:border-[#3a2e24]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{activity.guest}</p>
                    <p className="text-sm text-[#75695d] dark:text-[#b7a99a]">{activity.action}</p>
                  </div>
                  <span className="text-xs font-bold text-[#9b5c24] dark:text-[#d7a25f]">{activity.time}</span>
                </div>
                <p className="mt-2 text-sm font-black">{activity.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
