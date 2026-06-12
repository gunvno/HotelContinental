"use client";

import {
  Bath,
  BedDouble,
  Calendar,
  CalendarOff,
  Coffee,
  Eye,
  MapPin,
  Ruler,
  Shirt,
  Tv,
  Users,
  Wifi,
  Wine,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getRoomDetail, type RoomDetailData } from "@/services/room-service";
import { useAuthStore } from "@/store/auth-store";

function getFeatureIcon(iconType: string) {
  switch (iconType) {
    case "area":
      return <Ruler className="h-6 w-6 text-[#865316]" />;
    case "users":
      return <Users className="h-6 w-6 text-[#865316]" />;
    case "bed":
      return <BedDouble className="h-6 w-6 text-[#865316]" />;
    case "view":
      return <Eye className="h-6 w-6 text-[#865316]" />;
    default:
      return <Ruler className="h-6 w-6 text-[#865316]" />;
  }
}

function getAmenityIcon(iconType: string) {
  switch (iconType) {
    case "wifi":
      return <Wifi className="h-8 w-8 text-[#865316]" />;
    case "mini-bar":
      return <Wine className="h-8 w-8 text-[#865316]" />;
    case "bath":
      return <Bath className="h-8 w-8 text-[#865316]" />;
    case "coffee":
      return <Coffee className="h-8 w-8 text-[#865316]" />;
    case "butler":
      return <Shirt className="h-8 w-8 text-[#865316]" />;
    case "tv":
      return <Tv className="h-8 w-8 text-[#865316]" />;
    default:
      return <Wifi className="h-8 w-8 text-[#865316]" />;
  }
}

