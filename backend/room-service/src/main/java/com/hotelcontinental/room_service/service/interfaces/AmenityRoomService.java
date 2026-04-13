package com.hotelcontinental.room_service.service.interfaces;

import com.hotelcontinental.room_service.dto.request.amenityroom.AmenityRoomCreationRequest;
import com.hotelcontinental.room_service.dto.request.amenityroom.AmenityRoomUpdateRequest;
import com.hotelcontinental.room_service.dto.response.amenityroom.AmenityRoomResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AmenityRoomService {
    AmenityRoomResponse createAmenityRoom(AmenityRoomCreationRequest request);
    Page<AmenityRoomResponse> getAmenitiesByRoomType(String roomTypeId, Pageable pageable);
    AmenityRoomResponse getAmenityRoom(String id);
    AmenityRoomResponse updateAmenityRoom(String id, AmenityRoomUpdateRequest request);
    void deleteAmenityRoom(String id);
}
