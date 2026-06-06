"use client";

import { Bookmark, BedDouble, Bath, Wifi, Tv, Wine, Snowflake, Shield, Coffee, Users, ChevronRight, CalendarDays, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";


import { getAllRooms, type RoomResponse } from "@/services/room-service";

const priceFormatter = new Intl.NumberFormat("vi-VN");

/* ─── mock room data for display ─── */
const mockRooms = [
  {
    id: "deluxe-suite",
    name: "Deluxe Suite",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
    pricePerDay: 1200000,
    maxGuests: 2,
    available: 6,
    badge: "Phổ biến",
    amenities: ["King Bed", "Bồn tắm", "City View", "Wi-Fi"],
    description: "Không gian sang trọng, thư giãn tuyệt đối",
    detailDescription: "Deluxe Suite mang đến không gian rộng rãi, thiết kế tinh tế cùng tầm nhìn thành phố tuyệt đẹp – lựa chọn hoàn hảo cho kỳ nghỉ thư giãn và đẳng cấp.",
    gallery: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=400&q=80",
    ],
    detailAmenities: [
      { icon: "bed", label: "King Bed" },
      { icon: "bath", label: "Bồn tắm" },
      { icon: "wifi", label: "Wi-Fi miễn phí" },
      { icon: "tv", label: "Smart TV" },
      { icon: "minibar", label: "Minibar" },
      { icon: "ac", label: "Điều hòa" },
      { icon: "safe", label: "Két an toàn" },
      { icon: "coffee", label: "Ấm đun nước" },
    ],
  },
  {
    id: "ocean-view-suite",
    name: "Ocean View Suite",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    pricePerDay: 1800000,
    maxGuests: 2,
    available: 4,
    amenities: ["King Bed", "Bồn tắm", "Ocean View", "Wi-Fi"],
    description: "Tầm nhìn biển tuyệt đẹp, tiện nghi đỉnh cao",
    detailDescription: "Ocean View Suite với tầm nhìn biển tuyệt đẹp, thiết kế sang trọng và tiện nghi cao cấp cho kỳ nghỉ đáng nhớ.",
    gallery: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=400&q=80",
    ],
    detailAmenities: [
      { icon: "bed", label: "King Bed" },
      { icon: "bath", label: "Bồn tắm" },
      { icon: "wifi", label: "Wi-Fi miễn phí" },
      { icon: "tv", label: "Smart TV" },
      { icon: "minibar", label: "Minibar" },
      { icon: "ac", label: "Điều hòa" },
    ],
  },
  {
    id: "family-room",
    name: "Family Room",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    pricePerDay: 1600000,
    maxGuests: 4,
    available: 8,
    amenities: ["2 Giường lớn", "Sofa Bed", "City View", "Wi-Fi"],
    description: "Rộng rãi, thoải mái cho cả gia đình",
    detailDescription: "Family Room được thiết kế rộng rãi với 2 giường lớn và sofa bed, phù hợp cho gia đình có trẻ nhỏ.",
    gallery: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80",
    ],
    detailAmenities: [
      { icon: "bed", label: "2 Giường lớn" },
      { icon: "bath", label: "Bồn tắm" },
      { icon: "wifi", label: "Wi-Fi miễn phí" },
      { icon: "tv", label: "Smart TV" },
    ],
  },
  {
    id: "classic-room",
    name: "Classic Room",
    image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80",
    pricePerDay: 900000,
    maxGuests: 2,
    available: 10,
    amenities: ["Queen Bed", "City View", "Wi-Fi"],
    description: "Tinh tế, ấm cúng và đầy đủ tiện nghi",
    detailDescription: "Classic Room với thiết kế thanh lịch, đầy đủ tiện nghi cơ bản cho kỳ nghỉ thoải mái.",
    gallery: [
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80",
    ],
    detailAmenities: [
      { icon: "bed", label: "Queen Bed" },
      { icon: "wifi", label: "Wi-Fi miễn phí" },
      { icon: "tv", label: "Smart TV" },
      { icon: "ac", label: "Điều hòa" },
    ],
  },
];

type MockRoom = typeof mockRooms[number];

