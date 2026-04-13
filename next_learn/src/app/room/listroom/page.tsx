"use client";

import { useEffect, useMemo, useState } from "react";

import { RoomCard } from "@/components/room/roomcard";
import { RoomFilter } from "@/components/room/roomfilter";
import type { RoomFilterValues } from "@/components/room/roomfilter";
import type { RoomEntity } from "@/components/room/roomcard";

import { getRoomsForCustomer } from "@/services/room-service";

const PAGE_SIZE = 2;

const defaultFilterValues: RoomFilterValues = {
    query: "",
    capacity: 0,
    minPrice: 0,
    selectedAmenities: [],
    checkIn: "",
    checkOut: "",
};

export default function ListRoomPage() {
    const [rooms, setRooms] = useState<RoomEntity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterValues, setFilterValues] = useState<RoomFilterValues>(defaultFilterValues);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const loadRooms = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await getRoomsForCustomer(0, 200);
                setRooms(response.rooms);
            } catch {
                setError("Không thể tải danh sách phòng. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };

        loadRooms();
    }, []);

    const amenities = useMemo(() => {
        const values = new Set<string>();
        rooms.forEach((room) => {
            (room.roomTypes?.amenityRooms ?? []).forEach((item) => {
                if (item.amenity?.name) {
                    values.add(item.amenity.name);
                }
            });
        });
        return Array.from(values);
    }, [rooms]);

    const filteredRooms = useMemo(() => {
        const normalizedQuery = filterValues.query.trim().toLowerCase();
        const selectedAmenities = filterValues.selectedAmenities.map((item) => item.toLowerCase());

        return rooms.filter((room) => {
            const textPool = [
                room.name,
                room.description,
                room.address,
                room.roomTypes?.name,
                room.roomTypes?.description,
            ]
                .filter((item): item is string => Boolean(item))
                .join(" ")
                .toLowerCase();

            const roomAmenities = (room.roomTypes?.amenityRooms ?? [])
                .map((item) => item.amenity?.name?.toLowerCase())
                .filter((item): item is string => Boolean(item));

            const byQuery = normalizedQuery.length === 0 || textPool.includes(normalizedQuery);
            const byCapacity =
                filterValues.capacity === 0 ||
                (room.roomTypes?.maximumOccupancy ?? 0) >= filterValues.capacity;
            const byPrice =
                filterValues.minPrice === 0 ||
                room.pricePerDay >= filterValues.minPrice;
            const byAmenities =
                selectedAmenities.length === 0 ||
                selectedAmenities.every((amenity) =>
                    roomAmenities.some((roomAmenity) => roomAmenity.includes(amenity.toLowerCase())),
                );

            return byQuery && byCapacity && byPrice && byAmenities;
        });
    }, [filterValues, rooms]);

    const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));

    useEffect(() => {
        setCurrentPage(1);
    }, [filterValues]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedRooms = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredRooms.slice(start, start + PAGE_SIZE);
    }, [currentPage, filteredRooms]);

    return (
        <main className="bg-background">
            <section className="mx-auto w-full px-6 py-8 sm:px-8 md:py-12 lg:px-12 xl:px-16 2xl:px-20">
                <section className="space-y-12">
                    <div className="max-w-4xl space-y-5 pl-1">
                        <span className="bg-ring/15 text-ring inline-flex rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.24em] uppercase">
                            Sự lựa chọn hoàn hảo
                        </span>
                        <h1 className="text-foreground max-w-3xl font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.96] font-medium tracking-[-0.05em]">
                            Nghệ Thuật Của Sự <em className="italic">Nghỉ Dưỡng</em>
                        </h1>
                        <p className="text-muted-foreground max-w-3xl text-[15px] leading-8 md:text-base">
                            Mỗi căn phòng tại Continental Grand Hotel là một bản giao hưởng giữa di sản cổ
                            điển và tiện nghi hiện đại, được thiết kế để mang lại sự riêng tư tuyệt đối và
                            trải nghiệm thượng lưu.
                        </p>
                    </div>

                    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start xl:gap-8">
                        <div className="space-y-8">
                            {isLoading ? (
                                <div className="border-border text-muted-foreground rounded-3xl border border-dashed p-8 text-center">
                                    Đang tải danh sách phòng...
                                </div>
                            ) : error ? (
                                <div className="border-border text-muted-foreground rounded-3xl border border-dashed p-8 text-center">
                                    {error}
                                </div>
                            ) : filteredRooms.length === 0 ? (
                                <div className="border-border text-muted-foreground rounded-3xl border border-dashed p-8 text-center">
                                    Không tìm thấy phòng phù hợp với bộ lọc hiện tại.
                                </div>
                            ) : (
                                <>
                                    {paginatedRooms.map((room, index) => {
                                        const absoluteIndex = (currentPage - 1) * PAGE_SIZE + index;

                                        return (
                                            <RoomCard
                                                key={room.id}
                                                room={room}
                                                badge={room.roomTypes?.name?.toUpperCase() || "ROOM"}
                                                href={`/room/roomdetail/${room.id}`}
                                                imagePosition={absoluteIndex % 2 === 0 ? "left" : "right"}
                                                className="min-h-[360px]"
                                            />
                                        );
                                    })}

                                    <nav className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="border-border bg-background text-foreground disabled:text-muted-foreground disabled:bg-muted/40 rounded-full border px-4 py-2 text-sm"
                                        >
                                            Trước
                                        </button>

                                        {Array.from({ length: totalPages }).map((_, index) => {
                                            const page = index + 1;
                                            const active = page === currentPage;

                                            return (
                                                <button
                                                    key={page}
                                                    type="button"
                                                    onClick={() => setCurrentPage(page)}
                                                    className={active
                                                        ? "bg-ring text-background rounded-full px-4 py-2 text-sm font-semibold"
                                                        : "border-border bg-background text-foreground rounded-full border px-4 py-2 text-sm"
                                                    }
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}

                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="border-border bg-background text-foreground disabled:text-muted-foreground disabled:bg-muted/40 rounded-full border px-4 py-2 text-sm"
                                        >
                                            Sau
                                        </button>
                                    </nav>
                                </>
                            )}
                        </div>

                        <RoomFilter
                            amenities={amenities}
                            totalRooms={filteredRooms.length}
                            onApply={setFilterValues}
                        />
                    </div>
                </section>
            </section>
        </main>
    );
}