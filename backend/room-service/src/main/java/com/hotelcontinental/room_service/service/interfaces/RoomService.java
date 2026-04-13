package com.hotelcontinental.room_service.service.interfaces;

import com.hotelcontinental.room_service.dto.request.room.RoomCreationRequest;
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
    List<RoomImageResponse> uploadRoomImages(String roomId, List<MultipartFile> files, Integer coverIndex);
}
