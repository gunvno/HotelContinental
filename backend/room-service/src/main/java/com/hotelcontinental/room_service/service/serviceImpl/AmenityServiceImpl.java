package com.hotelcontinental.room_service.service.serviceImpl;

import com.hotelcontinental.room_service.dto.request.amenity.AmenityCreationRequest;
import com.hotelcontinental.room_service.dto.request.amenity.AmenityUpdateRequest;
import com.hotelcontinental.room_service.dto.response.amenity.AmenityResponse;
import com.hotelcontinental.room_service.entity.Amenities;
import com.hotelcontinental.room_service.enums.AmenityStatus;
import com.hotelcontinental.room_service.exception.AppException;
import com.hotelcontinental.room_service.exception.ErrorCode;
import com.hotelcontinental.room_service.repository.AmenitiesRepository;
import com.hotelcontinental.room_service.repository.httpclient.IdentityClient;
import com.hotelcontinental.room_service.service.interfaces.AmenityService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AmenityServiceImpl implements AmenityService {
    @Autowired
    private AmenitiesRepository amenitiesRepository;
    @Autowired
    private IdentityClient identityClient;

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public AmenityResponse createAmenity(AmenityCreationRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String createdBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        Amenities amenity = Amenities.builder()
            .name(request.getName())
            .description(request.getDescription())
            .status(AmenityStatus.AVAILABLE)
            .createdBy(createdBy)
            .createdTime(LocalDateTime.now())
            .build();

        Amenities savedAmenity = amenitiesRepository.save(amenity);
        return mapToAmenityResponse(savedAmenity);
    }

    @Override
    public Page<AmenityResponse> getAllAmenities(Pageable pageable) {
        Page<Amenities> amenities = amenitiesRepository.findByDeletedFalse(pageable);
        return amenities.map(this::mapToAmenityResponse);
    }

    @Override
    public AmenityResponse getAmenity(String id) {
        Amenities amenity = amenitiesRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
        return mapToAmenityResponse(amenity);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public AmenityResponse updateAmenity(String id, AmenityUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String modifiedBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        Amenities amenity = amenitiesRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        Amenities updatedAmenity = amenitiesRepository.save(amenity.toBuilder()
                .name(request.getName() != null ? request.getName() : amenity.getName())
                .description(request.getDescription() != null ? request.getDescription() : amenity.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : amenity.getStatus())
                .modifiedTime(LocalDateTime.now())
                .modifiedBy(modifiedBy)
                .build());
        return mapToAmenityResponse(updatedAmenity);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public void deleteAmenity(String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String deletedBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        Amenities amenity = amenitiesRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        amenitiesRepository.save(amenity.toBuilder()
            .deleted(true)
            .deletedTime(LocalDateTime.now())
            .deletedBy(deletedBy)
            .build());
    }

    private AmenityResponse mapToAmenityResponse(Amenities amenity) {
        return AmenityResponse.builder()
                .id(amenity.getId())
                .name(amenity.getName())
                .description(amenity.getDescription())
                .status(amenity.getStatus())
                .createdBy(amenity.getCreatedBy())
                .createdTime(amenity.getCreatedTime())
                .modifiedBy(amenity.getModifiedBy())
                .modifiedTime(amenity.getModifiedTime())
                .deleted(amenity.getDeleted())
                .build();
    }
}
