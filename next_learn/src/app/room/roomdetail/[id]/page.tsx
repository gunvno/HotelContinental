"use client";

import { Bath, BedDouble, Calendar, CalendarOff,Coffee, Eye, MapPin, Ruler, Shirt, Tv, Users, Wifi, Wine } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getRoomDetail, type RoomDetailData } from "@/services/room-service";
import { useAuthStore } from "@/store/auth-store";

function getFeatureIcon(iconType: string) {
switch (iconType) {
case "area": return <Ruler className="h-6 w-6 text-[#865316]" />;
case "users": return <Users className="h-6 w-6 text-[#865316]" />;
case "bed": return <BedDouble className="h-6 w-6 text-[#865316]" />;
case "view": return <Eye className="h-6 w-6 text-[#865316]" />;
default: return <Ruler className="h-6 w-6 text-[#865316]" />;
}
}

function getAmenityIcon(iconType: string) {
switch (iconType) {
case "wifi": return <Wifi className="h-8 w-8 text-[#865316]" />;
case "mini-bar": return <Wine className="h-8 w-8 text-[#865316]" />;
case "bath": return <Bath className="h-8 w-8 text-[#865316]" />;
case "coffee": return <Coffee className="h-8 w-8 text-[#865316]" />;
case "butler": return <Shirt className="h-8 w-8 text-[#865316]" />;
case "tv": return <Tv className="h-8 w-8 text-[#865316]" />;
default: return <Wifi className="h-8 w-8 text-[#865316]" />;
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
<main className="bg-[#fdf9f4] min-h-screen pt-32 pb-24">
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
<main className="bg-[#fdf9f4] min-h-screen pt-32 flex items-center justify-center">
<div className="text-center">
<h1 className="text-[#1c1c19] text-2xl font-bold">{error || "Không tìm thấy phòng"}</h1>
<p className="text-[#514439] mt-2">Vui lòng quay lại và chọn phòng khác.</p>
</div>
</main>
);
}

