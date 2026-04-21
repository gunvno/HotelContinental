package com.hotelcontinental.room_service.service.interfaces;

import com.hotelcontinental.room_service.dto.request.roomtypeservice.RoomTypeServiceCreationRequest;
import com.hotelcontinental.room_service.dto.request.roomtypeservice.RoomTypeServiceUpdateRequest;
import com.hotelcontinental.room_service.dto.response.roomtypeservice.RoomTypeServiceResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RoomTypeServicesService {
    RoomTypeServiceResponse createRoomTypeService(RoomTypeServiceCreationRequest request);
    Page<RoomTypeServiceResponse> getAllRoomTypeServices(Pageable pageable);
    Page<RoomTypeServiceResponse> getByRoomType(String roomTypeId, Pageable pageable);
    RoomTypeServiceResponse getRoomTypeService(String id);
    RoomTypeServiceResponse updateRoomTypeService(String id, RoomTypeServiceUpdateRequest request);
    void deleteRoomTypeService(String id);
    void restoreRoomTypeService(String id);
}
