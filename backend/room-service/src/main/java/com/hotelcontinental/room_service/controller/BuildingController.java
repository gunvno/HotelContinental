package com.hotelcontinental.room_service.controller;

import com.hotelcontinental.room_service.dto.ApiResponse;
import com.hotelcontinental.room_service.dto.request.building.BuildingSetupRequest;
import com.hotelcontinental.room_service.dto.response.building.BuildingResponse;
import com.hotelcontinental.room_service.dto.response.building.BuildingSetupResponse;
import com.hotelcontinental.room_service.dto.response.building.FloorResponse;
import com.hotelcontinental.room_service.service.interfaces.BuildingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/building")
@RequiredArgsConstructor
public class BuildingController {
    private final BuildingService buildingService;

    @PostMapping("/setup")
    public ApiResponse<BuildingSetupResponse> setupBuilding(@RequestBody BuildingSetupRequest request) {
        return ApiResponse.<BuildingSetupResponse>builder()
                .result(buildingService.setupBuilding(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<BuildingResponse>> getBuildings() {
        return ApiResponse.<List<BuildingResponse>>builder()
                .result(buildingService.getBuildings())
                .build();
    }

    @GetMapping("/{buildingId}/floors")
    public ApiResponse<List<FloorResponse>> getFloorsByBuilding(@PathVariable String buildingId) {
        return ApiResponse.<List<FloorResponse>>builder()
                .result(buildingService.getFloorsByBuilding(buildingId))
                .build();
    }
}