function getAmenityIcon(icon: string) {
  const cls = "h-4 w-4 text-[#7a6548] dark:text-[#d7a25f]";
  switch (icon) {
    case "bed": return <BedDouble className={cls} />;
    case "bath": return <Bath className={cls} />;
    case "wifi": return <Wifi className={cls} />;
    case "tv": return <Tv className={cls} />;
    case "minibar": return <Wine className={cls} />;
    case "ac": return <Snowflake className={cls} />;
    case "safe": return <Shield className={cls} />;
    case "coffee": return <Coffee className={cls} />;
    default: return <Wifi className={cls} />;
  }
}

/* ─── API data conversion helpers ─── */
const fallbackImages = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=400&q=80",
];

function mapAmenityIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("wifi") || lower.includes("wi-fi") || lower.includes("internet")) return "wifi";
  if (lower.includes("bed") || lower.includes("giường") || lower.includes("nệm")) return "bed";
  if (lower.includes("bath") || lower.includes("tắm") || lower.includes("bồn")) return "bath";
  if (lower.includes("tv") || lower.includes("tivi") || lower.includes("truyền hình")) return "tv";
  if (lower.includes("minibar") || lower.includes("bar") || lower.includes("rượu")) return "minibar";
  if (lower.includes("điều hòa") || lower.includes("máy lạnh") || lower.includes("ac")) return "ac";
  if (lower.includes("két") || lower.includes("safe") || lower.includes("an toàn")) return "safe";
  if (lower.includes("coffee") || lower.includes("cà phê") || lower.includes("ấm") || lower.includes("nước")) return "coffee";
  return "wifi";
}

function convertApiRooms(rooms: RoomResponse[]): MockRoom[] {
  return rooms.map((room, index) => {
    const mainImage = room.image || fallbackImages[index % fallbackImages.length];
    const amenityRooms = room.roomTypes?.amenityRooms ?? [];
    const amenityNames = amenityRooms
      .map((ar) => ar.amenity?.name)
      .filter((n): n is string => Boolean(n));

    return {
      id: room.id,
      name: room.name || `Phòng ${index + 1}`,
      image: mainImage,
      pricePerDay: room.pricePerDay || 0,
      maxGuests: room.roomTypes?.maximumOccupancy ?? 2,
      available: room.roomTypes?.quantity ?? 5,
      badge: index === 0 ? "Phổ biến" : undefined,
      amenities: amenityNames.length > 0 ? amenityNames.slice(0, 4) : ["Wi-Fi"],
      description: room.roomTypes?.description || room.description || "Trải nghiệm nghỉ dưỡng cao cấp",
      detailDescription: room.description || room.roomTypes?.description || "Không gian nghỉ dưỡng sang trọng với đầy đủ tiện nghi chuẩn 5 sao.",
      gallery: [mainImage, ...fallbackImages.filter((img) => img !== mainImage).slice(0, 3)],
      detailAmenities: amenityNames.length > 0
        ? amenityNames.map((name) => ({ icon: mapAmenityIcon(name), label: name }))
        : [
            { icon: "wifi", label: "Wi-Fi" },
            { icon: "bed", label: "Giường" },
            { icon: "bath", label: "Phòng tắm" },
          ],
    } as MockRoom;
  });
}

/* ─── Loading Skeletons ─── */
function RoomCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#e8ddd0] dark:border-white/10 bg-white dark:bg-white/[0.05] overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-[#e8ddd0] dark:bg-white/10" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-[#e8ddd0] dark:bg-white/10 rounded w-2/3" />
        <div className="h-5 bg-[#e8ddd0] dark:bg-white/10 rounded w-1/2" />
        <div className="h-4 bg-[#e8ddd0] dark:bg-white/10 rounded w-3/4" />
        <div className="flex gap-1.5">
          <div className="h-5 bg-[#e8ddd0] dark:bg-white/10 rounded w-16" />
          <div className="h-5 bg-[#e8ddd0] dark:bg-white/10 rounded w-14" />
        </div>
        <div className="h-10 bg-[#e8ddd0] dark:bg-white/10 rounded-lg" />
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="lg:sticky lg:top-20">
      <div className="rounded-2xl border border-[#e8ddd0] dark:border-white/10 bg-white dark:bg-white/[0.05] overflow-hidden animate-pulse">
        <div className="px-5 pt-5 pb-2"><div className="h-6 bg-[#e8ddd0] dark:bg-white/10 rounded-full w-24" /></div>
        <div className="px-5 pb-4 space-y-2">
          <div className="h-6 bg-[#e8ddd0] dark:bg-white/10 rounded w-2/3" />
          <div className="h-4 bg-[#e8ddd0] dark:bg-white/10 rounded w-full" />
          <div className="h-6 bg-[#e8ddd0] dark:bg-white/10 rounded w-1/2" />
        </div>
        <div className="px-5"><div className="aspect-[4/3] bg-[#e8ddd0] dark:bg-white/10 rounded-xl" /></div>
        <div className="px-5 py-3 flex gap-2">
          {[1,2,3,4].map((i) => <div key={i} className="w-16 h-12 bg-[#e8ddd0] dark:bg-white/10 rounded-lg shrink-0" />)}
        </div>
        <div className="px-5 pb-5 space-y-2">
          <div className="h-4 bg-[#e8ddd0] dark:bg-white/10 rounded w-1/3" />
          <div className="grid grid-cols-2 gap-2">
            {[1,2,3,4].map((i) => <div key={i} className="h-5 bg-[#e8ddd0] dark:bg-white/10 rounded" />)}
          </div>
        </div>
        <div className="px-5 pb-5"><div className="h-12 bg-[#e8ddd0] dark:bg-white/10 rounded-xl" /></div>
      </div>
    </aside>
  );
}

