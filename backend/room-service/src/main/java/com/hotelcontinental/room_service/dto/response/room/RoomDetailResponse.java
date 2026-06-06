package com.hotelcontinental.room_service.dto.response.room;

import com.hotelcontinental.room_service.enums.RoomStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomDetailResponse {
    String id;
    String roomTypeId;
    String floorId;
    String name;
    String image; // Ảnh bìa / đại diện
    List<RoomImageResponse> images; // Lấy danh sách ảnh từ Table chứa ảnh của phòng
    List<String> galleryImages; // Mảng URL hoặc mapping để tương thích frontend
    Float pricePerDay;
    Float pricePerHour;
    String description;
    String roomDescription;
    String roomSize; 
    RoomStatus status;
}
