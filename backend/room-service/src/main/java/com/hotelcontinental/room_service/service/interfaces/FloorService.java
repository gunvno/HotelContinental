package com.hotelcontinental.room_service.service.interfaces;

import com.hotelcontinental.room_service.dto.request.floor.FloorCreationRequest;
import com.hotelcontinental.room_service.dto.response.floor.FloorCustomerResponse;
import com.hotelcontinental.room_service.dto.response.floor.FloorResponse;

import java.util.List;

public interface FloorService {
    FloorResponse createFloor(FloorCreationRequest request);
    List<FloorCustomerResponse> getFloor(String buildingId);
}
