"use client";

import {
  Bath,
  BedDouble,
  Bookmark,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Shield,
  Snowflake,
  Tv,
  Users,
  Wifi,
  Wine,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { Pagination } from "@/components/ui/pagination";
import { getAllRooms, getBusyRoomIds, type RoomResponse } from "@/services/room-service";

const priceFormatter = new Intl.NumberFormat("vi-VN");
const ROOM_PAGE_SIZE = 8;

type FilterOption = {
  value: string;
  label: string;
  hint?: string;
};

type RoomSearchFilter = {
  stayType: string;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  stayHours: string;
  guestCount: string;
  priceRange: string;
};

const stayTypeOptions: FilterOption[] = [
  { value: "night", label: "Theo đêm", hint: "Nhận phòng - trả phòng" },
  { value: "hour", label: "Theo giờ", hint: "Chọn giờ bắt đầu" },
];

const guestOptions: FilterOption[] = [
  { value: "1", label: "1 khách" },
  { value: "2", label: "2 khách" },
  { value: "3", label: "3 khách" },
  { value: "4", label: "4 khách" },
  { value: "8", label: "8 khách" },
];

const priceOptions: FilterOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "low", label: "Dưới 1 triệu" },
  { value: "mid", label: "1 - 2 triệu" },
  { value: "high", label: "Trên 2 triệu" },
];

const hourOptions: FilterOption[] = [
  { value: "2", label: "2 giờ" },
  { value: "3", label: "3 giờ" },
  { value: "4", label: "4 giờ" },
  { value: "6", label: "6 giờ" },
  { value: "8", label: "8 giờ" },
];

const monthNames = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

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

function toLocalDateTimeValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateLabel(value: string) {
  const date = parseDateInput(value);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

function buildSearchWindow(filter: RoomSearchFilter) {
  if (filter.stayType === "hour") {
    const start = new Date(`${filter.checkIn}T${filter.checkInTime}:00`);
    const end = new Date(start);
    end.setHours(end.getHours() + Number(filter.stayHours || 1));

    return {
      start: toLocalDateTimeValue(start),
      end: toLocalDateTimeValue(end),
    };
  }

  return {
    start: `${filter.checkIn}T14:00:00`,
    end: `${filter.checkOut}T12:00:00`,
  };
}

function buildRoomDetailHref(roomId: string, filter: RoomSearchFilter) {
  const params = new URLSearchParams({
    stayType: filter.stayType,
    checkIn: filter.checkIn,
    checkOut: filter.checkOut,
    checkInTime: filter.checkInTime,
    stayHours: filter.stayHours,
    guests: filter.guestCount,
  });

  return `/room/roomdetail/${roomId}?${params.toString()}`;
}

function matchesPriceRange(room: MockRoom, stayType: string, priceRange: string) {
  if (priceRange === "all") {
    return true;
  }

  const price =
    stayType === "hour"
      ? Number(
          (room as MockRoom & { pricePerHour?: number }).pricePerHour ?? room.pricePerDay,
        )
      : room.pricePerDay;

  if (priceRange === "low") {
    return price < 1000000;
  }

  if (priceRange === "mid") {
    return price >= 1000000 && price <= 2000000;
  }

  return price > 2000000;
}

type MockRoom = {
  id: string;
  name: string;
  image: string;
  pricePerDay: number;
  pricePerHour?: number;
  maxGuests: number;
  available: number;
  badge?: string;
  amenities: string[];
  description: string;
  detailDescription: string;
  gallery: string[];
  detailAmenities: Array<{ icon: string; label: string }>;
};

function getAmenityIcon(icon: string) {
  const cls = "h-4 w-4 text-[#7a6548] dark:text-[#d7a25f]";
  switch (icon) {
    case "bed":
      return <BedDouble className={cls} />;
    case "bath":
      return <Bath className={cls} />;
    case "wifi":
      return <Wifi className={cls} />;
    case "tv":
      return <Tv className={cls} />;
    case "minibar":
      return <Wine className={cls} />;
    case "ac":
      return <Snowflake className={cls} />;
    case "safe":
      return <Shield className={cls} />;
    case "coffee":
      return <Coffee className={cls} />;
    default:
      return <Wifi className={cls} />;
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
  if (lower.includes("wifi") || lower.includes("wi-fi") || lower.includes("internet"))
    return "wifi";
  if (lower.includes("bed") || lower.includes("giường") || lower.includes("nệm"))
    return "bed";
  if (lower.includes("bath") || lower.includes("tắm") || lower.includes("bồn"))
    return "bath";
  if (lower.includes("tv") || lower.includes("tivi") || lower.includes("truyền hình"))
    return "tv";
  if (lower.includes("minibar") || lower.includes("bar") || lower.includes("rượu"))
    return "minibar";
  if (
    lower.includes("điều hòa") ||
    lower.includes("máy lạnh") ||
    lower.includes("ac")
  )
    return "ac";
  if (lower.includes("két") || lower.includes("safe") || lower.includes("an toàn"))
    return "safe";
  if (
    lower.includes("coffee") ||
    lower.includes("cà phê") ||
    lower.includes("ấm") ||
    lower.includes("nước")
  )
    return "coffee";
  return "wifi";
}

function convertApiRooms(rooms: RoomResponse[]): MockRoom[] {
  return rooms.map((room, index) => {
    const galleryImages = buildRoomGallery(room, index);
    const mainImage = galleryImages[0];
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
      description:
        room.roomTypes?.description ||
        room.description ||
        "Trải nghiệm nghỉ dưỡng cao cấp",
      detailDescription:
        room.description ||
        room.roomTypes?.description ||
        "Không gian nghỉ dưỡng sang trọng với đầy đủ tiện nghi chuẩn 5 sao.",
      gallery: galleryImages,
      detailAmenities:
        amenityNames.length > 0
          ? amenityNames.map((name) => ({ icon: mapAmenityIcon(name), label: name }))
          : [
              { icon: "wifi", label: "Wi-Fi" },
              { icon: "bed", label: "Giường" },
              { icon: "bath", label: "Phòng tắm" },
            ],
    } as MockRoom;
  });
}

function buildRoomGallery(room: RoomResponse, index: number): string[] {
  const imageMap = new Map<string, string>();
  const addImage = (url?: string) => {
    if (url) {
      imageMap.set(url, url);
    }
  };

  addImage(room.image);
  [...(room.images ?? [])]
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
    .forEach((image) => addImage(image.url));
  (room.galleryImages ?? []).forEach(addImage);
  fallbackImages.slice(index).forEach(addImage);
  fallbackImages.slice(0, index).forEach(addImage);

  return Array.from(imageMap.values()).slice(0, 5);
}

/* ─── Loading Skeletons ─── */
function RoomCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white dark:border-white/10 dark:bg-white/[0.05]">
      <div className="aspect-[4/3] bg-[#e8ddd0] dark:bg-white/10" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-2/3 rounded bg-[#e8ddd0] dark:bg-white/10" />
        <div className="h-5 w-1/2 rounded bg-[#e8ddd0] dark:bg-white/10" />
        <div className="h-4 w-3/4 rounded bg-[#e8ddd0] dark:bg-white/10" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 rounded bg-[#e8ddd0] dark:bg-white/10" />
          <div className="h-5 w-14 rounded bg-[#e8ddd0] dark:bg-white/10" />
        </div>
        <div className="h-10 rounded-lg bg-[#e8ddd0] dark:bg-white/10" />
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="lg:sticky lg:top-20">
      <div className="animate-pulse overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white dark:border-white/10 dark:bg-white/[0.05]">
        <div className="px-5 pt-5 pb-2">
          <div className="h-6 w-24 rounded-full bg-[#e8ddd0] dark:bg-white/10" />
        </div>
        <div className="space-y-2 px-5 pb-4">
          <div className="h-6 w-2/3 rounded bg-[#e8ddd0] dark:bg-white/10" />
          <div className="h-4 w-full rounded bg-[#e8ddd0] dark:bg-white/10" />
          <div className="h-6 w-1/2 rounded bg-[#e8ddd0] dark:bg-white/10" />
        </div>
        <div className="px-5">
          <div className="aspect-[4/3] rounded-xl bg-[#e8ddd0] dark:bg-white/10" />
        </div>
        <div className="flex gap-2 px-5 py-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 w-16 shrink-0 rounded-lg bg-[#e8ddd0] dark:bg-white/10"
            />
          ))}
        </div>
        <div className="space-y-2 px-5 pb-5">
          <div className="h-4 w-1/3 rounded bg-[#e8ddd0] dark:bg-white/10" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-5 rounded bg-[#e8ddd0] dark:bg-white/10" />
            ))}
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="h-12 rounded-xl bg-[#e8ddd0] dark:bg-white/10" />
        </div>
      </div>
    </aside>
  );
}

