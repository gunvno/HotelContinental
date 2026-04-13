package com.hotelcontinental.room_service.controller;

import com.hotelcontinental.room_service.dto.ApiResponse;
import com.hotelcontinental.room_service.dto.request.amenity.AmenityCreationRequest;
import com.hotelcontinental.room_service.dto.request.amenity.AmenityUpdateRequest;
import com.hotelcontinental.room_service.dto.response.amenity.AmenityResponse;
import com.hotelcontinental.room_service.service.interfaces.AmenityService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/amenity")
@RequiredArgsConstructor
public class AmenityController {
    @Autowired
    private AmenityService amenityService;

    @PostMapping
    public ApiResponse<AmenityResponse> createAmenity(@RequestBody AmenityCreationRequest request) {
        return ApiResponse.<AmenityResponse>builder()
                .result(amenityService.createAmenity(request))
                .build();
    }

    @GetMapping
    public ApiResponse<Page<AmenityResponse>> getAllAmenities(Pageable pageable) {
        return ApiResponse.<Page<AmenityResponse>>builder()
                .result(amenityService.getAllAmenities(pageable))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<AmenityResponse> getAmenity(@PathVariable String id) {
        return ApiResponse.<AmenityResponse>builder()
                .result(amenityService.getAmenity(id))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<AmenityResponse> updateAmenity(
            @PathVariable String id,
            @RequestBody AmenityUpdateRequest request) {
        return ApiResponse.<AmenityResponse>builder()
                .result(amenityService.updateAmenity(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAmenity(@PathVariable String id) {
        amenityService.deleteAmenity(id);
        return ApiResponse.<Void>builder().build();
    }
}
