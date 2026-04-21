package com.hotelcontinental.room_service.controller;

import com.hotelcontinental.room_service.dto.ApiResponse;
import com.hotelcontinental.room_service.dto.request.roomtype.RoomTypeCreationRequest;
import com.hotelcontinental.room_service.dto.request.roomtype.RoomTypeUpdateRequest;
import com.hotelcontinental.room_service.dto.response.roomtype.RoomTypeResponse;
import com.hotelcontinental.room_service.service.interfaces.RoomTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/roomType")
@RequiredArgsConstructor
public class RoomTypeController {
    @Autowired
    private RoomTypeService roomTypeService;

    @PostMapping
    ApiResponse<RoomTypeResponse> createRoomType(@RequestBody RoomTypeCreationRequest request) {
        return ApiResponse.<RoomTypeResponse>builder()
                .result(roomTypeService.createRoomType(request))
                .build();
    }

    @GetMapping
    ApiResponse<Page<RoomTypeResponse>> getAllRoomTypes(Pageable pageable) {
        return ApiResponse.<Page<RoomTypeResponse>>builder()
                .result(roomTypeService.getAllRoomTypes(pageable))
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<RoomTypeResponse> getRoomType(@PathVariable String id) {
        return ApiResponse.<RoomTypeResponse>builder()
                .result(roomTypeService.getRoomType(id))
                .build();
    }

    @PutMapping("/{id}")
    ApiResponse<RoomTypeResponse> updateRoomType(@PathVariable String id, @RequestBody RoomTypeUpdateRequest request) {
        return ApiResponse.<RoomTypeResponse>builder()
                .result(roomTypeService.updateRoomType(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    ApiResponse<Void> deleteRoomType(@PathVariable String id) {
        roomTypeService.deleteRoomType(id);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/{id}/restore")
    ApiResponse<Void> restoreRoomType(@PathVariable String id) {
        roomTypeService.restoreRoomType(id);
        return ApiResponse.<Void>builder().build();
    }
}
