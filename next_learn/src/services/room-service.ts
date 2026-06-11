import { http } from "@/lib/http";
import type { RoomEntity } from "@/components/room/roomcard";
import type { ApiResponse } from "@/types/api-types";
import type { RoomAmenityItem } from "@/components/room/detail/room-detail-amenities";
import type { RoomGalleryImages } from "@/components/room/detail/room-detail-gallery";

export type RoomTypePayload = {
  name: string;
  description?: string;
  maximumOccupancy: number;
  quantity?: number;
};

type SpringPage<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
};

type AmenityResponse = {
  id: string;
  name: string;
  description?: string;
  status?: string;
  deleted?: boolean;
};

type AmenityRoomResponse = {
  id: string;
  amenityId?: string;
  roomTypeId?: string;
  amount?: number;
  deleted?: boolean;
  amenity?: AmenityResponse | null;
};

type ServiceResponse = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  status?: string;
  deleted?: boolean;
};

type RoomTypeServiceResponse = {
  id: string;
  roomTypeId?: string;
  roomTypeName?: string;
  serviceId?: string;
  serviceName?: string;
  amount?: number;
  deleted?: boolean;
};

export type RoomCustomerListResult = {
  rooms: RoomEntity[];
  totalPages: number;
  totalElements: number;
};

export type RoomResponse = {
  id: string;
  name: string;
  image?: string;
  images?: RoomImageResponse[];
  galleryImages?: string[];
  pricePerDay: number;
  pricePerHour: number;
  address?: string;
  description?: string;
  roomSize: string;
  status: string;
  createdBy?: string;
  roomTypeId?: string;
  roomTypes?: RoomTypeResponse | null;
};

export type RoomImageResponse = {
  id: string;
  url: string;
  publicId?: string;
  isCover?: boolean;
  sortOrder?: number;
};

export type RoomTypeResponse = {
  id: string;
  name: string;
  description?: string;
  maximumOccupancy: number;
  quantity: number;
  createdBy?: string;
  createdTime?: string;
  modifiedBy?: string;
  modifiedTime?: string;
  amenityRooms?: Array<{
    id: string;
    amenityId?: string;
    roomTypeId?: string;
    amount?: number;
    deleted?: boolean;
    amenity?: AmenityResponse | null;
  }>;
};

export async function getAllRooms(page = 0, size = 20): Promise<{ data: RoomResponse[]; total: number }> {
  const res = await http
    .get("room/room/customer", {
      searchParams: { page, size },
    })
    .json<ApiResponse<SpringPage<RoomResponse>>>();
  const pageData = (res.result ?? res.content) as SpringPage<RoomResponse> | undefined;
  return {
    data: await enrichRooms(pageData?.content ?? []),
    total: pageData?.totalElements ?? 0,
  };
}

export async function getBusyRoomIds(start: string, end: string): Promise<string[]> {
  const res = await http
    .get("booking/availability/busy-room-ids", {
      searchParams: { start, end },
    })
    .json<ApiResponse<string[]>>();

  return (res.result ?? res.content ?? []) as string[];
}

export async function getRoomById(id: string): Promise<RoomResponse> {
  const res = await http.get(`room/room/customer/${id}`).json<ApiResponse<RoomResponse>>();
  return enrichRoom((res.result ?? res.content) as RoomResponse);
}

async function getRoomTypes(page = 0, size = 500): Promise<RoomTypeResponse[]> {
  const res = await http
    .get("catalog/roomType", {
      searchParams: { page, size },
    })
    .json<ApiResponse<SpringPage<RoomTypeResponse>>>();

  const pageData = (res.result ?? res.content) as SpringPage<RoomTypeResponse> | undefined;
  return pageData?.content ?? [];
}

async function getAmenities(page = 0, size = 500): Promise<AmenityResponse[]> {
  const res = await http
    .get("catalog/amenity", {
      searchParams: { page, size },
    })
    .json<ApiResponse<SpringPage<AmenityResponse>>>();

  return extractContent(res.result ?? res.content).filter((amenity) => !amenity.deleted);
}

