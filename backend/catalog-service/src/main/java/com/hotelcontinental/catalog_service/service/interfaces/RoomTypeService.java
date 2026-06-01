package com.hotelcontinental.catalog_service.service.interfaces;

import com.hotelcontinental.catalog_service.dto.request.roomtype.RoomTypeCreationRequest;
import com.hotelcontinental.catalog_service.dto.request.roomtype.RoomTypeUpdateRequest;
import com.hotelcontinental.catalog_service.dto.response.roomtype.RoomTypeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RoomTypeService {
    RoomTypeResponse createRoomType(RoomTypeCreationRequest request);
    Page<RoomTypeResponse> getAllRoomTypes(Pageable pageable);
    RoomTypeResponse getRoomType(String id);
    RoomTypeResponse updateRoomType(String id, RoomTypeUpdateRequest request);
    void deleteRoomType(String id);
    void restoreRoomType(String id);
}

