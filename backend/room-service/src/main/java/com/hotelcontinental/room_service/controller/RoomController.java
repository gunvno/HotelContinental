package com.hotelcontinental.room_service.controller;

import com.hotelcontinental.room_service.dto.ApiResponse;
import com.hotelcontinental.room_service.dto.request.room.RoomCreationRequest;
import com.hotelcontinental.room_service.dto.response.room.RoomForCustomerResponse;
import com.hotelcontinental.room_service.dto.response.room.RoomImageResponse;
import com.hotelcontinental.room_service.dto.response.room.RoomResponse;
import com.hotelcontinental.room_service.service.interfaces.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/room")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    @GetMapping("/customer")
    public ApiResponse<Page<RoomForCustomerResponse>> getRoom(Pageable pageable) {
        return ApiResponse.<Page<RoomForCustomerResponse>>builder()
                .result(roomService.getRoomForCustomer(pageable))
                .build();
    }

    @PostMapping
    public ApiResponse<RoomResponse> createRoom(@RequestBody RoomCreationRequest request) {
        return ApiResponse.<RoomResponse>builder()
                .result(roomService.createRoom(request))
                .build();
    }

    @PostMapping(value = "/{id}/images", consumes = "multipart/form-data")
    public ApiResponse<List<RoomImageResponse>> uploadRoomImages(
            @PathVariable String id,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "coverIndex", required = false) Integer coverIndex
    ) {
        return ApiResponse.<List<RoomImageResponse>>builder()
                .result(roomService.uploadRoomImages(id, files, coverIndex))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRoom(@PathVariable String id) {
        roomService.deleteRoom(id);
        return ApiResponse.<Void>builder().build();
    }
}