const { label, title, description, location, pricePerNight, galleryImages, featureSpecs, amenities, roomDescription } = roomData;
const nightCount = stayType === "night" ? calculateNightCount(checkIn, checkOut) : 0;
const roomSubtotal = stayType === "hour"
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
<main className="bg-[#fdf9f4] text-[#1c1c19] pt-32 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto font-sans selection:bg-[#865316]/20 min-h-screen">
{/* Hero Section */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 items-end">
<div className="lg:col-span-7">
<span className="inline-block py-1 px-4 rounded-full bg-[#80f6ec]/30 text-[#00716b] text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-4">
{label}
</span>
<h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-[#1c1c19] leading-tight mb-6">
{title}
</h1>
<p className="text-lg sm:text-xl text-[#514439] max-w-xl leading-relaxed font-light">
{description}
</p>
</div>
<div className="lg:col-span-5 flex flex-col gap-4">
<div className="flex items-center gap-2 text-[#865316] font-medium">
<MapPin className="text-3xl" />
<span className="text-lg">{location}</span>
</div>
<div className="text-3xl sm:text-4xl font-serif font-bold text-[#1c1c19]">
{pricePerNight.toLocaleString("vi-VN")} VNĐ <span className="text-base font-sans font-normal text-[#514439]">/ đêm</span>
</div>
</div>
</div>

{/* Gallery Bento Grid */}
<section className="mb-24">
<div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[400px] sm:h-[500px] md:h-[600px]">
<div className="md:col-span-2 md:row-span-2 rounded-xl overflow-hidden relative group">
<img src={galleryImages.main} alt="Main room view" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
<div className="absolute inset-0 bg-gradient-to-t from-[#1c1c19]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
</div>
<div className="md:col-span-2 md:row-span-1 rounded-xl overflow-hidden relative group h-[200px] sm:h-[250px] md:h-auto hidden sm:block">
<img src={galleryImages.topRight} alt="Secondary view" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
</div>
<div className="rounded-xl overflow-hidden relative group h-[200px] sm:h-[250px] md:h-auto hidden md:block">
<img src={galleryImages.bottomLeft} alt="Detail view" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
</div>
<div className="rounded-xl overflow-hidden relative group h-[200px] sm:h-[250px] md:h-auto hidden md:block">
<img src={galleryImages.bottomRight} alt="Bathroom view" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
</div>
</div>
</section>

{/* Details & Booking Sticky Bar */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
<div className="lg:col-span-8 space-y-16">

{/* Key Specifications */}
<div className="grid grid-cols-2 gap-8 py-8 border-y border-[#d6c3b4]/20">
{featureSpecs.map((item, idx) => (
<div key={idx} className="flex flex-col gap-2">
<span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#514439] font-bold">{item.label}</span>
<div className="flex items-center gap-2">
{getFeatureIcon(item.iconType)}
<span className="text-xl font-medium">{item.value}</span>
</div>
</div>
))}
</div>

{/* Description Section */}
<section>
<h3 className="text-3xl font-serif font-bold mb-6 italic">Tuyệt tác không gian nghỉ dưỡng</h3>
<div className="prose prose-lg text-[#514439] leading-relaxed font-light max-w-none">
<p>{roomDescription}</p>
</div>
</section>

{/* Amenities Bento */}
<section>
<h3 className="text-2xl font-serif font-bold mb-8">Tiện nghi đặc quyền</h3>
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
{amenities.map((item, idx) => (
<div key={idx} className="p-6 rounded-xl bg-[#f7f3ee] flex flex-col gap-4 hover:bg-[#ebe8e3] transition-colors">
{getAmenityIcon(item.icon)}
<div>
<h4 className="font-bold mb-1">{item.title}</h4>
<p className="text-sm text-[#514439]">{item.description}</p>
</div>
</div>
))}
</div>
</section>
</div>

{/* Booking Card (Sticky) */}
<aside className="lg:col-span-4 sticky top-32">
<div className="bg-[#ffffff] p-6 lg:p-8 rounded-2xl shadow-[0_20px_40px_rgba(28,28,25,0.06)] border border-[#d6c3b4]/10">
<div className="mb-7">
<p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#865316]">Đặt phòng</p>
<h3 className="text-2xl font-serif font-bold">Thông tin lưu trú</h3>
<p className="mt-2 text-sm text-[#514439]">Phòng đã được lọc theo thời gian bạn chọn. Xác nhận thông tin trước khi thanh toán.</p>
</div>

<div className="space-y-5">
<div className="grid grid-cols-2 gap-3">
<div className="rounded-xl bg-[#f7f3ee] p-4">
<div className="mb-3 flex items-center justify-between">
<span className="text-[11px] uppercase tracking-widest text-[#514439] font-bold">Nhận phòng</span>
<Calendar className="w-4 h-4 text-[#865316]" />
</div>
<p className="text-sm font-semibold text-[#1c1c19]">{formatDate(checkIn)}</p>
<p className="mt-1 text-xs text-[#514439]">{stayType === "hour" ? checkInTime : "14:00"}</p>
</div>

<div className="rounded-xl bg-[#f7f3ee] p-4">
<div className="mb-3 flex items-center justify-between">
<span className="text-[11px] uppercase tracking-widest text-[#514439] font-bold">{stayType === "hour" ? "Thời lượng" : "Trả phòng"}</span>
<CalendarOff className="w-4 h-4 text-[#865316]" />
</div>
<p className="text-sm font-semibold text-[#1c1c19]">{stayType === "hour" ? stayLabel : formatDate(checkOut)}</p>
<p className="mt-1 text-xs text-[#514439]">{stayType === "hour" ? "Theo giờ" : "12:00"}</p>
</div>
</div>

<div className="flex items-center justify-between rounded-xl border border-[#d6c3b4]/30 px-4 py-3">
<div>
<p className="text-[11px] uppercase tracking-widest text-[#514439] font-bold">Số lượng khách</p>
<p className="mt-1 text-sm font-semibold">{guests} Người lớn</p>
</div>
<Users className="w-5 h-5 text-[#865316]" />
</div>

<Link href="/room/listroom" className="block text-sm font-semibold text-[#865316] hover:underline">
Thay đổi ngày hoặc số khách
</Link>

<div className="space-y-3 border-t border-[#d6c3b4]/20 pt-5">
<div className="flex justify-between text-[#514439] text-sm sm:text-base">
<span>Giá phòng ({stayLabel})</span>
<span>{roomSubtotal.toLocaleString("vi-VN")} VNĐ</span>
</div>
<div className="flex justify-between text-[#514439] text-sm sm:text-base">
<span>Phí dịch vụ & Thuế (10%)</span>
<span>{serviceFee.toLocaleString("vi-VN")} VNĐ</span>
</div>
<div className="flex justify-between text-lg sm:text-xl font-bold pt-4">
<span>Tổng cộng</span>
<span className="text-[#865316]">{totalPrice.toLocaleString("vi-VN")} VNĐ</span>
</div>
</div>

<Link href={bookingHref} className="block w-full bg-gradient-to-r from-[#865316] to-[#c68948] text-white py-5 rounded-full font-bold text-lg text-center shadow-xl shadow-[#865316]/20 hover:scale-[1.02] active:scale-95 transition-all">
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
<div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-[#d6c3b4]/20 z-40">
<div className="flex items-center justify-between">
<div>
<div className="text-xs text-[#514439]">Bắt đầu từ</div>
<div className="font-bold text-[#865316]">{pricePerNight.toLocaleString("vi-VN")} VNĐ</div>
</div>
<Link href={bookingHref} className="bg-[#865316] text-white px-6 sm:px-8 py-3 rounded-full font-bold shadow-lg text-sm sm:text-base">Đặt ngay</Link>
</div>
</div>
</main>
);
}
