package com.hotelcontinental.room_service.service.interfaces;

import com.hotelcontinental.room_service.dto.request.building.BuildingSetupRequest;
import com.hotelcontinental.room_service.dto.response.building.BuildingResponse;
import com.hotelcontinental.room_service.dto.response.building.BuildingSetupResponse;
import com.hotelcontinental.room_service.dto.response.building.FloorResponse;

import java.util.List;

public interface BuildingService {
    BuildingSetupResponse setupBuilding(BuildingSetupRequest request);
    List<BuildingResponse> getBuildings();
    List<FloorResponse> getFloorsByBuilding(String buildingId);
}
