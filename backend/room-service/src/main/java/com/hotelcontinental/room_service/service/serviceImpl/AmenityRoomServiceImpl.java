package com.hotelcontinental.room_service.service.serviceImpl;

import com.hotelcontinental.room_service.dto.request.amenityroom.AmenityRoomCreationRequest;
import com.hotelcontinental.room_service.dto.request.amenityroom.AmenityRoomUpdateRequest;
import com.hotelcontinental.room_service.dto.response.amenityroom.AmenityRoomResponse;
import com.hotelcontinental.room_service.entity.AmenityRooms;
import com.hotelcontinental.room_service.exception.AppException;
import com.hotelcontinental.room_service.exception.ErrorCode;
import com.hotelcontinental.room_service.repository.AmenitiesRoomsRepository;
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
    private IdentityClient identityClient;

    @PreAuthorize("hasAuthority('AMENITY_ROOM_CREATE')")
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

        AmenityRooms amenityRoom = AmenityRooms.builder()
            .amenityId(request.getAmenityId())
            .roomTypeId(request.getRoomTypeId())
            .amount(request.getAmount())
            .createdBy(createdBy)
            .createdTime(LocalDateTime.now())
            .build();

        AmenityRooms savedAmenityRoom = amenityRoomsRepository.save(amenityRoom);
        return mapToAmenityRoomResponse(savedAmenityRoom);
    }

    @Override
    public Page<AmenityRoomResponse> getAmenitiesByRoomType(String roomTypeId, Pageable pageable) {
        return amenityRoomsRepository.findByRoomTypeId(roomTypeId, pageable)
                .map(this::mapToAmenityRoomResponse);
    }

    @Override
    public AmenityRoomResponse getAmenityRoom(String id) {
        AmenityRooms amenityRoom = amenityRoomsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
        return mapToAmenityRoomResponse(amenityRoom);
    }

    @PreAuthorize("hasAuthority('AMENITY_ROOM_UPDATE')")
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

        AmenityRooms amenityRoom = amenityRoomsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        AmenityRooms updatedAmenityRoom = amenityRoomsRepository.save(amenityRoom.toBuilder()
            .roomTypeId(request.getRoomTypeId() != null ? request.getRoomTypeId() : amenityRoom.getRoomTypeId())
            .amenityId(request.getAmenityId() != null ? request.getAmenityId() : amenityRoom.getAmenityId())
            .amount(request.getAmount() > 0 ? request.getAmount() : amenityRoom.getAmount())
            .deleted(request.getDeleted() != null ? request.getDeleted() : amenityRoom.getDeleted())
            .deletedTime(Boolean.TRUE.equals(request.getDeleted()) ? LocalDateTime.now() : (Boolean.FALSE.equals(request.getDeleted()) ? null : amenityRoom.getDeletedTime()))
            .deletedBy(Boolean.TRUE.equals(request.getDeleted()) ? modifiedBy : (Boolean.FALSE.equals(request.getDeleted()) ? null : amenityRoom.getDeletedBy()))
            .modifiedTime(LocalDateTime.now())
            .modifiedBy(modifiedBy)
            .build());
        return mapToAmenityRoomResponse(updatedAmenityRoom);
    }

    @PreAuthorize("hasAuthority('AMENITY_ROOM_DELETE')")
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

        AmenityRooms amenityRoom = amenityRoomsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        amenityRoomsRepository.save(amenityRoom.toBuilder()
            .deleted(true)
            .deletedTime(LocalDateTime.now())
            .deletedBy(deletedBy)
            .build());
    }

    @PreAuthorize("hasAuthority('AMENITY_ROOM_RESTORE')")
    @Transactional
    @Override
    public void restoreAmenityRoom(String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String modifiedBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        AmenityRooms amenityRoom = amenityRoomsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        amenityRoomsRepository.save(amenityRoom.toBuilder()
                .deleted(false)
                .deletedTime(null)
                .deletedBy(null)
                .modifiedTime(LocalDateTime.now())
                .modifiedBy(modifiedBy)
                .build());
    }

    private AmenityRoomResponse mapToAmenityRoomResponse(AmenityRooms amenityRoom) {
        return AmenityRoomResponse.builder()
                .id(amenityRoom.getId())
                .amenityId(amenityRoom.getAmenityId())
                .roomTypeId(amenityRoom.getRoomTypeId())
                .amount(amenityRoom.getAmount())
                .createdBy(amenityRoom.getCreatedBy())
                .createdTime(amenityRoom.getCreatedTime())
                .modifiedBy(amenityRoom.getModifiedBy())
                .modifiedTime(amenityRoom.getModifiedTime())
                .deleted(amenityRoom.getDeleted())
                .build();
    }
}
