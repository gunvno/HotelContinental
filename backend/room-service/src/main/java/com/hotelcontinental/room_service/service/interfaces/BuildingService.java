package com.hotelcontinental.room_service.service.interfaces;

import com.hotelcontinental.room_service.dto.request.FullCreationRequest;
import com.hotelcontinental.room_service.dto.request.building.BuildingCreationRequest;
import com.hotelcontinental.room_service.dto.request.building.BuildingEditRequest;
import com.hotelcontinental.room_service.dto.response.FullCreationResponse;
import com.hotelcontinental.room_service.dto.response.building.BuildingCustomerResponse;
import com.hotelcontinental.room_service.dto.response.building.BuildingResponse;
import com.hotelcontinental.room_service.enums.BuildingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BuildingService {
    BuildingResponse createBuilding(BuildingCreationRequest request);
    void deleteBuilding(String buildingId);
    BuildingResponse editBuilding(String buildingId, BuildingEditRequest request);
    Page<BuildingResponse> getAllBuildings(Pageable pageable, String name,
                                           BuildingStatus status, String address);
    Page<BuildingCustomerResponse> getBuildings(Pageable pageable, String name,
                                                BuildingStatus status, String address);
    FullCreationResponse createFullBuilding(FullCreationRequest request);
}
