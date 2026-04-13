export type RoomGalleryImages = {
  main: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
};

export type RoomDetailGalleryProps = {
  title: string;
  images: RoomGalleryImages;
};

export function RoomDetailGallery({ title, images }: RoomDetailGalleryProps) {
  return (
    <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_350px]">
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-muted">
        <img src={images.main} alt={title} className="h-full min-h-[400px] w-full object-cover" />
      </div>

      <div className="grid gap-3">
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-muted">
          <img
            src={images.topRight}
            alt={`${title} - chi tiet phong tam`}
            className="h-[190px] w-full object-cover"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-muted">
            <img
              src={images.bottomLeft}
              alt={`${title} - khu tiep khach`}
              className="h-[190px] w-full object-cover"
            />
          </div>
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-muted">
            <img
              src={images.bottomRight}
              alt={`${title} - chi tiet noi that`}
              className="h-[190px] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
