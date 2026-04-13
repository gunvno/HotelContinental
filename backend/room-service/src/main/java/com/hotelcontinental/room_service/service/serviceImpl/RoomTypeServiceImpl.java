package com.hotelcontinental.room_service.service.serviceImpl;

import com.hotelcontinental.room_service.dto.request.roomtype.RoomTypeCreationRequest;
import com.hotelcontinental.room_service.dto.request.roomtype.RoomTypeUpdateRequest;
import com.hotelcontinental.room_service.dto.response.roomtype.RoomTypeResponse;
import com.hotelcontinental.room_service.entity.RoomTypes;
import com.hotelcontinental.room_service.exception.AppException;
import com.hotelcontinental.room_service.exception.ErrorCode;
import com.hotelcontinental.room_service.repository.RoomTypeRepository;
import com.hotelcontinental.room_service.repository.httpclient.IdentityClient;
import com.hotelcontinental.room_service.service.interfaces.RoomTypeService;
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
public class RoomTypeServiceImpl implements RoomTypeService {
    @Autowired
    private IdentityClient identityClient;
    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public RoomTypeResponse createRoomType(RoomTypeCreationRequest request){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String createdBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        RoomTypes roomType = RoomTypes.builder()
                .name(request.getName())
                .description(request.getDescription())
                .maximumOccupancy(request.getMaximumOccupancy())
                .quantity(0)
                .createdBy(createdBy)
                .createdTime(LocalDateTime.now())
                .build();
        RoomTypes savedRoomType = roomTypeRepository.save(roomType);
        return mapToRoomTypeResponse(savedRoomType, createdBy);
    }

    @Override
    public Page<RoomTypeResponse> getAllRoomTypes(Pageable pageable) {
        Page<RoomTypes> roomTypes = roomTypeRepository.findAll(pageable);
        return roomTypes.map(this::mapToRoomTypeResponseSimple);
    }

    @Override
    public RoomTypeResponse getRoomType(String id) {
        RoomTypes roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        return mapToRoomTypeResponseSimple(roomType);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public RoomTypeResponse updateRoomType(String id, RoomTypeUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String modifiedBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        RoomTypes roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        RoomTypes updatedRoomType = roomType.toBuilder()
                .name(request.getName() != null ? request.getName() : roomType.getName())
                .description(request.getDescription() != null ? request.getDescription() : roomType.getDescription())
                .maximumOccupancy(request.getMaximumOccupancy() > 0 ? request.getMaximumOccupancy() : roomType.getMaximumOccupancy())
                .quantity(request.getQuantity() >= 0 ? request.getQuantity() : roomType.getQuantity())
                .modifiedTime(LocalDateTime.now())
                .modifiedBy(modifiedBy)
                .build();
        updatedRoomType = roomTypeRepository.save(updatedRoomType);
        return mapToRoomTypeResponseSimple(updatedRoomType);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public void deleteRoomType(String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String deletedBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        RoomTypes roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        roomTypeRepository.save(roomType.toBuilder()
            .deleted(true)
            .deletedTime(LocalDateTime.now())
            .deletedBy(deletedBy)
            .build());
    }

    private RoomTypeResponse mapToRoomTypeResponse(RoomTypes roomType, String creator) {
        return RoomTypeResponse.builder()
                .id(roomType.getId())
                .name(roomType.getName())
                .description(roomType.getDescription())
                .maximumOccupancy(roomType.getMaximumOccupancy())
                .quantity(roomType.getQuantity())
                .createdBy(creator)
                .createdTime(roomType.getCreatedTime())
                .modifiedBy(roomType.getModifiedBy())
                .modifiedTime(roomType.getModifiedTime())
                .deleted(roomType.getDeleted())
                .build();
    }

    private RoomTypeResponse mapToRoomTypeResponseSimple(RoomTypes roomType) {
        return RoomTypeResponse.builder()
                .id(roomType.getId())
                .name(roomType.getName())
                .description(roomType.getDescription())
                .maximumOccupancy(roomType.getMaximumOccupancy())
                .quantity(roomType.getQuantity())
                .createdBy(roomType.getCreatedBy())
                .createdTime(roomType.getCreatedTime())
                .modifiedBy(roomType.getModifiedBy())
                .modifiedTime(roomType.getModifiedTime())
                .deleted(roomType.getDeleted())
                .build();
    }
}
