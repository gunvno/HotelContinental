import { MapPin } from "lucide-react";

export type RoomDetailHeroProps = {
  label: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
};

const currencyFormatter = new Intl.NumberFormat("vi-VN");

export function RoomDetailHero({
  label,
  title,
  description,
  location,
  pricePerNight,
}: RoomDetailHeroProps) {
  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
      <div className="space-y-5">
        <span className="bg-ring/15 text-ring inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.2em] uppercase">
          {label}
        </span>
        <h1 className="text-foreground max-w-xl font-serif text-[clamp(2.8rem,7vw,5.4rem)] leading-[0.92] font-semibold tracking-[-0.04em]">
          {title}
        </h1>
        <p className="text-muted-foreground max-w-xl text-[17px] leading-8">{description}</p>
      </div>

      <div className="space-y-4 border-l border-border/60 pl-6 lg:pb-2">
        <p className="text-ring inline-flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4" />
          {location}
        </p>
        <div className="text-foreground flex items-end gap-2">
          <span className="text-4xl font-semibold tracking-[-0.03em]">
            {currencyFormatter.format(pricePerNight)} VND
          </span>
          <span className="text-muted-foreground pb-1 text-base">/ đêm</span>
        </div>
      </div>
    </section>
  );
}