async function getAmenityRoomsByRoomType(roomTypeId: string): Promise<NonNullable<RoomTypeResponse["amenityRooms"]>> {
  const res = await http
    .get(`room/amenityRoom/roomType/${roomTypeId}`, {
      searchParams: { page: 0, size: 100 },
    })
    .json<ApiResponse<SpringPage<AmenityRoomResponse> | AmenityRoomResponse[]>>();

  const amenityRooms = extractContent(res.result ?? res.content).filter((item) => !item.deleted);
  if (amenityRooms.length === 0) {
    return [];
  }

  const amenities = await getAmenities();
  const amenityMap = new Map(amenities.map((amenity) => [amenity.id, amenity]));

  return amenityRooms.map((item) => ({
    ...item,
    amenity: item.amenity ?? (item.amenityId ? amenityMap.get(item.amenityId) ?? null : null),
  }));
}

async function getCatalogServices(page = 0, size = 500): Promise<ServiceResponse[]> {
  const res = await http
    .get("catalog/service", {
      searchParams: { page, size },
    })
    .json<ApiResponse<SpringPage<ServiceResponse>>>();

  return extractContent(res.result ?? res.content).filter((service) => !service.deleted);
}

async function getRoomTypeServicesByRoomType(roomTypeId: string): Promise<RoomTypeServiceResponse[]> {
  const res = await http
    .get(`catalog/roomTypeService/roomType/${roomTypeId}`, {
      searchParams: { page: 0, size: 100 },
    })
    .json<ApiResponse<SpringPage<RoomTypeServiceResponse> | RoomTypeServiceResponse[]>>();

  return extractContent(res.result ?? res.content).filter((item) => !item.deleted);
}

async function enrichRooms(rooms: RoomResponse[]): Promise<RoomResponse[]> {
  if (rooms.length === 0) {
    return rooms;
  }

  const roomTypeIds = Array.from(
    new Set(rooms.map((room) => room.roomTypeId ?? room.roomTypes?.id).filter((id): id is string => Boolean(id))),
  );
  if (roomTypeIds.length === 0) {
    return rooms;
  }

  const roomTypes = await getRoomTypes();
  const roomTypeMap = new Map(roomTypes.map((roomType) => [roomType.id, roomType]));
  const amenityEntries = await Promise.all(
    roomTypeIds.map(async (roomTypeId) => [roomTypeId, await getAmenityRoomsByRoomType(roomTypeId)] as const)
  );
  const amenityMap = new Map(amenityEntries);

  return rooms.map((room) => {
    const roomTypeId = room.roomTypeId ?? room.roomTypes?.id;
    const roomType = room.roomTypes ?? (roomTypeId ? roomTypeMap.get(roomTypeId) ?? null : null);
    return {
      ...room,
      roomTypeId,
      roomTypes: roomType
        ? {
            ...roomType,
            amenityRooms: roomType.amenityRooms ?? (roomTypeId ? amenityMap.get(roomTypeId) ?? [] : []),
          }
        : null,
    };
  });
}

async function enrichRoom(room: RoomResponse): Promise<RoomResponse> {
  const [enriched] = await enrichRooms([room]);
  return enriched;
}

export interface RoomDetailData {
  id: string;
  image: string;
  label: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  maxOccupancy: number;
  galleryImages: RoomGalleryImages;
  featureSpecs: Array<{
    label: string;
    value: string;
    iconType: "area" | "users";
  }>;
  amenities: RoomAmenityItem[];
  addOnServices: RoomAmenityItem[];
  roomDescription: string;
}

