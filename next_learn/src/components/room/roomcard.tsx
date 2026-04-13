import Link from "next/link";

import { cn } from "@/lib/utils";

export type AmenityEntity = {
  id: string;
  name: string;
  description?: string | null;
  status?: string | null;
};

export type AmenityRoomEntity = {
  id: string;
  amenity?: AmenityEntity | null;
};

export type RoomTypeEntity = {
  id: string;
  name: string;
  description?: string | null;
  maximumOccupancy: number;
  quantity: number;
  amenityRooms?: AmenityRoomEntity[];
};

export type RoomImageEntity = {
  id: string;
  objId: string;
  url: string;
  createdTime?: string | null;
};

export type RoomEntity = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  images?: RoomImageEntity[];
  roomSize: string;
  pricePerDay: number;
  pricePerHour: number;
  address: string;
  status: string;
  roomTypes?: RoomTypeEntity | null;
};

export interface RoomCardProps {
  room: RoomEntity;
  badge?: string;
  href?: string;
  buttonLabel?: string;
  imagePosition?: "left" | "right";
  className?: string;
}

const priceFormatter = new Intl.NumberFormat("vi-VN");

export function RoomCard({
  room,
  badge = "BEST SELLER",
  href,
  buttonLabel = "Xem chi tiết",
  imagePosition = "left",
  className,
}: RoomCardProps) {
  const isImageRight = imagePosition === "right";
  const displayImage = room.image || room.images?.[0]?.url || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80";
  const occupancy = room.roomTypes?.maximumOccupancy;
  const roomTypeName = room.roomTypes?.name;
  const amenityLabels = (room.roomTypes?.amenityRooms ?? [])
    .map((item) => item.amenity?.name)
    .filter((item): item is string => Boolean(item))
    .slice(0, 2);
  const roomDetailLink = href || `/room/roomdetail/${room.id}`;

  return (
    <article
      className={cn(
        "border-border/50 bg-background overflow-hidden rounded-[28px] border p-4 shadow-[0_20px_60px_-36px_rgba(31,41,55,0.35)]",
        className,
      )}
    >
      <div
        className={cn(
          "grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-stretch",
          isImageRight && "lg:grid-flow-dense",
        )}
      >
        <div
          className={cn(
            "relative min-h-[320px] overflow-hidden rounded-[22px] bg-muted",
            isImageRight && "lg:col-start-2",
          )}
        >
          <img
            src={displayImage}
            alt={room.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </div>

        <div
          className={cn(
            "flex flex-col justify-between px-2 py-1 lg:px-3 lg:py-2",
            isImageRight && "lg:col-start-1 lg:row-start-1",
          )}
        >
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-ring text-sm font-semibold tracking-[0.22em] uppercase">
                ★ {badge}
              </p>
              <h3 className="text-foreground max-w-[11ch] text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] font-serif font-medium tracking-[-0.04em]">
                {room.name}
              </h3>
              <p className="text-muted-foreground max-w-md text-base leading-7">
                {room.description || room.roomTypes?.description || "Trải nghiệm nghỉ dưỡng cao cấp với đầy đủ tiện nghi chuẩn 5 sao."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="bg-muted text-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm">
                <span aria-hidden="true">🛏</span>
                {occupancy ? `${occupancy} Guests` : "King Size"}
              </span>
              <span className="bg-muted text-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm">
                <span aria-hidden="true">◫</span>
                {room.roomSize}
              </span>
              {roomTypeName ? (
                <span
                  key={roomTypeName}
                  className="bg-muted text-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm"
                >
                  <span aria-hidden="true">✦</span>
                  {roomTypeName}
                </span>
              ) : null}
              {amenityLabels.map((label) => (
                <span
                  key={label}
                  className="bg-muted text-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm"
                >
                  <span aria-hidden="true">•</span>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-border/70 pt-5">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
              Chỉ từ
            </p>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-ring flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-[-0.04em]">
                    {priceFormatter.format(room.pricePerDay)}đ
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">/ đêm</p>
                <p className="text-muted-foreground mt-2 text-sm">{room.address}</p>
              </div>

              <Link
                href={roomDetailLink}
                className="bg-muted text-foreground inline-flex min-h-14 min-w-32 items-center justify-center rounded-full border border-border/70 px-6 py-3 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5 hover:bg-muted/80"
              >
                {buttonLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}