export default function RoomDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params?.id as string;
  const token = useAuthStore((state) => state.token);
  const [roomData, setRoomData] = useState<RoomDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const checkIn = searchParams.get("checkIn") || "2026-06-15";
  const checkOut = searchParams.get("checkOut") || "2026-06-18";
  const guests = Number(searchParams.get("guests") || 2);
  const stayType = searchParams.get("stayType") || "night";
  const checkInTime = searchParams.get("checkInTime") || "14:00";
  const stayHours = Number(searchParams.get("stayHours") || 3);

  useEffect(() => {
    async function loadRoomDetail() {
      try {
        setIsLoading(true);
        const data = await getRoomDetail(roomId);
        if (!data) {
          setError("Không tìm thấy thông tin phòng");
          return;
        }
        setRoomData(data);
      } catch (err) {
        setError("Lỗi khi tải thông tin phòng");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    if (roomId) loadRoomDetail();
  }, [roomId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#fdf9f4] pt-32 pb-24">
        <section className="mx-auto w-full max-w-screen-2xl px-6 md:px-12">
          <div className="animate-pulse space-y-10">
            <div className="h-48 rounded-2xl bg-[#ebe8e3]" />
            <div className="h-64 rounded-2xl bg-[#ebe8e3]" />
            <div className="h-[600px] rounded-2xl bg-[#ebe8e3]" />
          </div>
        </section>
      </main>
    );
  }

  function buildBookingHref({
    roomId,
    roomTitle,
    pricePerNight,
    checkIn,
    checkOut,
    guests,
    stayType,
    checkInTime,
    stayHours,
    token,
  }: {
    roomId: string;
    roomTitle: string;
    pricePerNight: number;
    checkIn: string;
    checkOut: string;
    guests: number;
    stayType: string;
    checkInTime: string;
    stayHours: number;
    token: string | null;
  }) {
    const paymentParams = new URLSearchParams({
      roomId,
      roomTitle,
      pricePerNight: String(pricePerNight),
      checkIn,
      checkOut,
      guests: String(guests),
      stayType,
      checkInTime,
      stayHours: String(stayHours),
    });
    const paymentHref = `/payment?${paymentParams.toString()}`;
    return token ? paymentHref : `/login?redirect=${encodeURIComponent(paymentHref)}`;
  }

  function calculateNightCount(checkIn: string, checkOut: string) {
    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  function formatDate(value: string) {
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  if (error || !roomData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fdf9f4] pt-32">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1c1c19]">
            {error || "Không tìm thấy phòng"}
          </h1>
          <p className="mt-2 text-[#514439]">Vui lòng quay lại và chọn phòng khác.</p>
        </div>
      </main>
    );
  }

  const {
    label,
    title,
    description,
    location,
    pricePerNight,
    galleryImages,
    featureSpecs,
    amenities,
    addOnServices,
    roomDescription,
  } = roomData;
  const nightCount = stayType === "night" ? calculateNightCount(checkIn, checkOut) : 0;
  const roomSubtotal =
    stayType === "hour"
      ? Math.round((pricePerNight / 8) * stayHours)
      : pricePerNight * nightCount;
  const serviceFee = Math.round(roomSubtotal * 0.1);
  const totalPrice = roomSubtotal + serviceFee;
  const stayLabel = stayType === "hour" ? `${stayHours} giờ` : `${nightCount} đêm`;
  const bookingHref = buildBookingHref({
    roomId: roomData.id,
    roomTitle: title,
    pricePerNight,
    checkIn,
    checkOut,
    guests,
    stayType,
    checkInTime,
    stayHours,
    token,
  });

  return (
    <main className="mx-auto min-h-screen max-w-screen-2xl bg-[#fdf9f4] px-6 pt-32 pb-24 font-sans text-[#1c1c19] selection:bg-[#865316]/20 md:px-12">
      {/* Hero Section */}
      <div className="mb-20 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <span className="mb-4 inline-block rounded-full bg-[#80f6ec]/30 px-4 py-1 text-[10px] font-bold tracking-widest text-[#00716b] uppercase sm:text-xs">
            {label}
          </span>
          <h1 className="mb-6 font-serif text-5xl leading-tight font-bold text-[#1c1c19] md:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed font-light text-[#514439] sm:text-xl">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="flex items-center gap-2 font-medium text-[#865316]">
            <MapPin className="text-3xl" />
            <span className="text-lg">{location}</span>
          </div>
          <div className="font-serif text-3xl font-bold text-[#1c1c19] sm:text-4xl">
            {pricePerNight.toLocaleString("vi-VN")} VNĐ{" "}
            <span className="font-sans text-base font-normal text-[#514439]">/ đêm</span>
          </div>
        </div>
      </div>

      {/* Gallery Bento Grid */}
      <section className="mb-24">
        <div className="grid h-[400px] grid-cols-1 grid-rows-2 gap-4 sm:h-[500px] md:h-[600px] md:grid-cols-4">
          <div className="group relative overflow-hidden rounded-xl md:col-span-2 md:row-span-2">
            <img
              src={galleryImages.main}
              alt="Main room view"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c19]/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
          </div>
          <div className="group relative hidden h-[200px] overflow-hidden rounded-xl sm:block sm:h-[250px] md:col-span-2 md:row-span-1 md:h-auto">
            <img
              src={galleryImages.topRight}
              alt="Secondary view"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="group relative hidden h-[200px] overflow-hidden rounded-xl sm:h-[250px] md:block md:h-auto">
            <img
              src={galleryImages.bottomLeft}
              alt="Detail view"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="group relative hidden h-[200px] overflow-hidden rounded-xl sm:h-[250px] md:block md:h-auto">
            <img
              src={galleryImages.bottomRight}
              alt="Bathroom view"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* Details & Booking Sticky Bar */}
      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
        <div className="space-y-16 lg:col-span-8">
          {/* Key Specifications */}
          <div className="grid grid-cols-2 gap-8 border-y border-[#d6c3b4]/20 py-8">
            {featureSpecs.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <span className="text-[10px] font-bold tracking-widest text-[#514439] uppercase sm:text-xs">
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  {getFeatureIcon(item.iconType)}
                  <span className="text-xl font-medium">{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Description Section */}
          <section>
            <h3 className="mb-6 font-serif text-3xl font-bold italic">
              Tuyệt tác không gian nghỉ dưỡng
            </h3>
            <div className="prose prose-lg max-w-none leading-relaxed font-light text-[#514439]">
              <p>{roomDescription}</p>
            </div>
          </section>

          {/* Amenities Bento */}
          {amenities.length > 0 ? (
            <section>
              <h3 className="mb-8 font-serif text-2xl font-bold">
                Tiện nghi trong phòng
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {amenities.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-4 rounded-xl bg-[#f7f3ee] p-6 transition-colors hover:bg-[#ebe8e3]"
                  >
                    {getAmenityIcon(item.icon)}
                    <div>
                      <h4 className="mb-1 font-bold">{item.title}</h4>
                      <p className="text-sm text-[#514439]">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {addOnServices.length > 0 ? (
            <section>
              <h3 className="mb-8 font-serif text-2xl font-bold">Dịch vụ bổ sung</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {addOnServices.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-4 rounded-xl bg-[#f7f3ee] p-6 transition-colors hover:bg-[#ebe8e3]"
                  >
                    {getAmenityIcon(item.icon)}
                    <div>
                      <h4 className="mb-1 font-bold">{item.title}</h4>
                      <p className="text-sm text-[#514439]">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* Booking Card (Sticky) */}
        <aside className="sticky top-32 lg:col-span-4">
          <div className="rounded-2xl border border-[#d6c3b4]/10 bg-[#ffffff] p-6 shadow-[0_20px_40px_rgba(28,28,25,0.06)] lg:p-8">
            <div className="mb-7">
              <p className="mb-2 text-[11px] font-bold tracking-[0.22em] text-[#865316] uppercase">
                Đặt phòng
              </p>
              <h3 className="font-serif text-2xl font-bold">Thông tin lưu trú</h3>
              <p className="mt-2 text-sm text-[#514439]">
                Phòng đã được lọc theo thời gian bạn chọn. Xác nhận thông tin trước khi
                thanh toán.
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#f7f3ee] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-widest text-[#514439] uppercase">
                      Nhận phòng
                    </span>
                    <Calendar className="h-4 w-4 text-[#865316]" />
                  </div>
                  <p className="text-sm font-semibold text-[#1c1c19]">
                    {formatDate(checkIn)}
                  </p>
                  <p className="mt-1 text-xs text-[#514439]">
                    {stayType === "hour" ? checkInTime : "14:00"}
                  </p>
                </div>

                <div className="rounded-xl bg-[#f7f3ee] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-widest text-[#514439] uppercase">
                      {stayType === "hour" ? "Thời lượng" : "Trả phòng"}
                    </span>
                    <CalendarOff className="h-4 w-4 text-[#865316]" />
                  </div>
                  <p className="text-sm font-semibold text-[#1c1c19]">
                    {stayType === "hour" ? stayLabel : formatDate(checkOut)}
                  </p>
                  <p className="mt-1 text-xs text-[#514439]">
                    {stayType === "hour" ? "Theo giờ" : "12:00"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#d6c3b4]/30 px-4 py-3">
                <div>
                  <p className="text-[11px] font-bold tracking-widest text-[#514439] uppercase">
                    Số lượng khách
                  </p>
                  <p className="mt-1 text-sm font-semibold">{guests} Người lớn</p>
                </div>
                <Users className="h-5 w-5 text-[#865316]" />
              </div>

              <Link
                href="/room/listroom"
                className="block text-sm font-semibold text-[#865316] hover:underline"
              >
                Thay đổi ngày hoặc số khách
              </Link>

              <div className="space-y-3 border-t border-[#d6c3b4]/20 pt-5">
                <div className="flex justify-between text-sm text-[#514439] sm:text-base">
                  <span>Giá phòng ({stayLabel})</span>
                  <span>{roomSubtotal.toLocaleString("vi-VN")} VNĐ</span>
                </div>
                <div className="flex justify-between text-sm text-[#514439] sm:text-base">
                  <span>Phí dịch vụ & Thuế (10%)</span>
                  <span>{serviceFee.toLocaleString("vi-VN")} VNĐ</span>
                </div>
                <div className="flex justify-between pt-4 text-lg font-bold sm:text-xl">
                  <span>Tổng cộng</span>
                  <span className="text-[#865316]">
                    {totalPrice.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>

              <Link
                href={bookingHref}
                className="block w-full rounded-full bg-gradient-to-r from-[#865316] to-[#c68948] py-5 text-center text-lg font-bold text-white shadow-xl shadow-[#865316]/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                Đặt phòng ngay
              </Link>
              <p className="text-center text-xs text-[#514439] italic">
                Không thu phí hủy phòng trước 48 giờ.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Floating Booking Bar (Mobile Only) */}
      <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-[#d6c3b4]/20 bg-white/90 p-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[#514439]">Bắt đầu từ</div>
            <div className="font-bold text-[#865316]">
              {pricePerNight.toLocaleString("vi-VN")} VNĐ
            </div>
          </div>
          <Link
            href={bookingHref}
            className="rounded-full bg-[#865316] px-6 py-3 text-sm font-bold text-white shadow-lg sm:px-8 sm:text-base"
          >
            Đặt ngay
          </Link>
        </div>
      </div>
    </main>
  );
}