/* ─── Sidebar Detail Card ─── */
function SidebarDetail({ room, bookingHref }: { room: MockRoom; bookingHref: string }) {
  const [mainImg, setMainImg] = useState(0);
  const thumbRef = useRef<HTMLDivElement>(null);

  return (
    <aside className="space-y-0 lg:sticky lg:top-20">
      <div className="overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white shadow-[0_8px_40px_-16px_rgba(120,90,50,0.13)] dark:border-white/10 dark:bg-white/[0.05] dark:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-[#8b6a3e] dark:text-[#d7a25f]" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8b6a3e]/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#8b6a3e] dark:bg-[#d7a25f]/15 dark:text-[#d7a25f]">
              Đang xem
            </span>
          </div>
        </div>

        {/* Title & Price */}
        <div className="space-y-2 px-5 pb-4">
          <h3 className="font-serif text-xl font-bold text-[#1c1c19] dark:text-[#f8f1e7]">
            {room.name}
          </h3>
          <p className="text-sm text-[#6b5e50] dark:text-[#c9b8a4]">{room.description}</p>
          <p className="text-lg font-bold text-[#c47a34] dark:text-[#f6c86f]">
            Từ {priceFormatter.format(room.pricePerDay)}đ{" "}
            <span className="text-sm font-normal text-[#8b7a6a] dark:text-[#9aa5b1]">
              / đêm
            </span>
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
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <img
              src={room.gallery[mainImg]}
              alt={room.name}
              className="h-full w-full object-cover transition-all duration-500"
            />
          </div>
        </div>

        {/* Thumbnail Gallery */}
        <div className="px-5 py-3">
          <div ref={thumbRef} className="scrollbar-hide flex gap-2 overflow-x-auto">
            {room.gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImg(i)}
                className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  mainImg === i
                    ? "border-[#c47a34] shadow-md"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
            {room.gallery.length > 4 && (
              <button className="flex h-12 w-8 shrink-0 items-center justify-center text-[#8b6a3e] hover:text-[#c47a34] dark:text-[#d7a25f]">
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Amenities */}
        <div className="px-5 pb-4">
          <p className="mb-3 text-sm font-semibold text-[#1c1c19] dark:text-[#f8f1e7]">
            Tiện nghi nổi bật
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {(room.detailAmenities || []).map((a) => (
              <span
                key={a.label}
                className="flex items-center gap-2 text-sm text-[#5a4d3e] dark:text-[#c9b8a4]"
              >
                {getAmenityIcon(a.icon)}
                {a.label}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="px-5 pb-5">
          <p className="mb-2 text-sm font-semibold text-[#1c1c19] dark:text-[#f8f1e7]">
            Mô tả
          </p>
          <p className="text-sm leading-relaxed text-[#6b5e50] dark:text-[#c9b8a4]">
            {room.detailDescription}
          </p>
        </div>

        {/* CTA */}
        <div className="px-5 pb-5">
          <Link
            href={bookingHref}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#865316] to-[#c68948] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#865316]/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
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
  bookingHref,
}: {
  room: MockRoom;
  isSelected: boolean;
  onSelect: () => void;
  bookingHref: string;
}) {
  return (
    <article
      onClick={onSelect}
      className={`cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-[0_4px_24px_-8px_rgba(120,90,50,0.1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_-8px_rgba(120,90,50,0.18)] dark:bg-white/[0.05] dark:shadow-none ${
        isSelected
          ? "border-[#c47a34] ring-1 ring-[#c47a34]/30"
          : "border-[#e8ddd0] dark:border-white/10"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {room.badge && (
          <span className="absolute top-3 left-3 rounded-md bg-[#c47a34] px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
            {room.badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-3 p-4">
        <h3 className="text-base font-bold text-[#1c1c19] dark:text-[#f8f1e7]">
          {room.name}
        </h3>
        <p className="font-bold text-[#c47a34] dark:text-[#f6c86f]">
          Từ {priceFormatter.format(room.pricePerDay)}đ{" "}
          <span className="text-xs font-normal text-[#8b7a6a] dark:text-[#9aa5b1]">
            / đêm
          </span>
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
            <span
              key={a}
              className="rounded-md bg-[#f5efe6] px-2 py-0.5 text-[11px] font-medium text-[#6b5e50] dark:bg-white/10 dark:text-[#c9b8a4]"
            >
              {a}
            </span>
          ))}
        </div>

        <Link
          href={bookingHref}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 flex w-full items-center justify-center rounded-lg border border-[#c47a34] py-2.5 text-sm font-semibold text-[#c47a34] transition-all hover:bg-[#c47a34] hover:text-white dark:border-[#f6c86f] dark:text-[#f6c86f] dark:hover:bg-[#f6c86f] dark:hover:text-[#0b0f17]"
        >
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
}

/* ─── Main Page ─── */
function FilterDropdown({
  label,
  icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon?: ReactNode;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full space-y-1.5 sm:w-[155px]">
      <span className="text-xs font-semibold tracking-wider text-[#8b7a6a] uppercase dark:text-[#9aa5b1]">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-[52px] w-full items-center gap-2 rounded-xl border px-3 text-left transition-all ${
          open
            ? "border-[#c47a34] bg-white shadow-[0_12px_30px_-20px_rgba(134,83,22,0.55)] ring-2 ring-[#c47a34]/15 dark:bg-white/[0.08]"
            : "border-[#e8ddd0] bg-[#faf7f2] hover:border-[#d8b98c] dark:border-white/10 dark:bg-white/[0.04]"
        }`}
      >
        {icon}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[#1c1c19] dark:text-[#f8f1e7]">
            {selected?.label}
          </span>
          {selected?.hint ? (
            <span className="mt-0.5 block truncate text-[11px] text-[#9b8b7a] dark:text-[#9aa5b1]">
              {selected.hint}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#8b6a3e] transition-transform dark:text-[#d7a25f] ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden rounded-2xl border border-[#e4d2bd] bg-white p-2 shadow-[0_20px_50px_-24px_rgba(64,38,12,0.45)] dark:border-white/10 dark:bg-[#141923]">
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                  active
                    ? "bg-[#f4e6d4] text-[#7b4513] dark:bg-[#d7a25f]/15 dark:text-[#f6c86f]"
                    : "text-[#4f4438] hover:bg-[#faf3ea] dark:text-[#c9b8a4] dark:hover:bg-white/[0.06]"
                }`}
              >
                <span>
                  <span className="block text-sm font-semibold">{option.label}</span>
                  {option.hint ? (
                    <span className="block text-[11px] opacity-70">{option.hint}</span>
                  ) : null}
                </span>
                {active ? <span className="h-2 w-2 rounded-full bg-[#c47a34]" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => parseDateInput(value));
  const rootRef = useRef<HTMLDivElement>(null);
  const todayValue = toDateInputValue(new Date());

  useEffect(() => {
    setVisibleMonth(parseDateInput(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const changeMonth = (amount: number) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  return (
    <div ref={rootRef} className="relative w-full space-y-1.5 sm:w-[155px]">
      <span className="text-xs font-semibold tracking-wider text-[#8b7a6a] uppercase dark:text-[#9aa5b1]">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-[52px] w-full items-center gap-2 rounded-xl border px-3 text-left transition-all ${
          open
            ? "border-[#c47a34] bg-white shadow-[0_12px_30px_-20px_rgba(134,83,22,0.55)] ring-2 ring-[#c47a34]/15 dark:bg-white/[0.08]"
            : "border-[#e8ddd0] bg-[#faf7f2] hover:border-[#d8b98c] dark:border-white/10 dark:bg-white/[0.04]"
        }`}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-[#c47a34]" />
        <span className="flex-1 text-sm font-semibold text-[#1c1c19] dark:text-[#f8f1e7]">
          {formatDateLabel(value)}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#8b6a3e] transition-transform dark:text-[#d7a25f] ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="absolute top-full left-0 z-40 mt-3 w-[min(310px,calc(100vw-2rem))] rounded-3xl border border-[#ead8c4] bg-white p-4 shadow-[0_28px_70px_-28px_rgba(64,38,12,0.55)] dark:border-white/10 dark:bg-[#141923]">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fbf5ed] text-[#8b6a3e] transition-colors hover:bg-[#f0dec6] dark:bg-white/[0.06] dark:text-[#d7a25f]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-center">
              <p className="text-sm font-black text-[#1c1c19] dark:text-[#f8f1e7]">
                {monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
              </p>
              <p className="text-[11px] font-medium text-[#a58b70]">
                Chọn ngày lưu trú
              </p>
            </div>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fbf5ed] text-[#8b6a3e] transition-colors hover:bg-[#f0dec6] dark:bg-white/[0.06] dark:text-[#d7a25f]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((day) => (
              <span
                key={day}
                className="py-2 text-[11px] font-bold text-[#b08f6c] uppercase"
              >
                {day}
              </span>
            ))}
            {getCalendarDays(visibleMonth).map((date) => {
              const dateValue = toDateInputValue(date);
              const isSelected = dateValue === value;
              const isToday = dateValue === todayValue;
              const inCurrentMonth = date.getMonth() === visibleMonth.getMonth();

              return (
                <button
                  key={dateValue}
                  type="button"
                  onClick={() => {
                    onChange(dateValue);
                    setOpen(false);
                  }}
                  className={`flex h-9 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                    isSelected
                      ? "bg-gradient-to-br from-[#c47a34] to-[#ffd45e] text-white shadow-lg shadow-[#c47a34]/25"
                      : inCurrentMonth
                        ? "text-[#2b251f] hover:bg-[#fbf0e3] dark:text-[#f8f1e7] dark:hover:bg-white/[0.08]"
                        : "text-[#c9b9a8] hover:bg-[#fbf0e3]/60 dark:text-[#657082]"
                  }`}
                >
                  <span
                    className={
                      isToday && !isSelected
                        ? "rounded-full border border-[#c47a34] px-2 py-0.5"
                        : ""
                    }
                  >
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function RoomListPage() {
  const [selectedRoom, setSelectedRoom] = useState(0);
  const [stayType, setStayType] = useState("night");
  const [checkIn, setCheckIn] = useState(() => toDateInputValue(new Date()));
  const [checkOut, setCheckOut] = useState(() => toDateInputValue(addDays(new Date(), 2)));
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [stayHours, setStayHours] = useState("3");
  const [guestCount, setGuestCount] = useState("2");
  const [priceRange, setPriceRange] = useState("all");
  const [displayRooms, setDisplayRooms] = useState<MockRoom[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<RoomSearchFilter | null>(null);

  useEffect(() => {
    setIsLoading(true);

    async function loadRooms() {
      try {
        if (!activeFilter) {
          const { data, total } = await getAllRooms(currentPage, ROOM_PAGE_SIZE);
          setDisplayRooms(convertApiRooms(data));
          setTotalRooms(total);
          setSelectedRoom(0);
          return;
        }

        const { start, end } = buildSearchWindow(activeFilter);
        const [{ data }, busyRoomIds] = await Promise.all([
          getAllRooms(0, 500),
          getBusyRoomIds(start, end),
        ]);
        const busyRoomSet = new Set(busyRoomIds);
        const guestCountNumber = Number(activeFilter.guestCount || 1);
        const sourceRooms = convertApiRooms(data);
        const filteredRooms = sourceRooms.filter((room) => {
          if (busyRoomSet.has(room.id)) {
            return false;
          }

          if (room.maxGuests < guestCountNumber) {
            return false;
          }

          return matchesPriceRange(room, activeFilter.stayType, activeFilter.priceRange);
        });
        const pageStart = currentPage * ROOM_PAGE_SIZE;

        setDisplayRooms(filteredRooms.slice(pageStart, pageStart + ROOM_PAGE_SIZE));
        setTotalRooms(filteredRooms.length);
        setSelectedRoom(0);
      } catch {
        setDisplayRooms([]);
        setTotalRooms(0);
        setSelectedRoom(0);
      } finally {
        setIsLoading(false);
      }
    }

    loadRooms();
  }, [currentPage, activeFilter]);

  const handleSearch = () => {
    if (isLoading) return;
    setCurrentPage(0);
    setActiveFilter({
      stayType,
      checkIn,
      checkOut,
      checkInTime,
      stayHours,
      guestCount,
      priceRange,
    });
  };

  const current = displayRooms[selectedRoom] ?? displayRooms[0];
  const bookingFilter: RoomSearchFilter = activeFilter ?? {
    stayType,
    checkIn,
    checkOut,
    checkInTime,
    stayHours,
    guestCount,
    priceRange,
  };

  return (
    <section className="min-h-screen bg-[#fdfaf5] pt-16 pb-16 sm:pt-20 sm:pb-20 dark:bg-[#0b0f17]">
      <div className="mx-auto w-full max-w-none px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_420px] lg:gap-12">
          {/* ═══ LEFT COLUMN ═══ */}
          <div className="space-y-10">
            {/* Hero Header */}
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-base font-semibold tracking-wide text-[#8b6a3e] dark:text-[#d7a25f]">
                  Phòng & Suite
                </span>
                <span className="h-px flex-1 bg-[#d6c3b0] dark:bg-white/15" />
                <span className="text-xl text-[#c47a34] dark:text-[#f6c86f]">✦</span>
              </div>
              <h1 className="max-w-2xl font-serif text-4xl leading-[1.08] font-bold text-[#1c1c19] sm:text-5xl md:text-6xl lg:text-[3.5rem] dark:text-[#f8f1e7]">
                Chọn không gian
                <br />
                nghỉ dưỡng của bạn
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-[#6b5e50] md:text-lg dark:text-[#c9b8a4]">
                Bạn chọn loại phòng phù hợp với nhu cầu,
                <br />
                Continental sẽ tự sắp xếp phòng phù hợp nhất cho kỳ nghỉ
                của bạn.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="relative z-20 rounded-[1.5rem] border border-[#ead8c4] bg-white/90 p-4 shadow-[0_24px_70px_-40px_rgba(82,52,22,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
              <div className="flex flex-wrap items-end gap-3 xl:flex-nowrap">
                <div className="h-[52px] w-full rounded-xl bg-[#fbf5ed] p-1 sm:w-[220px] dark:bg-white/[0.05]">
                  <div className="grid h-full grid-cols-2 gap-1">
                    {stayTypeOptions.map((option) => {
                      const active = stayType === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setStayType(option.value)}
                          className={`flex h-full items-center justify-center gap-1.5 rounded-lg px-2 text-center text-sm font-bold transition-all ${
                            active
                              ? "bg-[#1f1b16] text-white shadow-lg shadow-[#1f1b16]/15 dark:bg-[#d7a25f] dark:text-[#16110b]"
                              : "text-[#8b7a6a] hover:bg-white dark:text-[#c9b8a4] dark:hover:bg-white/[0.08]"
                          }`}
                        >
                          <Clock className="h-4 w-4 shrink-0" />
                          <span className="whitespace-nowrap">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <DatePickerField
                  label="Nhận phòng"
                  value={checkIn}
                  onChange={setCheckIn}
                />

                <label className="hidden rounded-2xl border border-[#ecdcc9] bg-[#fffaf3] px-4 py-3 transition-colors focus-within:border-[#c47a34] focus-within:ring-2 focus-within:ring-[#c47a34]/15 dark:border-white/10 dark:bg-white/[0.04]">
                  <span className="block text-[11px] font-bold tracking-[0.2em] text-[#c69b71] uppercase">
                    Nhận phòng
                  </span>
                  <span className="mt-2 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-[#c47a34]" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#1c1c19] outline-none dark:text-[#f8f1e7]"
                    />
                  </span>
                </label>

                {stayType === "night" ? (
                  <>
                    <DatePickerField
                      label="Trả phòng"
                      value={checkOut}
                      onChange={setCheckOut}
                    />

                    <label className="hidden rounded-2xl border border-[#ecdcc9] bg-[#fffaf3] px-4 py-3 transition-colors focus-within:border-[#c47a34] focus-within:ring-2 focus-within:ring-[#c47a34]/15 dark:border-white/10 dark:bg-white/[0.04]">
                      <span className="block text-[11px] font-bold tracking-[0.2em] text-[#c69b71] uppercase">
                        Trả phòng
                      </span>
                      <span className="mt-2 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0 text-[#c47a34]" />
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#1c1c19] outline-none dark:text-[#f8f1e7]"
                        />
                      </span>
                    </label>
                  </>
                ) : (
                  <label className="w-full space-y-1.5 sm:w-[155px]">
                    <span className="block text-xs font-semibold tracking-wider text-[#8b7a6a] uppercase dark:text-[#9aa5b1]">
                      Giờ bắt đầu
                    </span>
                    <span className="flex h-[52px] items-center gap-2 rounded-xl border border-[#e8ddd0] bg-[#faf7f2] px-3 text-left transition-all focus-within:border-[#c47a34] focus-within:ring-2 focus-within:ring-[#c47a34]/15 hover:border-[#d8b98c] dark:border-white/10 dark:bg-white/[0.04]">
                      <Clock className="h-4 w-4 shrink-0 text-[#c47a34]" />
                      <input
                        type="time"
                        value={checkInTime}
                        onChange={(e) => setCheckInTime(e.target.value)}
                        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#1c1c19] [color-scheme:light] outline-none dark:text-[#f8f1e7]"
                      />
                    </span>
                  </label>
                )}

                {stayType === "hour" ? (
                  <FilterDropdown
                    label="Số giờ"
                    icon={
                      <Clock className="h-5 w-5 shrink-0 text-[#8b6a3e] dark:text-[#d7a25f]" />
                    }
                    value={stayHours}
                    options={hourOptions}
                    onChange={setStayHours}
                  />
                ) : null}

                <FilterDropdown
                  label="Số khách"
                  icon={
                    <Users className="h-5 w-5 shrink-0 text-[#8b6a3e] dark:text-[#d7a25f]" />
                  }
                  value={guestCount}
                  options={guestOptions}
                  onChange={setGuestCount}
                />

                <FilterDropdown
                  label={
                    stayType === "night"
                      ? "Khoảng giá / đêm"
                      : "Khoảng giá / giờ"
                  }
                  value={priceRange}
                  options={priceOptions}
                  onChange={setPriceRange}
                />

                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="h-[52px] w-full rounded-xl bg-gradient-to-r from-[#c47a34] to-[#ffd45e] px-5 text-sm font-black text-white shadow-[0_16px_36px_-20px_rgba(196,122,52,0.8)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-22px_rgba(196,122,52,0.95)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[190px] xl:shrink-0"
                >
                  {isLoading ? "Đang kiểm tra..." : "Kiểm tra phòng trống"}
                </button>
              </div>
            </div>

            <div className="hidden">
              <div className="rounded-2xl border border-[#e8ddd0] bg-white p-5 shadow-[0_4px_20px_-8px_rgba(120,90,50,0.08)] md:p-6 dark:border-white/10 dark:bg-white/[0.05] dark:shadow-none">
                <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 xl:grid-cols-6">
                  <FilterDropdown
                    label="Kiểu lưu trú"
                    icon={
                      <Clock className="h-5 w-5 shrink-0 text-[#8b6a3e] dark:text-[#d7a25f]" />
                    }
                    value={stayType}
                    options={stayTypeOptions}
                    onChange={setStayType}
                  />
                  <label className="space-y-2">
                    <span className="text-xs font-semibold tracking-wider text-[#8b7a6a] uppercase dark:text-[#9aa5b1]">
                      Nhận phòng
                    </span>
                    <div className="flex items-center gap-2.5 rounded-xl border border-[#e8ddd0] bg-[#faf7f2] px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                      <CalendarDays className="h-5 w-5 shrink-0 text-[#8b6a3e] dark:text-[#d7a25f]" />
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full bg-transparent text-sm text-[#1c1c19] outline-none dark:text-[#f8f1e7]"
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold tracking-wider text-[#8b7a6a] uppercase dark:text-[#9aa5b1]">
                      Trả phòng
                    </span>
                    <div className="flex items-center gap-2.5 rounded-xl border border-[#e8ddd0] bg-[#faf7f2] px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                      <CalendarDays className="h-5 w-5 shrink-0 text-[#8b6a3e] dark:text-[#d7a25f]" />
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full bg-transparent text-sm text-[#1c1c19] outline-none dark:text-[#f8f1e7]"
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold tracking-wider text-[#8b7a6a] uppercase dark:text-[#9aa5b1]">
                      Số khách
                    </span>
                    <div className="relative flex items-center gap-2.5 rounded-xl border border-[#e8ddd0] bg-[#faf7f2] px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                      <Users className="h-5 w-5 shrink-0 text-[#8b6a3e] dark:text-[#d7a25f]" />
                      <select
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        className="w-full cursor-pointer appearance-none bg-transparent text-sm text-[#1c1c19] outline-none dark:text-[#f8f1e7]"
                      >
                        <option value="1">1 khách</option>
                        <option value="2">2 khách</option>
                        <option value="3">3 khách</option>
                        <option value="4">4 khách</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[#8b6a3e] dark:text-[#d7a25f]" />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold tracking-wider text-[#8b7a6a] uppercase dark:text-[#9aa5b1]">
                      Khoảng giá / đêm
                    </span>
                    <div className="relative flex items-center gap-2.5 rounded-xl border border-[#e8ddd0] bg-[#faf7f2] px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                      <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-full cursor-pointer appearance-none bg-transparent text-sm text-[#1c1c19] outline-none dark:text-[#f8f1e7]"
                      >
                        <option value="all">Tất cả</option>
                        <option value="low">Dưới 1 triệu</option>
                        <option value="mid">1 - 2 triệu</option>
                        <option value="high">Trên 2 triệu</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[#8b6a3e]" />
                    </div>
                  </label>

                  <button className="flex h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c47a34] to-[#d4943c] px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    Kiểm tra phòng trống
                  </button>
                </div>
              </div>
            </div>

            {/* Section Title */}
            <div>
              <h2 className="text-2xl font-bold text-[#1c1c19] dark:text-[#f8f1e7]">
                Khám phá các loại phòng
              </h2>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <RoomCardSkeleton key={i} />)
                : displayRooms.map((room, i) => (
                    <RoomGridCard
                      key={room.id}
                      room={room}
                      isSelected={selectedRoom === i}
                      onSelect={() => setSelectedRoom(i)}
                      bookingHref={buildRoomDetailHref(room.id, bookingFilter)}
                    />
                  ))}
            </div>

            {!isLoading && displayRooms.length === 0 ? (
              <div className="rounded-2xl border border-[#e8ddd0] bg-white p-8 text-center text-[#6f5d4b] dark:border-white/10 dark:bg-white/[0.05] dark:text-[#cdbda8]">
                Không có phòng phù hợp trong hệ thống.
              </div>
            ) : null}

            {!isLoading ? (
              <Pagination
                page={currentPage}
                total={totalRooms}
                pageSize={ROOM_PAGE_SIZE}
                itemLabel="phòng"
                onPageChange={setCurrentPage}
              />
            ) : null}
          </div>

          {/* ═══ RIGHT COLUMN (Sidebar) ═══ */}
          <div className="hidden lg:block">
            {isLoading || !current ? (
              <SidebarSkeleton />
            ) : (
              <SidebarDetail
                room={current}
                bookingHref={buildRoomDetailHref(current.id, bookingFilter)}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
