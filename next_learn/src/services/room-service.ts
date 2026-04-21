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

export type RoomCustomerListResult = {
  rooms: RoomEntity[];
  totalPages: number;
  totalElements: number;
};

export type RoomResponse = {
  id: string;
  name: string;
  image?: string;
  pricePerDay: number;
  pricePerHour: number;
  address: string;
  description?: string;
  roomSize: string;
  status: string;
  createdBy?: string;
  roomTypes?: RoomTypeResponse | null;
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
    amenity?: {
      id: string;
      name: string;
      description?: string;
    } | null;
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
    data: pageData?.content ?? [],
    total: pageData?.totalElements ?? 0,
  };
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
    iconType: "area" | "users" | "bed" | "view";
  }>;
  amenities: RoomAmenityItem[];
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
      { label: "Loại giường", value: "King Size", iconType: "bed" },
      { label: "Tầm nhìn", value: "Hướng biển", iconType: "view" },
    ],
    amenities: [
      { title: "Wifi Tốc Độ Cao", description: "Truy cập không giới hạn với băng thông cực nhanh.", icon: "wifi" },
      { title: "Minibar Cao Cấp", description: "Lựa chọn các loại vang và thức uống thượng hạng.", icon: "mini-bar" },
      { title: "Bồn Tắm Cẩm Thạch", description: "Thư giãn tối đa với bồn tắm sục và mùi tắm thảo dược.", icon: "bath" },
      { title: "Máy Pha Cà Phê", description: "Thưởng thức hương vị Espresso ngay tại phòng.", icon: "coffee" },
      { title: "Dịch Vụ Quản Gia", description: "Hỗ trợ 24/7 cho mọi yêu cầu cá nhân của quý khách.", icon: "butler" },
      { title: "Giải Trí Thông Minh", description: "Hệ thống Smart TV 65 inch tích hợp các nền tảng trực tuyến.", icon: "tv" }
    ],
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
      { label: "Loại giường", value: "Queen Size", iconType: "bed" },
      { label: "Tầm nhìn", value: "Hướng biển", iconType: "view" },
    ],
    amenities: [
      { title: "Wifi Tốc Độ Cao", description: "Truy cập không giới hạn với băng thông cực nhanh.", icon: "wifi" },
      { title: "Minibar", description: "Các loại đồ uống và thực phẩm nhẹ.", icon: "mini-bar" },
      { title: "Bồn Tắm Sục", description: "Thư giãn với bồn tắm sục hiện đại.", icon: "bath" },
      { title: "Máy Pha Cà Phê", description: "Thưởng thức cà phê ngay tại phòng.", icon: "coffee" },
      { title: "Dịch Vụ Hỗ Trợ", description: "Hỗ trợ khách hàng 24/7.", icon: "butler" },
      { title: "Smart TV", description: "Hệ thống Smart TV tích hợp các nền tảng.", icon: "tv" }
    ],
    roomDescription: "Trải nghiệm thoải mái với Phòng Deluxe Nhìn ra Biển, nơi kết hợp hoàn hảo giữa tiện nghi hiện đại và vẻ đẹp tự nhiên."
  }
};

export async function getRoomDetail(id: string): Promise<RoomDetailData | null> {
  try {
    const { data } = await getAllRooms(0, 100); 
    const room = data.find((r) => r.id === id);
    
    if (!room) return mockRoomDetails[id] || mockRoomDetails["room-1"] || null;

    return {
      id: room.id,
      image: room.image || "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=900&q=80",
      label: room.roomTypes?.name || "Suite Cao Cấp",
      title: room.name || "Tên phòng",
      description: room.roomTypes?.description || "Không gian nghỉ dưỡng tuyệt vời kết hợp hoàn hảo giữa tiện nghi hiện đại và thiết kế tinh tế.",
      location: room.address || "Tọa lạc tại vị trí riêng tư",
      pricePerNight: room.pricePerDay || 8500000,
      maxOccupancy: room.roomTypes?.maximumOccupancy || 2,
      galleryImages: {
        main: room.image || "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1400&q=80",
        topRight: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
        bottomLeft: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
        bottomRight: "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=900&q=80",
      },
      featureSpecs: [
        { label: "Diện tích", value: room.roomSize || "50 m²", iconType: "area" },
        { label: "Khách tối đa", value: `${room.roomTypes?.maximumOccupancy || 2} Người lớn`, iconType: "users" },
        { label: "Loại giường", value: "King Size", iconType: "bed" },
        { label: "Tầm nhìn", value: "Thành phố/Biển", iconType: "view" },
      ],
      amenities: (room.roomTypes?.amenityRooms && room.roomTypes.amenityRooms.length > 0) 
        ? room.roomTypes.amenityRooms.map(ar => ({
            title: ar.amenity?.name || "Tiện ích",
            description: ar.amenity?.description || "Mô tả tiện ích",
            icon: "wifi"
          }))
        : mockRoomDetails["room-1"].amenities, // fallback mock amenities
      roomDescription: room.description || "Trải nghiệm kỳ nghỉ hoàn hảo với đầy đủ các dịch vụ chuẩn quốc tế."
    };
  } catch (error) {
    console.error("Error fetching real room details:", error);
    return mockRoomDetails[id] || mockRoomDetails["room-1"] || null;
  }
}

export async function getAllRoomIds(): Promise<string[]> {
  try {
    const { data } = await getAllRooms(0, 100);
    return data.map(r => r.id);
  } catch {
    return Object.keys(mockRoomDetails);
  }
}
