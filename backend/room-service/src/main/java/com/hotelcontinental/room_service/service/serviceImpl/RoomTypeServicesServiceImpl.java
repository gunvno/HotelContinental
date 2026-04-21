package com.hotelcontinental.room_service.service.serviceImpl;

import com.hotelcontinental.room_service.dto.request.roomtypeservice.RoomTypeServiceCreationRequest;
import com.hotelcontinental.room_service.dto.request.roomtypeservice.RoomTypeServiceUpdateRequest;
import com.hotelcontinental.room_service.dto.response.roomtypeservice.RoomTypeServiceResponse;
import com.hotelcontinental.room_service.entity.RoomTypeServices;
import com.hotelcontinental.room_service.entity.RoomTypes;
import com.hotelcontinental.room_service.exception.AppException;
import com.hotelcontinental.room_service.exception.ErrorCode;
import com.hotelcontinental.room_service.repository.RoomTypeRepository;
import com.hotelcontinental.room_service.repository.RoomTypeServicesRepository;
import com.hotelcontinental.room_service.repository.httpclient.IdentityClient;
import com.hotelcontinental.room_service.service.interfaces.RoomTypeServicesService;
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
public class RoomTypeServicesServiceImpl implements RoomTypeServicesService {
    @Autowired
    private RoomTypeServicesRepository roomTypeServicesRepository;
    @Autowired
    private RoomTypeRepository roomTypeRepository;
    @Autowired
    private IdentityClient identityClient;

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public RoomTypeServiceResponse createRoomTypeService(RoomTypeServiceCreationRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String createdBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        RoomTypes roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        RoomTypeServices roomTypeService = RoomTypeServices.builder()
                .roomTypes(roomType)
                .serviceId(request.getServiceId())
                .amount(request.getAmount())
                .createdTime(LocalDateTime.now())
                .createdBy(createdBy)
                .build();

        return map(roomTypeServicesRepository.save(roomTypeService));
    }

    @Override
    public Page<RoomTypeServiceResponse> getAllRoomTypeServices(Pageable pageable) {
        return roomTypeServicesRepository.findAll(pageable).map(this::map);
    }

    @Override
    public Page<RoomTypeServiceResponse> getByRoomType(String roomTypeId, Pageable pageable) {
        return roomTypeServicesRepository.findByRoomTypesId(roomTypeId, pageable)
                .map(this::map);
    }

    @Override
    public RoomTypeServiceResponse getRoomTypeService(String id) {
        return map(roomTypeServicesRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public RoomTypeServiceResponse updateRoomTypeService(String id, RoomTypeServiceUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String modifiedBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        RoomTypeServices roomTypeService = roomTypeServicesRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        RoomTypeServices updated = roomTypeService.toBuilder()
                .serviceId(request.getServiceId() != null ? request.getServiceId() : roomTypeService.getServiceId())
                .amount(request.getAmount() > 0 ? request.getAmount() : roomTypeService.getAmount())
            .deleted(request.getDeleted() != null ? request.getDeleted() : roomTypeService.getDeleted())
            .deletedTime(Boolean.TRUE.equals(request.getDeleted()) ? LocalDateTime.now() : (Boolean.FALSE.equals(request.getDeleted()) ? null : roomTypeService.getDeletedTime()))
            .deletedBy(Boolean.TRUE.equals(request.getDeleted()) ? modifiedBy : (Boolean.FALSE.equals(request.getDeleted()) ? null : roomTypeService.getDeletedBy()))
                .modifiedTime(LocalDateTime.now())
                .modifiedBy(modifiedBy)
                .build();

        return map(roomTypeServicesRepository.save(updated));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public void deleteRoomTypeService(String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String deletedBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        RoomTypeServices roomTypeService = roomTypeServicesRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        roomTypeServicesRepository.save(roomTypeService.toBuilder()
                .deleted(true)
                .deletedTime(LocalDateTime.now())
                .deletedBy(deletedBy)
                .build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public void restoreRoomTypeService(String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String modifiedBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        RoomTypeServices roomTypeService = roomTypeServicesRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        roomTypeServicesRepository.save(roomTypeService.toBuilder()
                .deleted(false)
                .deletedTime(null)
                .deletedBy(null)
                .modifiedTime(LocalDateTime.now())
                .modifiedBy(modifiedBy)
                .build());
    }

    private RoomTypeServiceResponse map(RoomTypeServices entity) {
        return RoomTypeServiceResponse.builder()
                .id(entity.getId())
                .roomTypeId(entity.getRoomTypes().getId())
                .serviceId(entity.getServiceId())
                .amount(entity.getAmount())
                .createdTime(entity.getCreatedTime())
                .createdBy(entity.getCreatedBy())
                .modifiedTime(entity.getModifiedTime())
                .modifiedBy(entity.getModifiedBy())
                .deleted(entity.getDeleted())
                .build();
    }
}
