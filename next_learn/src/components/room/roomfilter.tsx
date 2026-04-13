"use client";

import { Banknote, CalendarDays, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export type RoomFilterValues = {
	query: string;
	capacity: number;
	minPrice: number;
	selectedAmenities: string[];
	checkIn: string;
	checkOut: string;
};

export type RoomFilterProps = {
	amenities: string[];
	totalRooms: number;
	onApply: (values: RoomFilterValues) => void;
};

export function RoomFilter({ amenities, totalRooms, onApply }: RoomFilterProps) {
	const [capacity, setCapacity] = useState(0);
	const [minPrice, setMinPrice] = useState(0);
	const [checkIn, setCheckIn] = useState("");
	const [checkOut, setCheckOut] = useState("");
	const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
	const [isCapacityOpen, setIsCapacityOpen] = useState(false);
	const capacityDropdownRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				capacityDropdownRef.current &&
				!capacityDropdownRef.current.contains(event.target as Node)
			) {
				setIsCapacityOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const capacityLabel =
		capacity === 0 ? "Tất cả sức chứa" : `${capacity} người`;

	const capacityOptions = [
		{ label: "Tất cả sức chứa", value: 0 },
		{ label: "2 người", value: 2 },
		{ label: "3 người", value: 3 },
		{ label: "4 người", value: 4 },
	];

	const toggleAmenity = (amenity: string) => {
		setSelectedAmenities((prev) =>
			prev.includes(amenity)
				? prev.filter((item) => item !== amenity)
				: [...prev, amenity],
		);
	};

	const applyFilter = () => {
		onApply({ query: "", capacity, minPrice, selectedAmenities, checkIn, checkOut });
	};

	return (
		<aside className="border-border/60 bg-muted/70 space-y-6 rounded-[28px] border p-6 shadow-[0_18px_55px_-40px_rgba(31,41,55,0.35)] lg:sticky lg:top-28">
			<div>
				<p className="text-foreground whitespace-nowrap text-2xl font-semibold">Bộ lọc tìm kiếm</p>
				<div className="bg-border mt-5 h-px" />
			</div>

			<div className="space-y-2">
				<span className="text-muted-foreground text-[11px] tracking-[0.22em] uppercase">
					Giá từ
				</span>
				<div className="border-border bg-background text-muted-foreground flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm">
					<Banknote className="text-ring h-4 w-4 shrink-0" />
					<input
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						value={minPrice}
						onChange={(event) => setMinPrice(Number(event.target.value.replace(/[^0-9]/g, "")))}
						placeholder="Nhập giá từ"
						className="text-foreground placeholder:text-muted-foreground w-full bg-transparent outline-none"
					/>
				</div>
			</div>

			<div className="space-y-5">
				<label className="block space-y-2">
					<span className="text-muted-foreground text-[11px] tracking-[0.22em] uppercase">
						Ngày lưu trú
					</span>
					<div className="border-border bg-background text-muted-foreground flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm">
						<CalendarDays className="text-ring h-4 w-4" />
						<div className="grid w-full grid-cols-2 gap-2">
							<input
								type="date"
								value={checkIn}
								onChange={(event) => setCheckIn(event.target.value)}
								className="bg-transparent text-sm outline-none"
							/>
							<input
								type="date"
								value={checkOut}
								onChange={(event) => setCheckOut(event.target.value)}
								className="bg-transparent text-sm outline-none"
							/>
						</div>
					</div>
				</label>

				<label className="block space-y-2">
					<span className="text-muted-foreground text-[11px] tracking-[0.22em] uppercase">
						Sức chứa
					</span>
					<div ref={capacityDropdownRef} className="relative">
						<button
							type="button"
							onClick={() => setIsCapacityOpen((prev) => !prev)}
							className="border-border bg-background text-foreground flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm shadow-sm transition hover:border-ring/70 focus:outline-none focus:ring-2 focus:ring-ring/20"
						>
							<span>{capacityLabel}</span>
							<ChevronDown
								className={`text-ring h-4 w-4 transition-transform duration-200 ${isCapacityOpen ? "rotate-180" : ""}`}
							/>
						</button>

						{isCapacityOpen ? (
							<div className="border-border/80 bg-background absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border shadow-[0_20px_45px_-25px_rgba(31,41,55,0.35)]">
								{capacityOptions.map((option) => {
									const active = capacity === option.value;

									return (
										<button
											key={option.value}
											type="button"
											onClick={() => {
												setCapacity(option.value);
												setIsCapacityOpen(false);
											}}
											className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-muted/70 ${active ? "bg-muted/70 text-foreground font-medium" : "text-foreground/90"}`}
										>
											<span>{option.label}</span>
											{active ? <span className="text-ring text-xs">Đang chọn</span> : null}
										</button>
									);
								})}
							</div>
						) : null}
					</div>
				</label>

				<div className="space-y-3">
					<span className="text-muted-foreground text-[11px] tracking-[0.22em] uppercase">
						Tiện ích mong muốn
					</span>
					<div className="text-foreground grid grid-cols-2 gap-3 text-sm">
						{amenities.map((item) => (
							<label key={item} className="flex items-center gap-2">
								<input
									type="checkbox"
									className="accent-ring"
									checked={selectedAmenities.includes(item)}
									onChange={() => toggleAmenity(item)}
								/>
								<span>{item}</span>
							</label>
						))}
					</div>
				</div>

				<Button className="h-12 w-full rounded-full" onClick={applyFilter}>
					Áp dụng bộ lọc
				</Button>
			</div>
		</aside>
	);
}