const mockRoomDetails: Record<string, RoomDetailData> = {
  "room-1": {
    id: "room-1",
    image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=900&q=80",
    label: "Hạng phòng cao cấp",
    title: "Phòng Suite Hoàng Gia",
    description: "Một không gian tinh tế kết hợp hoàn hảo giữa nét cổ điển di sản và tiện nghi hiện đại bậc nhất, mang đến tầm nhìn toàn cảnh thành phố rực rỡ.",
    location: "Tầng 18 - 22, Khu vực phía Đông",
    pricePerNight: 8500000,
    maxOccupancy: 3,
    galleryImages: {
      main: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1400&q=80",
      topRight: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
      bottomLeft: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
      bottomRight: "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=900&q=80",
    },
    featureSpecs: [
      { label: "Diện tích", value: "120 m²", iconType: "area" },
      { label: "Khách tối đa", value: "3 Người lớn", iconType: "users" },
    ],
    amenities: [
      { title: "Wifi Tốc Độ Cao", description: "Truy cập không giới hạn với băng thông cực nhanh.", icon: "wifi" },
      { title: "Minibar Cao Cấp", description: "Lựa chọn các loại vang và thức uống thượng hạng.", icon: "mini-bar" },
      { title: "Bồn Tắm Cẩm Thạch", description: "Thư giãn tối đa với bồn tắm sục và mùi tắm thảo dược.", icon: "bath" },
      { title: "Máy Pha Cà Phê", description: "Thưởng thức hương vị Espresso ngay tại phòng.", icon: "coffee" },
      { title: "Dịch Vụ Quản Gia", description: "Hỗ trợ 24/7 cho mọi yêu cầu cá nhân của quý khách.", icon: "butler" },
      { title: "Giải Trí Thông Minh", description: "Hệ thống Smart TV 65 inch tích hợp các nền tảng trực tuyến.", icon: "tv" }
    ],
    addOnServices: [],
    roomDescription: "Tận hưởng sự xa hoa tột tinh tại Suite Hoàng Gia, nơi mọi chi tiết nhỏ nhất đều được chăm chút để tôn vinh sự sang trọng. Phòng khách riêng biệt được bài trí với nét đặt riêng từ những nghệ nhân hàng đầu, cùng hệ thống âm thanh vòm cao cấp tạo nên không gian giải trí riêng tư lý tưởng. Phòng tắm cẩm thạch Ý trang bị bồn tắm nằm với hệ thống sục massage và bộ sản phẩm chăm sóc cơ thể độc quyền từ thương hiệu di sản Pháp."
  },
  "room-2": {
    id: "room-2",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80",
    label: "Hạng phòng tiêu chuẩn",
    title: "Phòng Deluxe Nhìn ra Biển",
    description: "Phòng rộng rãi với tầm nhìn biển tuyệt đẹp, thiết kế hiện đại kết hợp tiện nghi đầy đủ.",
    location: "Tầng 10 - 15, Khu vực hướng biển",
    pricePerNight: 5200000,
    maxOccupancy: 2,
    galleryImages: {
      main: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=80",
      topRight: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
      bottomLeft: "https://images.unsplash.com/photo-1505692952047-1d71bcdd2d7d?auto=format&fit=crop&w=900&q=80",
      bottomRight: "https://images.unsplash.com/photo-1611080626919-d2dbc29cccbb?auto=format&fit=crop&w=900&q=80",
    },
    featureSpecs: [
      { label: "Diện tích", value: "55 m²", iconType: "area" },
      { label: "Khách tối đa", value: "2 Người lớn", iconType: "users" },
    ],
    amenities: [
      { title: "Wifi Tốc Độ Cao", description: "Truy cập không giới hạn với băng thông cực nhanh.", icon: "wifi" },
      { title: "Minibar", description: "Các loại đồ uống và thực phẩm nhẹ.", icon: "mini-bar" },
      { title: "Bồn Tắm Sục", description: "Thư giãn với bồn tắm sục hiện đại.", icon: "bath" },
      { title: "Máy Pha Cà Phê", description: "Thưởng thức cà phê ngay tại phòng.", icon: "coffee" },
      { title: "Dịch Vụ Hỗ Trợ", description: "Hỗ trợ khách hàng 24/7.", icon: "butler" },
      { title: "Smart TV", description: "Hệ thống Smart TV tích hợp các nền tảng.", icon: "tv" }
    ],
    addOnServices: [],
    roomDescription: "Trải nghiệm thoải mái với Phòng Deluxe Nhìn ra Biển, nơi kết hợp hoàn hảo giữa tiện nghi hiện đại và vẻ đẹp tự nhiên."
  }
};

const fallbackRoomDetailImages = [
  "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=900&q=80",
];

