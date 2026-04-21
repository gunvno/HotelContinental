"use client";

import { Bath, BedDouble, Calendar, CalendarOff,Coffee, Eye, MapPin, Ruler, Shirt, Tv, Users, Wifi, Wine } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getRoomDetail, type RoomDetailData } from "@/services/room-service";

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
const roomId = params?.id as string;
const [roomData, setRoomData] = useState<RoomDetailData | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

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
<div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-[#d6c3b4]/20">
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
<h3 className="text-2xl font-serif font-bold mb-8">Kiểm tra tình trạng phòng</h3>
<div className="space-y-6">
<div className="space-y-2">
<label className="text-xs uppercase tracking-widest text-[#514439] font-bold px-1">Ngày nhận phòng</label>
<div className="relative group">
<input type="date" className="w-full bg-[#f1ede8] border-none rounded-xl py-4 px-4 text-[#1c1c19] focus:ring-2 focus:ring-[#865316]/20 transition-all appearance-none outline-none" />
<Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[#514439] pointer-events-none w-5 h-5" />
</div>
</div>

<div className="space-y-2">
<label className="text-xs uppercase tracking-widest text-[#514439] font-bold px-1">Ngày trả phòng</label>
<div className="relative group">
<input type="date" className="w-full bg-[#f1ede8] border-none rounded-xl py-4 px-4 text-[#1c1c19] focus:ring-2 focus:ring-[#865316]/20 transition-all appearance-none outline-none" />
<CalendarOff className="absolute right-4 top-1/2 -translate-y-1/2 text-[#514439] pointer-events-none w-5 h-5" />
</div>
</div>

<div className="space-y-2 pb-6 border-b border-[#d6c3b4]/20">
<label className="text-xs uppercase tracking-widest text-[#514439] font-bold px-1">Số lượng khách</label>
<select defaultValue="2 Người lớn" className="w-full bg-[#f1ede8] border-none rounded-xl py-4 px-4 text-[#1c1c19] focus:ring-2 focus:ring-[#865316]/20 transition-all outline-none appearance-none">
<option>1 Người lớn</option>
<option value="2 Người lớn">2 Người lớn</option>
<option>3 Người lớn</option>
</select>
</div>

<div className="space-y-3">
<div className="flex justify-between text-[#514439] text-sm sm:text-base">
<span>Giá phòng (3 đêm)</span>
<span>{(pricePerNight * 3).toLocaleString("vi-VN")} VNĐ</span>
</div>
<div className="flex justify-between text-[#514439] text-sm sm:text-base">
<span>Phí dịch vụ & Thuế (10%)</span>
<span>{((pricePerNight * 3) * 0.1).toLocaleString("vi-VN")} VNĐ</span>
</div>
<div className="flex justify-between text-lg sm:text-xl font-bold pt-4">
<span>Tổng cộng</span>
<span className="text-[#865316]">{(pricePerNight * 3 * 1.1).toLocaleString("vi-VN")} VNĐ</span>
</div>
</div>

<button className="w-full bg-gradient-to-r from-[#865316] to-[#c68948] text-white py-5 rounded-full font-bold text-lg shadow-xl shadow-[#865316]/20 hover:scale-[1.02] active:scale-95 transition-all">
Đặt phòng ngay
</button>
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
<button className="bg-[#865316] text-white px-6 sm:px-8 py-3 rounded-full font-bold shadow-lg text-sm sm:text-base">Đặt ngay</button>
</div>
</div>
</main>
);
}