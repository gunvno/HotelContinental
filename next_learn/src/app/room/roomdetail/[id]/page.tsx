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
  Star,
  Tv,
  Users,
  Wifi,
  Wine,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getRoomDetail, type RoomDetailData } from "@/services/room-service";
import {
  getRoomFeedbacks,
  type FeedbackResponse,
} from "@/services/feedback-service";
import { quoteRoomRate, type RoomRateQuoteResponse } from "@/services/pricing-service";
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

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export default function RoomDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params?.id as string;
  const token = useAuthStore((state) => state.token);
  const [roomData, setRoomData] = useState<RoomDetailData | null>(null);
  const [reviews, setReviews] = useState<FeedbackResponse[]>([]);
  const [rateQuote, setRateQuote] = useState<RoomRateQuoteResponse | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const checkIn = searchParams.get("checkIn") || toDateInputValue(new Date());
  const checkOut = searchParams.get("checkOut") || toDateInputValue(addDays(new Date(), 2));
  const guests = Number(searchParams.get("guests") || 2);
  const stayType = searchParams.get("stayType") || "night";
  const checkInTime = searchParams.get("checkInTime") || "14:00";
  const stayHours = Number(searchParams.get("stayHours") || 3);

  useEffect(() => {
    async function loadRoomDetail() {
      try {
        setIsLoading(true);
        setReviewsLoading(true);
        const [data, roomReviews] = await Promise.all([
          getRoomDetail(roomId),
          getRoomFeedbacks(roomId).catch(() => []),
        ]);
        if (!data) {
          setError("Không tìm thấy thông tin phòng");
          return;
        }
        setRoomData(data);
        setReviews(roomReviews);
      } catch (err) {
        setError("Lỗi khi tải thông tin phòng");
        console.error(err);
      } finally {
        setIsLoading(false);
        setReviewsLoading(false);
      }
    }
    if (roomId) loadRoomDetail();
  }, [roomId]);

  useEffect(() => {
    if (!roomData?.roomTypeId || roomData.pricePerNight <= 0) {
      setRateQuote(null);
      return;
    }

    let isMounted = true;
    const unitPrice =
      stayType === "hour" ? Math.round(roomData.pricePerNight / 8) : roomData.pricePerNight;

    quoteRoomRate({
      roomTypeId: roomData.roomTypeId,
      basePrice: unitPrice,
      checkin: buildCheckin(checkIn, checkInTime),
      checkout: buildCheckout(checkIn, checkOut, checkInTime, stayType, stayHours),
      stayType: stayType === "hour" ? "HOUR" : "NIGHT",
    })
      .then((quote) => {
        if (isMounted) setRateQuote(quote);
      })
      .catch(() => {
        if (isMounted) setRateQuote(null);
      });

    return () => {
      isMounted = false;
    };
  }, [checkIn, checkInTime, checkOut, roomData, stayHours, stayType]);

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
    roomTypeId,
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
    roomTypeId?: string;
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
      ...(roomTypeId ? { roomTypeId } : {}),
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

  function formatReviewDate(value?: string) {
    if (!value) return "Vừa đánh giá";
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  }

  function buildCheckin(checkInValue: string, checkInTimeValue: string) {
    return `${checkInValue}T${checkInTimeValue.length === 5 ? checkInTimeValue : "14:00"}:00`;
  }

  function buildCheckout(
    checkInValue: string,
    checkOutValue: string,
    checkInTimeValue: string,
    stayTypeValue: string,
    stayHoursValue: number,
  ) {
    if (stayTypeValue === "hour") {
      const start = new Date(buildCheckin(checkInValue, checkInTimeValue));
      start.setHours(start.getHours() + stayHoursValue);
      const pad = (num: number) => String(num).padStart(2, "0");
      return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}T${pad(start.getHours())}:${pad(start.getMinutes())}:00`;
    }

    return `${checkOutValue}T12:00:00`;
  }

  function getReviewAuthor(review: FeedbackResponse) {
    if (review.anonymous) return "Khách đã lưu trú";
    return review.customerName?.trim() || "Khách đã lưu trú";
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
  const pricedRoomSubtotal = rateQuote?.totalPrice ?? roomSubtotal;
  const taxFee = Math.round(pricedRoomSubtotal * 0.1);
  const totalPrice = pricedRoomSubtotal + taxFee;
  const stayLabel = stayType === "hour" ? `${stayHours} giờ` : `${nightCount} đêm`;
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, item) => total + item.rating, 0) / reviews.length
      : 0;
  const bookingHref = buildBookingHref({
    roomId: roomData.id,
    roomTypeId: roomData.roomTypeId,
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
    <main className="mx-auto min-h-screen max-w-screen-2xl bg-[#fdf9f4] px-4 pt-24 pb-28 font-sans text-[#1c1c19] selection:bg-[#865316]/20 sm:px-6 md:px-12 md:pt-32">
      {/* Hero Section */}
      <div className="mb-10 grid grid-cols-1 items-end gap-6 sm:mb-14 lg:mb-20 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <span className="mb-4 inline-block rounded-full bg-[#80f6ec]/30 px-4 py-1 text-[10px] font-bold tracking-widest text-[#00716b] uppercase sm:text-xs">
            {label}
          </span>
          <h1 className="mb-4 font-serif text-4xl leading-tight font-bold text-[#1c1c19] sm:text-5xl md:mb-6 md:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="max-w-xl text-base leading-relaxed font-light text-[#514439] sm:text-lg md:text-xl">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="flex items-center gap-2 font-medium text-[#865316]">
            <MapPin className="text-3xl" />
            <span className="text-lg">{location}</span>
          </div>
          <div className="font-serif text-2xl font-bold text-[#1c1c19] sm:text-3xl md:text-4xl">
            {pricePerNight.toLocaleString("vi-VN")} VNĐ{" "}
            <span className="font-sans text-base font-normal text-[#514439]">/ đêm</span>
          </div>
        </div>
      </div>

      {/* Gallery Bento Grid */}
      <section className="mb-12 sm:mb-16 lg:mb-24">
        <div className="grid h-[280px] grid-cols-1 gap-4 sm:h-[420px] sm:grid-rows-2 md:h-[600px] md:grid-cols-4">
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
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-10 sm:space-y-14 lg:col-span-8 lg:space-y-16">
          {/* Key Specifications */}
          <div className="grid grid-cols-1 gap-5 border-y border-[#d6c3b4]/20 py-6 sm:grid-cols-2 sm:gap-8 sm:py-8">
            {featureSpecs.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <span className="text-[10px] font-bold tracking-widest text-[#514439] uppercase sm:text-xs">
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  {getFeatureIcon(item.iconType)}
                  <span className="text-lg font-medium sm:text-xl">{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Description Section */}
          <section>
            <h3 className="mb-4 font-serif text-2xl font-bold italic sm:mb-6 sm:text-3xl">
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

          <section>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[11px] font-bold tracking-[0.22em] text-[#865316] uppercase">
                  Đánh giá
                </p>
                <h3 className="font-serif text-2xl font-bold">
                  Đánh giá từ khách lưu trú
                </h3>
              </div>
              {reviews.length > 0 ? (
                <div className="flex items-center gap-2 rounded-full bg-[#f7f3ee] px-4 py-2">
                  <Star className="h-4 w-4 fill-[#c87a2d] text-[#c87a2d]" />
                  <span className="font-bold text-[#1c1c19]">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-[#514439]">
                    / 5 từ {reviews.length} đánh giá
                  </span>
                </div>
              ) : null}
            </div>

            {reviewsLoading ? (
              <div className="rounded-xl bg-[#f7f3ee] p-6 text-sm text-[#514439]">
                Đang tải đánh giá...
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="w-full rounded-xl border border-[#d6c3b4]/30 bg-white p-5 shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#1c1c19]">
                          {getReviewAuthor(review)}
                        </p>
                        <p className="text-xs text-[#7a6a5b]">
                          {formatReviewDate(review.createdTime)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${
                              index < review.rating
                                ? "fill-[#c87a2d] text-[#c87a2d]"
                                : "text-[#d6c3b4]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-[#514439]">{review.comment}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-[#f7f3ee] p-6 text-sm text-[#514439]">
                Phòng này chưa có đánh giá từ khách lưu trú.
              </div>
            )}
          </section>
        </div>

        {/* Booking Card (Sticky) */}
        <aside className="lg:sticky lg:top-32 lg:col-span-4">
          <div className="rounded-2xl border border-[#d6c3b4]/10 bg-[#ffffff] p-5 shadow-[0_20px_40px_rgba(28,28,25,0.06)] sm:p-6 lg:p-8">
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
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
                  <span>{pricedRoomSubtotal.toLocaleString("vi-VN")} VNĐ</span>
                </div>
                {rateQuote?.items?.some((item) => Number(item.multiplier) !== 1) ? (
                  <div className="rounded-xl bg-[#fff6df] p-3 text-xs leading-5 text-[#8a5724]">
                    Giá đã áp dụng hệ số theo ngày lưu trú như cuối tuần hoặc ngày lễ.
                  </div>
                ) : null}
                <div className="flex justify-between text-sm text-[#514439] sm:text-base">
                  <span>VAT và phụ phí (10%)</span>
                  <span>{taxFee.toLocaleString("vi-VN")} VNĐ</span>
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
                className="block w-full rounded-full bg-gradient-to-r from-[#865316] to-[#c68948] py-4 text-center text-base font-bold text-white shadow-xl shadow-[#865316]/20 transition-all hover:scale-[1.02] active:scale-95 sm:py-5 sm:text-lg"
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
      <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-[#d6c3b4]/20 bg-white/90 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-[#514439]">Bắt đầu từ</div>
            <div className="font-bold text-[#865316]">
              {pricePerNight.toLocaleString("vi-VN")} VNĐ
            </div>
          </div>
          <Link
            href={bookingHref}
            className="shrink-0 rounded-full bg-[#865316] px-5 py-3 text-sm font-bold text-white shadow-lg sm:px-8 sm:text-base"
          >
            Đặt ngay
          </Link>
        </div>
      </div>
    </main>
  );
}
