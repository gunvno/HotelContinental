import { Bath, Coffee, ConciergeBell, Monitor, Wifi } from "lucide-react";

export type RoomAmenityItem = {
  title: string;
  description: string;
  icon: "wifi" | "mini-bar" | "bath" | "coffee" | "butler" | "tv";
};

export type RoomDetailAmenitiesProps = {
  title: string;
  items: RoomAmenityItem[];
};

function resolveIcon(icon: RoomAmenityItem["icon"]) {
  switch (icon) {
    case "wifi":
      return <Wifi className="h-5 w-5" />;
    case "mini-bar":
      return <Coffee className="h-5 w-5" />;
    case "bath":
      return <Bath className="h-5 w-5" />;
    case "coffee":
      return <Coffee className="h-5 w-5" />;
    case "butler":
      return <ConciergeBell className="h-5 w-5" />;
    case "tv":
      return <Monitor className="h-5 w-5" />;
    default:
      return <Wifi className="h-5 w-5" />;
  }
}

export function RoomDetailAmenities({ title, items }: RoomDetailAmenitiesProps) {
  return (
    <section className="space-y-6">
      <h3 className="text-foreground font-serif text-4xl font-semibold">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.title}
            className="border-border/60 bg-background rounded-2xl border p-5 shadow-[0_16px_40px_-30px_rgba(31,41,55,0.35)]"
          >
            <span className="text-ring inline-flex">{resolveIcon(item.icon)}</span>
            <h4 className="text-foreground mt-4 text-lg font-semibold">{item.title}</h4>
            <p className="text-muted-foreground mt-2 text-sm leading-6">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
