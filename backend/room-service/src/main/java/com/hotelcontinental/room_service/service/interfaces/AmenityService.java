package com.hotelcontinental.room_service.service.interfaces;

import com.hotelcontinental.room_service.dto.request.amenity.AmenityCreationRequest;
import com.hotelcontinental.room_service.dto.request.amenity.AmenityUpdateRequest;
import com.hotelcontinental.room_service.dto.response.amenity.AmenityResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AmenityService {
    AmenityResponse createAmenity(AmenityCreationRequest request);
    Page<AmenityResponse> getAllAmenities(Pageable pageable);
    AmenityResponse getAmenity(String id);
    AmenityResponse updateAmenity(String id, AmenityUpdateRequest request);
    void deleteAmenity(String id);
}
