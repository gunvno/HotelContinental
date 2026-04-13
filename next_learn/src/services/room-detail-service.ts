import type { RoomAmenityItem } from "@/components/room/detail/room-detail-amenities";
import type { RoomGalleryImages } from "@/components/room/detail/room-detail-gallery";

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
    iconType: "area" | "users" | "bed" | "view"; // String icons, not JSX
  }>;
  amenities: RoomAmenityItem[];
  roomDescription: string;
}

// Mock data - sẽ thay bằng API backend sau
const mockRoomDetails: Record<string, RoomDetailData> = {
  "room-1": {
    id: "room-1",
    image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=900&q=80",
    label: "Hạng phòng cao cấp",
    title: "Phòng Suite Hoàng Gia",
    description:
      "Một không gian tinh tế kết hợp hoàn hảo giữa nét cổ điển di sản và tiện nghi hiện đại bậc nhất, mang đến tầm nhìn toàn cảnh thành phố rực rỡ.",
    location: "Tầng 18 - 22, Khu vực phía Đông",
    pricePerNight: 8_500_000,
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
      {
        title: "Wifi Tốc Độ Cao",
        description: "Truy cập không giới hạn với băng thông cực nhanh.",
        icon: "wifi",
      },
      {
        title: "Minibar Cao Cấp",
        description: "Lựa chọn các loại vang và thức uống thượng hạng.",
        icon: "mini-bar",
      },
      {
        title: "Bồn Tắm Cẩm Thạch",
        description: "Thư giãn tối đa với bồn tắm sục và mùi tắm thảo dược.",
        icon: "bath",
      },
      {
        title: "Máy Pha Cà Phê",
        description: "Thưởng thức hương vị Espresso ngay tại phòng.",
        icon: "coffee",
      },
      {
        title: "Dịch Vụ Quản Gia",
        description: "Hỗ trợ 24/7 cho mọi yêu cầu cá nhân của quý khách.",
        icon: "butler",
      },
      {
        title: "Giải Trí Thông Minh",
        description: "Hệ thống Smart TV 65 inch tích hợp các nền tảng trực tuyến.",
        icon: "tv",
      },
    ],
    roomDescription:
      "Tận hưởng sự xa hoa tối tinh tại Suite Hoàng Gia, nơi mọi chi tiết nhỏ nhất đều được chăm chút để tôn vinh sự sang trọng. Phòng khách riêng biệt được bài trí với nét đặt riêng từ những nghệ nhân hàng đầu, cùng hệ thống âm thanh vòm cao cấp tạo nên không gian giải trí riêng tư lý tưởng. Phòng tắm cẩm thạch Ý trang bị bồn tắm nằm với hệ thống sục massage và bộ sản phẩm chăm sóc cơ thể độc quyền từ thương hiệu di sản Pháp. Đây không chỉ là nơi để ngủ, mà là một trải nghiệm sống đẳng cấp giữa lòng thành phố.",
  },
  "room-2": {
    id: "room-2",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80",
    label: "Hạng phòng tiêu chuẩn",
    title: "Phòng Deluxe Nhìn ra Biển",
    description:
      "Phòng rộng rãi với tầm nhìn biển tuyệt đẹp, thiết kế hiện đại kết hợp tiện nghi đầy đủ.",
    location: "Tầng 10 - 15, Khu vực hướng biển",
    pricePerNight: 5_200_000,
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
      {
        title: "Wifi Tốc Độ Cao",
        description: "Truy cập không giới hạn với băng thông cực nhanh.",
        icon: "wifi",
      },
      {
        title: "Minibar",
        description: "Các loại đồ uống và thực phẩm nhẹ.",
        icon: "mini-bar",
      },
      {
        title: "Bồn Tắm Sục",
        description: "Thư giãn với bồn tắm sục hiện đại.",
        icon: "bath",
      },
      {
        title: "Máy Pha Cà Phê",
        description: "Thưởng thức cà phê ngay tại phòng.",
        icon: "coffee",
      },
      {
        title: "Dịch Vụ Hỗ Trợ",
        description: "Hỗ trợ khách hàng 24/7.",
        icon: "butler",
      },
      {
        title: "Smart TV",
        description: "Hệ thống Smart TV tích hợp các nền tảng.",
        icon: "tv",
      },
    ],
    roomDescription:
      "Trải nghiệm thoải mái với Phòng Deluxe Nhìn ra Biển, nơi kết hợp hoàn hảo giữa tiện nghi hiện đại và vẻ đẹp tự nhiên. Với tầm nhìn biển tuyệt đẹp, phòng tạo ra bầu không khí thư giãn lý tưởng cho kỳ nghỉ của bạn.",
  },
  "room-3": {
    id: "room-3",
    image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=900&q=80",
    label: "Hạng phòng doanh nhân",
    title: "Executive Garden Room",
    description: "Không gian yên tĩnh nhìn ra khu vườn nội khu, phù hợp cho lưu trú dài ngày.",
    location: "Khu vườn nội khu",
    pricePerNight: 3_200_000,
    maxOccupancy: 2,
    galleryImages: {
      main: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1400&q=80",
      topRight: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
      bottomLeft: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=80",
      bottomRight: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80",
    },
    featureSpecs: [
      { label: "Diện tích", value: "36 m²", iconType: "area" },
      { label: "Khách tối đa", value: "2 Người lớn", iconType: "users" },
      { label: "Loại giường", value: "Queen Size", iconType: "bed" },
      { label: "Tầm nhìn", value: "Hướng vườn", iconType: "view" },
    ],
    amenities: [
      { title: "Wifi Tốc Độ Cao", description: "Băng thông ổn định cho làm việc và giải trí.", icon: "wifi" },
      { title: "Minibar", description: "Đồ uống và snack cao cấp.", icon: "mini-bar" },
      { title: "Bồn Tắm", description: "Không gian thư giãn riêng tư.", icon: "bath" },
      { title: "Máy Pha Cà Phê", description: "Cà phê nóng ngay tại phòng.", icon: "coffee" },
      { title: "Dịch Vụ Quản Gia", description: "Hỗ trợ nhanh chóng 24/7.", icon: "butler" },
      { title: "Smart TV", description: "Tích hợp nền tảng xem phim trực tuyến.", icon: "tv" },
    ],
    roomDescription:
      "Executive Garden Room mang lại sự riêng tư với không gian xanh dịu nhẹ, phù hợp cho khách cần nghỉ ngơi kết hợp công việc.",
  },
  "room-4": {
    id: "room-4",
    image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=900&q=80",
    label: "Hạng phòng gia đình",
    title: "Grand Family Room",
    description: "Không gian rộng rãi dành cho gia đình với tiện nghi đầy đủ.",
    location: "Khối gia đình, tầng yên tĩnh",
    pricePerNight: 6_200_000,
    maxOccupancy: 4,
    galleryImages: {
      main: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1400&q=80",
      topRight: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      bottomLeft: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=900&q=80",
      bottomRight: "https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&w=900&q=80",
    },
    featureSpecs: [
      { label: "Diện tích", value: "65 m²", iconType: "area" },
      { label: "Khách tối đa", value: "4 Người lớn", iconType: "users" },
      { label: "Loại giường", value: "2 Queen Beds", iconType: "bed" },
      { label: "Tầm nhìn", value: "Hướng thành phố", iconType: "view" },
    ],
    amenities: [
      { title: "Wifi Tốc Độ Cao", description: "Kết nối nhanh cho cả gia đình.", icon: "wifi" },
      { title: "Minibar", description: "Đồ uống đa dạng cho mọi độ tuổi.", icon: "mini-bar" },
      { title: "Bồn Tắm", description: "Không gian tắm rộng rãi.", icon: "bath" },
      { title: "Máy Pha Cà Phê", description: "Phục vụ cà phê mọi lúc.", icon: "coffee" },
      { title: "Dịch Vụ Quản Gia", description: "Hỗ trợ yêu cầu gia đình 24/7.", icon: "butler" },
      { title: "Smart TV", description: "Giải trí đa nền tảng cho cả nhà.", icon: "tv" },
    ],
    roomDescription:
      "Grand Family Room được thiết kế cho kỳ nghỉ gia đình trọn vẹn, nơi mọi thành viên đều có không gian thoải mái và riêng tư.",
  },
};

export async function getRoomDetail(id: string): Promise<RoomDetailData | null> {
  // TODO: Thay bằng API call khi backend sẵn sàng
  // const response = await fetch(`/api/rooms/${id}`);
  // const data = await response.json();
  // return data;

  return mockRoomDetails[id] || null;
}

export async function getAllRoomIds(): Promise<string[]> {
  // TODO: Thay bằng API call khi backend sẵn sàng
  return Object.keys(mockRoomDetails);
}
