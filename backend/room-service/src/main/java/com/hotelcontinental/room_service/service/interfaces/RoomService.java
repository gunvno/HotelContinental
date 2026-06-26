package com.hotelcontinental.room_service.service.interfaces;

import com.hotelcontinental.room_service.dto.request.room.RoomCreationRequest;
import com.hotelcontinental.room_service.dto.request.room.HousekeepingAssignRequest;
import com.hotelcontinental.room_service.dto.request.room.HousekeepingStatusUpdateRequest;
import com.hotelcontinental.room_service.dto.response.room.RoomDetailResponse;
import com.hotelcontinental.room_service.dto.response.room.RoomForCustomerResponse;
import com.hotelcontinental.room_service.dto.response.room.RoomImageResponse;
import com.hotelcontinental.room_service.dto.response.room.RoomResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface RoomService {
    void deleteRoom(String id);
    Page<RoomForCustomerResponse> getRoomForCustomer(Pageable pageable);
    RoomResponse createRoom(RoomCreationRequest request);
    RoomResponse updateRoom(String id, RoomCreationRequest request);
    RoomResponse updateHousekeepingStatus(String id, HousekeepingStatusUpdateRequest request);
    RoomResponse assignHousekeepingTask(String id, HousekeepingAssignRequest request);
    RoomResponse completeHousekeepingTask(String id);
    List<RoomImageResponse> uploadRoomImages(String roomId, List<MultipartFile> files, Integer coverIndex);
    void deleteRoomImage(String roomId, String imageId);
    RoomDetailResponse getRoomById(String id);
}