/* ─── Sidebar Detail Card ─── */
function SidebarDetail({ room }: { room: MockRoom }) {
  const [mainImg, setMainImg] = useState(0);
  const thumbRef = useRef<HTMLDivElement>(null);

  return (
    <aside className="lg:sticky lg:top-20 space-y-0">
      <div className="rounded-2xl border border-[#e8ddd0] dark:border-white/10 bg-white dark:bg-white/[0.05] shadow-[0_8px_40px_-16px_rgba(120,90,50,0.13)] dark:shadow-none overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-[#8b6a3e] dark:text-[#d7a25f]" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8b6a3e]/10 dark:bg-[#d7a25f]/15 px-3 py-1 text-[11px] font-semibold text-[#8b6a3e] dark:text-[#d7a25f] tracking-wide">
              Đang xem
            </span>
          </div>
        </div>

        {/* Title & Price */}
        <div className="px-5 pb-4 space-y-2">
          <h3 className="text-xl font-serif font-bold text-[#1c1c19] dark:text-[#f8f1e7]">{room.name}</h3>
          <p className="text-sm text-[#6b5e50] dark:text-[#c9b8a4]">{room.description}</p>
          <p className="text-[#c47a34] dark:text-[#f6c86f] font-bold text-lg">
            Từ {priceFormatter.format(room.pricePerDay)}đ <span className="text-sm font-normal text-[#8b7a6a] dark:text-[#9aa5b1]">/ đêm</span>
          </p>
          <div className="flex flex-col gap-1 text-sm text-[#6b5e50] dark:text-[#c9b8a4]">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#8b6a3e] dark:text-[#d7a25f]" />
              Tối đa {room.maxGuests} khách
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Còn {room.available} phòng trong khoảng ngày bạn chọn
            </span>
          </div>
        </div>

        {/* Main Image */}
        <div className="px-5">
          <div className="rounded-xl overflow-hidden aspect-[4/3] relative">
            <img
              src={room.gallery[mainImg]}
              alt={room.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
          </div>
        </div>

        {/* Thumbnail Gallery */}
        <div className="px-5 py-3">
          <div ref={thumbRef} className="flex gap-2 overflow-x-auto scrollbar-hide">
            {room.gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImg(i)}
                className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  mainImg === i ? "border-[#c47a34] shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            {room.gallery.length > 4 && (
              <button className="shrink-0 w-8 h-12 flex items-center justify-center text-[#8b6a3e] dark:text-[#d7a25f] hover:text-[#c47a34]">
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Amenities */}
        <div className="px-5 pb-4">
          <p className="text-sm font-semibold text-[#1c1c19] dark:text-[#f8f1e7] mb-3">Tiện nghi nổi bật</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {(room.detailAmenities || []).map((a) => (
              <span key={a.label} className="flex items-center gap-2 text-sm text-[#5a4d3e] dark:text-[#c9b8a4]">
                {getAmenityIcon(a.icon)}
                {a.label}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="px-5 pb-5">
          <p className="text-sm font-semibold text-[#1c1c19] dark:text-[#f8f1e7] mb-2">Mô tả</p>
          <p className="text-sm text-[#6b5e50] dark:text-[#c9b8a4] leading-relaxed">
            {room.detailDescription}
          </p>
        </div>

        {/* CTA */}
        <div className="px-5 pb-5">
          <Link
            href={`/room/roomdetail/${room.id}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#865316] to-[#c68948] text-white font-bold text-sm shadow-lg shadow-[#865316]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <CalendarDays className="h-4 w-4" />
            Đặt loại phòng này
          </Link>
        </div>
      </div>
    </aside>
  );
}

/* ─── Room Card (grid version) ─── */
function RoomGridCard({
  room,
  isSelected,
  onSelect,
}: {
  room: MockRoom;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl border bg-white dark:bg-white/[0.05] overflow-hidden shadow-[0_4px_24px_-8px_rgba(120,90,50,0.1)] dark:shadow-none transition-all duration-200 hover:shadow-[0_8px_32px_-8px_rgba(120,90,50,0.18)] hover:-translate-y-1 ${
        isSelected ? "border-[#c47a34] ring-1 ring-[#c47a34]/30" : "border-[#e8ddd0] dark:border-white/10"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        {room.badge && (
          <span className="absolute top-3 left-3 rounded-md bg-[#c47a34] px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
            {room.badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <h3 className="text-base font-bold text-[#1c1c19] dark:text-[#f8f1e7]">{room.name}</h3>
        <p className="text-[#c47a34] dark:text-[#f6c86f] font-bold">
          Từ {priceFormatter.format(room.pricePerDay)}đ <span className="text-xs font-normal text-[#8b7a6a] dark:text-[#9aa5b1]">/ đêm</span>
        </p>

        <div className="flex items-center gap-3 text-xs text-[#6b5e50] dark:text-[#c9b8a4]">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Tối đa {room.maxGuests} khách
          </span>
          <span>•</span>
          <span>Còn {room.available} phòng</span>
        </div>

        {/* Amenity tags */}
        <div className="flex flex-wrap gap-1.5">
          {room.amenities.map((a) => (
            <span key={a} className="rounded-md bg-[#f5efe6] dark:bg-white/10 px-2 py-0.5 text-[11px] text-[#6b5e50] dark:text-[#c9b8a4] font-medium">
              {a}
            </span>
          ))}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="w-full mt-1 py-2.5 rounded-lg border border-[#c47a34] dark:border-[#f6c86f] text-[#c47a34] dark:text-[#f6c86f] text-sm font-semibold hover:bg-[#c47a34] hover:text-white dark:hover:bg-[#f6c86f] dark:hover:text-[#0b0f17] transition-all"
        >
          Xem chi tiết
        </button>
      </div>
    </article>
  );
}

/* ─── Main Page ─── */
export default function RoomListPage() {
  const [selectedRoom, setSelectedRoom] = useState(0);
  const [checkIn, setCheckIn] = useState("2026-06-15");
  const [checkOut, setCheckOut] = useState("2026-06-17");
  const [guestCount, setGuestCount] = useState("2");
  const [priceRange, setPriceRange] = useState("all");
  const [displayRooms, setDisplayRooms] = useState<MockRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getAllRooms(0, 20)
      .then(({ data }) => {
        if (data.length > 0) {
          setDisplayRooms(convertApiRooms(data));
        } else {
          setDisplayRooms(mockRooms);
        }
      })
      .catch(() => {
        setDisplayRooms(mockRooms);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const current = displayRooms[selectedRoom] ?? displayRooms[0];

  return (
    <section className="min-h-screen bg-[#fdfaf5] dark:bg-[#0b0f17] pt-20 pb-20">
      <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">
          {/* ═══ LEFT COLUMN ═══ */}
          <div className="space-y-10">
            {/* Hero Header */}
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-base font-semibold text-[#8b6a3e] dark:text-[#d7a25f] tracking-wide">Phòng & Suite</span>
                <span className="flex-1 h-px bg-[#d6c3b0] dark:bg-white/15" />
                <span className="text-[#c47a34] dark:text-[#f6c86f] text-xl">✦</span>
              </div>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-[3.5rem] font-bold text-[#1c1c19] dark:text-[#f8f1e7] leading-[1.08] max-w-2xl">
                Chọn không gian<br />nghỉ dưỡng của bạn
              </h1>
              <p className="text-[#6b5e50] dark:text-[#c9b8a4] text-base md:text-lg max-w-xl leading-relaxed">
                Bạn chọn loại phòng phù hợp với nhu cầu,<br />
                Continental sẽ tự sắp xếp phòng phù hợp nhất cho kỳ nghỉ của bạn.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="rounded-2xl border border-[#e8ddd0] dark:border-white/10 bg-white dark:bg-white/[0.05] p-5 md:p-6 shadow-[0_4px_20px_-8px_rgba(120,90,50,0.08)] dark:shadow-none">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                <label className="space-y-2">
                  <span className="text-xs font-semibold text-[#8b7a6a] dark:text-[#9aa5b1] uppercase tracking-wider">Nhận phòng</span>
                  <div className="flex items-center gap-2.5 rounded-xl border border-[#e8ddd0] dark:border-white/10 bg-[#faf7f2] dark:bg-white/[0.04] px-4 py-3">
                    <CalendarDays className="h-5 w-5 text-[#8b6a3e] dark:text-[#d7a25f] shrink-0" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-transparent text-sm text-[#1c1c19] dark:text-[#f8f1e7] outline-none"
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold text-[#8b7a6a] dark:text-[#9aa5b1] uppercase tracking-wider">Trả phòng</span>
                  <div className="flex items-center gap-2.5 rounded-xl border border-[#e8ddd0] dark:border-white/10 bg-[#faf7f2] dark:bg-white/[0.04] px-4 py-3">
                    <CalendarDays className="h-5 w-5 text-[#8b6a3e] dark:text-[#d7a25f] shrink-0" />
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent text-sm text-[#1c1c19] dark:text-[#f8f1e7] outline-none"
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold text-[#8b7a6a] dark:text-[#9aa5b1] uppercase tracking-wider">Số khách</span>
                  <div className="flex items-center gap-2.5 rounded-xl border border-[#e8ddd0] dark:border-white/10 bg-[#faf7f2] dark:bg-white/[0.04] px-4 py-3 relative">
                    <Users className="h-5 w-5 text-[#8b6a3e] dark:text-[#d7a25f] shrink-0" />
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full bg-transparent text-sm text-[#1c1c19] dark:text-[#f8f1e7] outline-none appearance-none cursor-pointer"
                    >
                      <option value="1">1 khách</option>
                      <option value="2">2 khách</option>
                      <option value="3">3 khách</option>
                      <option value="4">4 khách</option>
                    </select>
                    <ChevronDown className="h-4 w-4 text-[#8b6a3e] dark:text-[#d7a25f] absolute right-3 pointer-events-none" />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold text-[#8b7a6a] dark:text-[#9aa5b1] uppercase tracking-wider">Khoảng giá / đêm</span>
                  <div className="flex items-center gap-2.5 rounded-xl border border-[#e8ddd0] dark:border-white/10 bg-[#faf7f2] dark:bg-white/[0.04] px-4 py-3 relative">
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full bg-transparent text-sm text-[#1c1c19] dark:text-[#f8f1e7] outline-none appearance-none cursor-pointer"
                    >
                      <option value="all">Tất cả</option>
                      <option value="low">Dưới 1 triệu</option>
                      <option value="mid">1 - 2 triệu</option>
                      <option value="high">Trên 2 triệu</option>
                    </select>
                    <ChevronDown className="h-4 w-4 text-[#8b6a3e] absolute right-3 pointer-events-none" />
                  </div>
                </label>

                <button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c47a34] to-[#d4943c] text-white py-3 px-5 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all h-[48px]">
                  Kiểm tra phòng trống
                </button>
              </div>
            </div>

            {/* Section Title */}
            <div>
              <h2 className="text-2xl font-bold text-[#1c1c19] dark:text-[#f8f1e7]">Khám phá các loại phòng</h2>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <RoomCardSkeleton key={i} />)
                : displayRooms.map((room, i) => (
                    <RoomGridCard
                      key={room.id}
                      room={room}
                      isSelected={selectedRoom === i}
                      onSelect={() => setSelectedRoom(i)}
                    />
                  ))}
            </div>

            {/* Load More */}
            <div className="flex justify-center pt-2">
              <button className="flex items-center gap-2 text-sm font-semibold text-[#8b6a3e] dark:text-[#d7a25f] hover:text-[#c47a34] dark:hover:text-[#f6c86f] transition-colors">
                Xem thêm loại phòng
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN (Sidebar) ═══ */}
          <div className="hidden lg:block">
            {isLoading || !current
              ? <SidebarSkeleton />
              : <SidebarDetail room={current} />
            }
          </div>
        </div>
      </div>
    </section>
  );
}