export async function getRoomDetail(id: string): Promise<RoomDetailData | null> {
  try {
    const room = await getRoomById(id);
    
    if (!room) return null;
    const gallery = buildRoomGallery(room);
    const amenities = (room.roomTypes?.amenityRooms ?? [])
      .filter((ar) => ar.amenity && !ar.deleted)
      .map((ar) => toRoomAmenityItem(ar.amenity));
    const addOnServices = room.roomTypeId
      ? await getRoomServiceItems(room.roomTypeId)
      : [];

    return {
      id: room.id,
      image: gallery[0],
      label: room.roomTypes?.name || "Phòng khách sạn",
      title: room.name || "Tên phòng",
      description: room.roomTypes?.description || room.description || "Thông tin phòng đang được cập nhật.",
      location: room.address || "Continental Grand Hotel",
      pricePerNight: room.pricePerDay || 0,
      maxOccupancy: room.roomTypes?.maximumOccupancy || 2,
      galleryImages: {
        main: gallery[0],
        topRight: gallery[1],
        bottomLeft: gallery[2],
        bottomRight: gallery[3],
      },
      featureSpecs: [
        { label: "Diện tích", value: room.roomSize || "50 m²", iconType: "area" },
        { label: "Khách tối đa", value: `${room.roomTypes?.maximumOccupancy || 2} Người lớn`, iconType: "users" }
      ],
      amenities,
      addOnServices,
      roomDescription: room.description || room.roomTypes?.description || "Thông tin mô tả phòng đang được cập nhật."
    };
  } catch (error) {
    console.error("Error fetching real room details:", error);
    return null;
  }
}

async function getRoomServiceItems(roomTypeId: string): Promise<RoomAmenityItem[]> {
  const [roomTypeServices, services] = await Promise.all([
    getRoomTypeServicesByRoomType(roomTypeId),
    getCatalogServices().catch(() => []),
  ]);
  const serviceMap = new Map(services.map((service) => [service.id, service]));

  return roomTypeServices.map((item) => {
    const service = item.serviceId ? serviceMap.get(item.serviceId) : undefined;
    const title = service?.name || item.serviceName || "Dịch vụ bổ sung";
    const priceText = service?.price ? ` Giá: ${Number(service.price).toLocaleString("vi-VN")} VNĐ.` : "";
    const amountText = item.amount && item.amount > 1 ? ` Số lượng áp dụng: ${item.amount}.` : "";

    return {
      title,
      description: service?.description?.trim() || `Dịch vụ bán thêm áp dụng cho loại phòng này.${amountText}${priceText}`,
      icon: resolveAmenityIcon(title),
    };
  });
}

function extractContent<T>(value: SpringPage<T> | T[] | undefined | null): T[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return value.content ?? [];
}

function toRoomAmenityItem(amenity?: AmenityResponse | null): RoomAmenityItem {
  const title = amenity?.name?.trim() || "Tiện ích";
  return {
    title,
    description: amenity?.description?.trim() || "Tiện ích được gán theo hạng phòng này.",
    icon: resolveAmenityIcon(title),
  };
}

function resolveAmenityIcon(name: string): RoomAmenityItem["icon"] {
  const lower = name.toLowerCase();

  if (lower.includes("bar") || lower.includes("minibar") || lower.includes("rượu") || lower.includes("nước")) {
    return "mini-bar";
  }
  if (lower.includes("tắm") || lower.includes("bath") || lower.includes("bồn")) {
    return "bath";
  }
  if (lower.includes("cà phê") || lower.includes("coffee") || lower.includes("ấm")) {
    return "coffee";
  }
  if (lower.includes("quản gia") || lower.includes("butler") || lower.includes("concierge")) {
    return "butler";
  }
  if (lower.includes("tv") || lower.includes("tivi") || lower.includes("truyền hình")) {
    return "tv";
  }

  return "wifi";
}

function buildRoomGallery(room: RoomResponse): string[] {
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
  fallbackRoomDetailImages.forEach(addImage);

  return Array.from(imageMap.values()).slice(0, 4);
}

export async function getAllRoomIds(): Promise<string[]> {
  try {
    const { data } = await getAllRooms(0, 100);
    return data.map(r => r.id);
  } catch {
    return [];
  }
}
