package com.hotelcontinental.room_service.service.serviceImpl;

import com.hotelcontinental.room_service.dto.request.room.RoomCreationRequest;
import com.hotelcontinental.room_service.dto.response.room.RoomForCustomerResponse;
import com.hotelcontinental.room_service.dto.response.room.RoomImageResponse;
import com.hotelcontinental.room_service.dto.response.room.RoomResponse;
import com.hotelcontinental.room_service.dto.response.room.RoomDetailResponse;
import com.hotelcontinental.room_service.enums.RoomStatus;
import com.hotelcontinental.room_service.exception.AppException;
import com.hotelcontinental.room_service.exception.ErrorCode;
import com.hotelcontinental.room_service.entity.Images;
import com.hotelcontinental.room_service.entity.Rooms;
import com.hotelcontinental.room_service.repository.ImageRepository;
import com.hotelcontinental.room_service.repository.httpclient.IdentityClient;
import com.hotelcontinental.room_service.repository.RoomRepository;
import com.hotelcontinental.room_service.service.interfaces.CloudinaryService;
import com.hotelcontinental.room_service.service.interfaces.RoomService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RoomServiceImpl implements RoomService {
    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private IdentityClient identityClient;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Value("${cloudinary.folder:hotelcontinental_rooms}")
    private String cloudinaryFolder;

    @PreAuthorize("hasAuthority('ROOM_DELETE')")
    @Transactional
    @Override
    public void deleteRoom(String id){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Rooms room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String deletedBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        roomRepository.save(room.toBuilder()
            .deleted(true)
            .deletedTime(LocalDateTime.now())
            .deletedBy(deletedBy)
            .build());
    }

    public Page<RoomForCustomerResponse> getRoomForCustomer(Pageable pageable) {
           return roomRepository.findAllByDeletedFalse(pageable)
               .map(room -> RoomForCustomerResponse.builder()
                   .id(room.getId())
                   .roomTypeId(room.getRoomTypeId())
                   .floorId(room.getFloorId())
                   .image(room.getImage())
                   .name(room.getName())
                   .pricePerDay(room.getPricePerDay())
                   .pricePerHour(room.getPricePerHour())
                   .description(room.getDescription())
                   .roomSize(room.getRoomSize())
                   .status(room.getStatus())
                   .build());
    }

    @PreAuthorize("hasAuthority('ROOM_CREATE')")
    @Transactional
    @Override
    public RoomResponse createRoom(RoomCreationRequest request){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String createdBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();
        boolean roomExists = roomRepository.existsByNameAndFloorId(request.getName(), request.getFloorId());
        if(roomExists)
            throw new AppException(ErrorCode.ROOM_ALREADY_EXISTS);
        Rooms room = Rooms.builder()
                .name(request.getName())
                .pricePerDay(request.getPricePerDay())
                .pricePerHour(request.getPricePerHour())
                .description(request.getDescription())
                .roomSize(request.getRoomSize())
                .status(RoomStatus.AVAILABLE)
                .roomTypeId(request.getRoomTypeId())
                .floorId(request.getFloorId())
                .createdTime(LocalDateTime.now())
                .createdBy(createdBy)
                .build();
        roomRepository.save(room);
        return RoomResponse.builder()
            .id(room.getId())
                .floorId(room.getFloorId())
                .name(request.getName())
                .pricePerDay(request.getPricePerDay())
                .pricePerHour(request.getPricePerHour())
                .description(request.getDescription())
                .roomSize(request.getRoomSize())
                .status(RoomStatus.AVAILABLE)
                .roomTypeId(room.getRoomTypeId())
                .createdTime(LocalDateTime.now())
                .createdBy(createdBy)
                .modifiedTime(null)
                .modifiedBy(null)
                .deleted(false)
                .deletedTime(null)
                .deletedBy(null)
                .build();
    }

    @PreAuthorize("hasAuthority('ROOM_UPDATE')")
    @Transactional
    @Override
    public RoomResponse updateRoom(String id, RoomCreationRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Rooms room = roomRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String modifiedBy = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        RoomStatus status = request.getStatus() != null ? request.getStatus() : room.getStatus();
        Rooms updated = room.toBuilder()
                .name(request.getName())
                .pricePerDay(request.getPricePerDay())
                .pricePerHour(request.getPricePerHour())
                .description(request.getDescription())
                .roomSize(request.getRoomSize())
                .status(status)
                .roomTypeId(request.getRoomTypeId())
                .floorId(request.getFloorId())
                .modifiedTime(LocalDateTime.now())
                .modifiedBy(modifiedBy)
                .build();

        Rooms saved = roomRepository.save(updated);
        return RoomResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .image(saved.getImage())
                .floorId(saved.getFloorId())
                .pricePerDay(saved.getPricePerDay())
                .pricePerHour(saved.getPricePerHour())
                .description(saved.getDescription())
                .roomSize(saved.getRoomSize())
                .status(saved.getStatus())
                .roomTypeId(saved.getRoomTypeId())
                .createdTime(saved.getCreatedTime())
                .createdBy(saved.getCreatedBy())
                .modifiedTime(saved.getModifiedTime())
                .modifiedBy(saved.getModifiedBy())
                .deleted(Boolean.TRUE.equals(saved.getDeleted()))
                .deletedTime(saved.getDeletedTime())
                .deletedBy(saved.getDeletedBy())
                .build();
    }

    @PreAuthorize("hasAuthority('ROOM_IMAGE_UPDATE')")
    @Transactional
    @Override
    public List<RoomImageResponse> uploadRoomImages(String roomId, List<MultipartFile> files, Integer coverIndex) {
        if (files == null || files.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE_UPLOAD);
        }

        if (coverIndex != null && (coverIndex < 0 || coverIndex >= files.size())) {
            throw new AppException(ErrorCode.INVALID_FILE_UPLOAD);
        }

        Rooms room = roomRepository.findByIdAndDeletedFalse(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String username = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        List<Images> existingImages = imageRepository.findAllByRoomIdAndDeletedFalse(roomId);
        if (coverIndex != null) {
            for (Images existingImage : existingImages) {
                if (Boolean.TRUE.equals(existingImage.getIsCover())) {
                    existingImage = existingImage.toBuilder()
                            .isCover(false)
                            .modifiedTime(LocalDateTime.now())
                            .modifiedBy(username)
                            .build();
                    imageRepository.save(existingImage);
                }
            }
        }

        int startOrder = existingImages.size();
        List<RoomImageResponse> responses = new ArrayList<>();

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            if (file == null || file.isEmpty()) {
                throw new AppException(ErrorCode.INVALID_FILE_UPLOAD);
            }

            Map<String, String> uploadResult;
            try {
                uploadResult = cloudinaryService.uploadImage(file, cloudinaryFolder);
            } catch (RuntimeException ex) {
                throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
            }

            boolean isCover = coverIndex != null && i == coverIndex;

            Images image = Images.builder()
                    .room(room)
                    .url(uploadResult.get("url"))
                    .publicId(uploadResult.get("publicId"))
                    .isCover(isCover)
                    .sortOrder(startOrder + i)
                    .createdTime(LocalDateTime.now())
                    .createdBy(username)
                    .build();

            Images saved = imageRepository.save(image);

            if (Boolean.TRUE.equals(saved.getIsCover())) {
                room = room.toBuilder()
                        .image(saved.getUrl())
                        .modifiedTime(LocalDateTime.now())
                        .modifiedBy(username)
                        .build();
            }

            responses.add(RoomImageResponse.builder()
                    .id(saved.getId())
                    .url(saved.getUrl())
                    .publicId(saved.getPublicId())
                    .isCover(saved.getIsCover())
                    .sortOrder(saved.getSortOrder())
                    .build());
        }

        if (!responses.isEmpty() && coverIndex == null && room.getImage() == null) {
            room = room.toBuilder()
                    .image(responses.get(0).getUrl())
                    .modifiedTime(LocalDateTime.now())
                    .modifiedBy(username)
                    .build();
        }

        roomRepository.save(room);
        return responses;
    }

    @PreAuthorize("hasAuthority('ROOM_IMAGE_DELETE')")
    @Transactional
    @Override
    public void deleteRoomImage(String roomId, String imageId) {
        Rooms room = roomRepository.findByIdAndDeletedFalse(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        String username = identityClient.getUserInfo(accessToken).getResult().getPreferred_username();

        Images image = imageRepository.findByIdAndRoomIdAndDeletedFalse(imageId, roomId)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        boolean shouldReplaceCover = Boolean.TRUE.equals(image.getIsCover()) || image.getUrl().equals(room.getImage());
        Images deletedImage = image.toBuilder()
                .isCover(false)
                .deleted(true)
                .deletedTime(LocalDateTime.now())
                .deletedBy(username)
                .modifiedTime(LocalDateTime.now())
                .modifiedBy(username)
                .build();
        imageRepository.save(deletedImage);

        if (shouldReplaceCover) {
            List<Images> remainingImages = imageRepository.findAllByRoomIdAndDeletedFalse(roomId);
            Images nextCover = remainingImages.stream()
                    .filter(item -> !item.getId().equals(imageId))
                    .sorted((first, second) -> Integer.compare(
                            first.getSortOrder() != null ? first.getSortOrder() : 0,
                            second.getSortOrder() != null ? second.getSortOrder() : 0))
                    .findFirst()
                    .orElse(null);

            if (nextCover != null) {
                imageRepository.save(nextCover.toBuilder()
                        .isCover(true)
                        .modifiedTime(LocalDateTime.now())
                        .modifiedBy(username)
                        .build());

                room = room.toBuilder()
                        .image(nextCover.getUrl())
                        .modifiedTime(LocalDateTime.now())
                        .modifiedBy(username)
                        .build();
            } else {
                room = room.toBuilder()
                        .image(null)
                        .modifiedTime(LocalDateTime.now())
                        .modifiedBy(username)
                        .build();
            }

            roomRepository.save(room);
        }
    }

    @Override
    public RoomDetailResponse getRoomById(String id) {
        Rooms room = roomRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        List<Images> roomImages = imageRepository.findAllByRoomIdAndDeletedFalse(id);
        
        List<RoomImageResponse> imageResponses = roomImages.stream()
                .map(img -> RoomImageResponse.builder()
                        .id(img.getId())
                        .url(img.getUrl())
                        .publicId(img.getPublicId())
                        .isCover(img.getIsCover())
                        .sortOrder(img.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        List<String> galleryUrls = roomImages.stream()
                .map(Images::getUrl)
                .collect(Collectors.toList());

        return RoomDetailResponse.builder()
                .id(room.getId())
                .roomTypeId(room.getRoomTypeId())
                .floorId(room.getFloorId())
                .name(room.getName())
                .image(room.getImage())
                .images(imageResponses)
                .galleryImages(galleryUrls)
                .pricePerDay(room.getPricePerDay())
                .pricePerHour(room.getPricePerHour())
                .description(room.getDescription())
                .roomDescription(room.getDescription()) 
                .roomSize(room.getRoomSize())
                .status(room.getStatus())
                .build();
    }

}
