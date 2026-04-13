package com.hotelcontinental.room_service.controller;

import com.hotelcontinental.room_service.dto.ApiResponse;
import com.hotelcontinental.room_service.dto.request.roomtypeservice.RoomTypeServiceCreationRequest;
import com.hotelcontinental.room_service.dto.request.roomtypeservice.RoomTypeServiceUpdateRequest;
import com.hotelcontinental.room_service.dto.response.roomtypeservice.RoomTypeServiceResponse;
import com.hotelcontinental.room_service.service.interfaces.RoomTypeServicesService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/roomTypeService")
@RequiredArgsConstructor
public class RoomTypeServicesController {
    @Autowired
    private RoomTypeServicesService roomTypeServicesService;

    @PostMapping
    public ApiResponse<RoomTypeServiceResponse> createRoomTypeService(@RequestBody RoomTypeServiceCreationRequest request) {
        return ApiResponse.<RoomTypeServiceResponse>builder()
                .result(roomTypeServicesService.createRoomTypeService(request))
                .build();
    }

    @GetMapping
    public ApiResponse<Page<RoomTypeServiceResponse>> getAllRoomTypeServices(Pageable pageable) {
        return ApiResponse.<Page<RoomTypeServiceResponse>>builder()
                .result(roomTypeServicesService.getAllRoomTypeServices(pageable))
                .build();
    }

    @GetMapping("/roomType/{roomTypeId}")
        public ApiResponse<Page<RoomTypeServiceResponse>> getByRoomType(
            @PathVariable String roomTypeId,
            Pageable pageable
        ) {
        return ApiResponse.<Page<RoomTypeServiceResponse>>builder()
            .result(roomTypeServicesService.getByRoomType(roomTypeId, pageable))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<RoomTypeServiceResponse> getRoomTypeService(@PathVariable String id) {
        return ApiResponse.<RoomTypeServiceResponse>builder()
                .result(roomTypeServicesService.getRoomTypeService(id))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<RoomTypeServiceResponse> updateRoomTypeService(
            @PathVariable String id,
            @RequestBody RoomTypeServiceUpdateRequest request) {
        return ApiResponse.<RoomTypeServiceResponse>builder()
                .result(roomTypeServicesService.updateRoomTypeService(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRoomTypeService(@PathVariable String id) {
        roomTypeServicesService.deleteRoomTypeService(id);
        return ApiResponse.<Void>builder().build();
    }
}
