package com.hotelcontinental.room_service.service.serviceImpl;

import com.hotelcontinental.room_service.dto.request.room.RoomCreationRequest;
import com.hotelcontinental.room_service.dto.response.room.RoomForCustomerResponse;
import com.hotelcontinental.room_service.dto.response.room.RoomImageResponse;
import com.hotelcontinental.room_service.dto.response.room.RoomResponse;
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

    @PreAuthorize("hasRole('ADMIN')")
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
                   .roomTypes(room.getRoomTypes())
                   .image(room.getImage())
                   .name(room.getName())
                   .pricePerDay(room.getPricePerDay())
                   .pricePerHour(room.getPricePerHour())
                   .address(room.getAddress())
                   .description(room.getDescription())
                   .roomSize(room.getRoomSize())
                   .status(room.getStatus())
                   .build());
    }

    @PreAuthorize("hasRole('ADMIN')")
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
        boolean roomExists = roomRepository.existsByNameAndAddress(request.getName(), request.getAddress());
        if(roomExists)
            throw new AppException(ErrorCode.ROOM_ALREADY_EXISTS);
        Rooms room = Rooms.builder()
                .name(request.getName())
                .pricePerDay(request.getPricePerDay())
                .pricePerHour(request.getPricePerHour())
                .address(request.getAddress())
                .description(request.getDescription())
                .roomSize(request.getRoomSize())
                .status(RoomStatus.AVAILABLE)
                .roomTypes(request.getRoomTypes())
                .createdTime(LocalDateTime.now())
                .createdBy(createdBy)
                .build();
        roomRepository.save(room);
        return RoomResponse.builder()
            .id(room.getId())
                .name(request.getName())
                .pricePerDay(request.getPricePerDay())
                .pricePerHour(request.getPricePerHour())
                .address(request.getAddress())
                .description(request.getDescription())
                .roomSize(request.getRoomSize())
                .status(RoomStatus.AVAILABLE)
                .roomTypes(request.getRoomTypes())
                .createdTime(LocalDateTime.now())
                .createdBy(createdBy)
                .modifiedTime(null)
                .modifiedBy(null)
                .deleted(false)
                .deletedTime(null)
                .deletedBy(null)
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public List<RoomImageResponse> uploadRoomImages(String roomId, List<MultipartFile> files, Integer coverIndex) {
        if (files == null || files.isEmpty()) {
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


}
