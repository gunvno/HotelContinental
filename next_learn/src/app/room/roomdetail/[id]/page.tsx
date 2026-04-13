"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BedDouble, Eye, Ruler, Users } from "lucide-react";

import {
	RoomDetailAmenities,
} from "@/components/room/detail/room-detail-amenities";
import { RoomDetailBookingCard } from "@/components/room/detail/room-detail-booking-card";
import {
	RoomDetailGallery,
} from "@/components/room/detail/room-detail-gallery";
import { RoomDetailHero } from "@/components/room/detail/room-detail-hero";
import { getRoomDetail, type RoomDetailData } from "@/services/room-detail-service";

function getIconComponent(iconType: string) {
	switch (iconType) {
		case "area":
			return <Ruler className="h-4 w-4" />;
		case "users":
			return <Users className="h-4 w-4" />;
		case "bed":
			return <BedDouble className="h-4 w-4" />;
		case "view":
			return <Eye className="h-4 w-4" />;
		default:
			return <Ruler className="h-4 w-4" />;
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

		if (roomId) {
			loadRoomDetail();
		}
	}, [roomId]);

	if (isLoading) {
		return (
			<main className="bg-background">
				<section className="mx-auto w-full max-w-[1380px] px-6 py-10 sm:px-8 lg:px-12 xl:px-16">
					<div className="animate-pulse space-y-10">
						<div className="h-48 rounded-2xl bg-muted" />
						<div className="h-32 rounded-2xl bg-muted" />
						<div className="h-64 rounded-2xl bg-muted" />
					</div>
				</section>
			</main>
		);
	}

	if (error || !roomData) {
		return (
			<main className="bg-background">
				<section className="mx-auto w-full max-w-[1380px] px-6 py-10 sm:px-8 lg:px-12 xl:px-16">
					<div className="text-center">
						<h1 className="text-foreground text-2xl font-bold">{error || "Không tìm thấy phòng"}</h1>
						<p className="text-muted-foreground mt-2">Vui lòng quay lại và chọn phòng khác.</p>
					</div>
				</section>
			</main>
		);
	}

	const { id, label, title, description, location, pricePerNight, maxOccupancy, galleryImages, featureSpecs, amenities, roomDescription } = roomData;

	return (
		<main className="bg-background">
			<section className="mx-auto w-full max-w-[1380px] space-y-10 px-6 py-10 sm:px-8 lg:px-12 xl:px-16">
				<RoomDetailHero
					label={label}
					title={title}
					description={description}
					location={location}
					pricePerNight={pricePerNight}
				/>

				<RoomDetailGallery title={title} images={galleryImages} />

				<section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
					<div className="space-y-10">
						<section className="grid gap-4 border-y border-border/60 py-6 sm:grid-cols-2 lg:grid-cols-4">
							{featureSpecs.map((item) => (
								<article key={item.label} className="space-y-1">
									<p className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase">
										{item.label}
									</p>
									<p className="text-foreground inline-flex items-center gap-2 text-2xl font-semibold">
										<span className="text-ring">{getIconComponent(item.iconType)}</span>
										{item.value}
									</p>
								</article>
							))}
						</section>

						<section className="space-y-5">
							<h2 className="text-foreground font-serif text-5xl font-semibold">
								Tuyệt tác không gian nghỉ dưỡng
							</h2>
							<p className="text-muted-foreground text-lg leading-8">
								{roomDescription}
							</p>
						</section>

						<RoomDetailAmenities title="Tiện nghi đặc quyền" items={amenities} />
					</div>

					<RoomDetailBookingCard
						roomId={id}
						roomTitle={title}
						pricePerNight={pricePerNight}
						maxOccupancy={maxOccupancy}
					/>
				</section>
			</section>
		</main>
	);
}
