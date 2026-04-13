package com.hotelcontinental.room_service.controller;

import com.hotelcontinental.room_service.dto.ApiResponse;
import com.hotelcontinental.room_service.dto.request.amenityroom.AmenityRoomCreationRequest;
import com.hotelcontinental.room_service.dto.request.amenityroom.AmenityRoomUpdateRequest;
import com.hotelcontinental.room_service.dto.response.amenityroom.AmenityRoomResponse;
import com.hotelcontinental.room_service.service.interfaces.AmenityRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/amenityRoom")
@RequiredArgsConstructor
public class AmenityRoomController {
    @Autowired
    private AmenityRoomService amenityRoomService;

    @PostMapping
    public ApiResponse<AmenityRoomResponse> createAmenityRoom(@RequestBody AmenityRoomCreationRequest request) {
        return ApiResponse.<AmenityRoomResponse>builder()
                .result(amenityRoomService.createAmenityRoom(request))
                .build();
    }

    @GetMapping("/roomType/{roomTypeId}")
        public ApiResponse<Page<AmenityRoomResponse>> getAmenitiesByRoomType(
            @PathVariable String roomTypeId,
            Pageable pageable
        ) {
        return ApiResponse.<Page<AmenityRoomResponse>>builder()
            .result(amenityRoomService.getAmenitiesByRoomType(roomTypeId, pageable))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<AmenityRoomResponse> getAmenityRoom(@PathVariable String id) {
        return ApiResponse.<AmenityRoomResponse>builder()
                .result(amenityRoomService.getAmenityRoom(id))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<AmenityRoomResponse> updateAmenityRoom(
            @PathVariable String id,
            @RequestBody AmenityRoomUpdateRequest request) {
        return ApiResponse.<AmenityRoomResponse>builder()
                .result(amenityRoomService.updateAmenityRoom(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAmenityRoom(@PathVariable String id) {
        amenityRoomService.deleteAmenityRoom(id);
        return ApiResponse.<Void>builder().build();
    }
}
