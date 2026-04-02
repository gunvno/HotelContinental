package com.hotelcontinental.room_service.controller;

import com.hotelcontinental.room_service.dto.ApiResponse;
import com.hotelcontinental.room_service.dto.response.floor.FloorCustomerResponse;
import com.hotelcontinental.room_service.service.interfaces.FloorService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/floor")
@RequiredArgsConstructor
public class FloorController {
    @Autowired
    private FloorService floorService;

    @GetMapping("/{buildingId}")
    public ApiResponse<List<FloorCustomerResponse>> getFloorsByBuilding(@PathVariable String buildingId){
        return ApiResponse.<List<FloorCustomerResponse>>builder()
                .result(floorService.getFloor(buildingId))
                .build();

    }
}
