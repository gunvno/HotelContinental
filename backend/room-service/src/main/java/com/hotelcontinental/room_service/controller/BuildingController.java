package com.hotelcontinental.room_service.controller;

import com.hotelcontinental.identity_service.dto.response.ProfileExpand.ProfileExpandResponse;
import com.hotelcontinental.room_service.dto.ApiResponse;
import com.hotelcontinental.room_service.dto.request.FullCreationRequest;
import com.hotelcontinental.room_service.dto.request.building.BuildingCreationRequest;
import com.hotelcontinental.room_service.dto.request.building.BuildingEditRequest;
import com.hotelcontinental.room_service.dto.response.FullCreationResponse;
import com.hotelcontinental.room_service.dto.response.building.BuildingCustomerResponse;
import com.hotelcontinental.room_service.dto.response.building.BuildingResponse;
import com.hotelcontinental.room_service.enums.BuildingStatus;
import com.hotelcontinental.room_service.service.interfaces.BuildingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/building")
@RequiredArgsConstructor
public class BuildingController {
    @Autowired
    private BuildingService buildingService;

    @PostMapping("/create")
    ApiResponse<BuildingResponse> createBuilding(@RequestBody BuildingCreationRequest request){
        return ApiResponse.<BuildingResponse>builder()
                .result(buildingService.createBuilding(request))
                .build();
    }
    @PostMapping("/delete")
    ApiResponse<Void> deleteBuilding(@RequestBody String buildingId) {
        buildingService.deleteBuilding(buildingId);
        return ApiResponse.<Void>builder().build();
    }

    @PutMapping("/edit/{buildingId}")
    ApiResponse<BuildingResponse> editBuilding(@PathVariable String buildingId,
                                               @RequestBody BuildingEditRequest request) {
        return ApiResponse.<BuildingResponse>builder()
                .result(buildingService.editBuilding(buildingId, request))
                .build();
    }
    @GetMapping("/all")
    ApiResponse<Page<BuildingResponse>> getAllBuilding(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) BuildingStatus status,
            @RequestParam(required = false) String address
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<Page<BuildingResponse>>builder()
                .result(buildingService.getAllBuildings(pageable, name, status, address))
                .build();
    }
    @GetMapping("/get")
    ApiResponse<Page<BuildingCustomerResponse>> getBuilding(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) BuildingStatus status,
            @RequestParam(required = false) String address
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<Page<BuildingCustomerResponse>>builder()
                .result(buildingService.getBuildings(pageable, name, status, address))
                .build();
    }
    @PostMapping("/createFull")
    ApiResponse<FullCreationResponse> createFull(@RequestBody FullCreationRequest request) {
        return ApiResponse.<FullCreationResponse>builder()
                .result(buildingService.createFullBuilding(request))
                .build();
    }


}
