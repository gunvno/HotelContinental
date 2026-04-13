package com.hotelcontinental.room_service.service.serviceImpl;

import com.hotelcontinental.room_service.dto.request.amenityroom.AmenityRoomCreationRequest;
import com.hotelcontinental.room_service.dto.request.amenityroom.AmenityRoomUpdateRequest;
import com.hotelcontinental.room_service.dto.response.amenity.AmenityResponse;
import com.hotelcontinental.room_service.dto.response.amenityroom.AmenityRoomResponse;
import com.hotelcontinental.room_service.entity.Amenities;
import com.hotelcontinental.room_service.entity.AmenityRooms;
import com.hotelcontinental.room_service.entity.RoomTypes;
import com.hotelcontinental.room_service.exception.AppException;
import com.hotelcontinental.room_service.exception.ErrorCode;
import com.hotelcontinental.room_service.repository.AmenitiesRepository;
import com.hotelcontinental.room_service.repository.AmenitiesRoomsRepository;
import com.hotelcontinental.room_service.repository.RoomTypeRepository;
import com.hotelcontinental.room_service.repository.httpclient.IdentityClient;
import com.hotelcontinental.room_service.service.interfaces.AmenityRoomService;
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
import java.util.List;

@Service
public class AmenityRoomServiceImpl implements AmenityRoomService {
    @Autowired
    private AmenitiesRoomsRepository amenityRoomsRepository;
    @Autowired
    private AmenitiesRepository amenitiesRepository;
    @Autowired
    private RoomTypeRepository roomTypeRepository;
    @Autowired
    private IdentityClient identityClient;

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public AmenityRoomResponse createAmenityRoom(AmenityRoomCreationRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String createdBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        Amenities amenity = amenitiesRepository.findByIdAndDeletedFalse(request.getAmenityId())
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        RoomTypes roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        AmenityRooms amenityRoom = AmenityRooms.builder()
            .amenity(amenity)
            .roomTypes(roomType)
            .amount(request.getAmount())
            .createdBy(createdBy)
            .createdTime(LocalDateTime.now())
            .build();

        AmenityRooms savedAmenityRoom = amenityRoomsRepository.save(amenityRoom);
        return mapToAmenityRoomResponse(savedAmenityRoom);
    }

    @Override
    public Page<AmenityRoomResponse> getAmenitiesByRoomType(String roomTypeId, Pageable pageable) {
        return amenityRoomsRepository.findByRoomTypesIdAndDeletedFalse(roomTypeId, pageable)
                .map(this::mapToAmenityRoomResponse);
    }

    @Override
    public AmenityRoomResponse getAmenityRoom(String id) {
        AmenityRooms amenityRoom = amenityRoomsRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
        return mapToAmenityRoomResponse(amenityRoom);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public AmenityRoomResponse updateAmenityRoom(String id, AmenityRoomUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String modifiedBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        AmenityRooms amenityRoom = amenityRoomsRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        AmenityRooms updatedAmenityRoom = amenityRoomsRepository.save(amenityRoom.toBuilder()
            .amount(request.getAmount() > 0 ? request.getAmount() : amenityRoom.getAmount())
            .modifiedTime(LocalDateTime.now())
            .modifiedBy(modifiedBy)
            .build());
        return mapToAmenityRoomResponse(updatedAmenityRoom);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public void deleteAmenityRoom(String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String deletedBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        AmenityRooms amenityRoom = amenityRoomsRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        amenityRoomsRepository.save(amenityRoom.toBuilder()
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

    private AmenityRoomResponse mapToAmenityRoomResponse(AmenityRooms amenityRoom) {
        return AmenityRoomResponse.builder()
                .id(amenityRoom.getId())
                .amenity(mapToAmenityResponse(amenityRoom.getAmenity()))
                .roomTypeId(amenityRoom.getRoomTypes().getId())
                .amount(amenityRoom.getAmount())
                .createdBy(amenityRoom.getCreatedBy())
                .createdTime(amenityRoom.getCreatedTime())
                .modifiedBy(amenityRoom.getModifiedBy())
                .modifiedTime(amenityRoom.getModifiedTime())
                .deleted(amenityRoom.getDeleted())
                .build();
    }
}
