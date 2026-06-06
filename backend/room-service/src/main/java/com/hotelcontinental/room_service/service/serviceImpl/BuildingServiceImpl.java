package com.hotelcontinental.room_service.service.serviceImpl;

import com.hotelcontinental.room_service.dto.request.building.BuildingSetupRequest;
import com.hotelcontinental.room_service.dto.response.building.BuildingResponse;
import com.hotelcontinental.room_service.dto.response.building.BuildingSetupResponse;
import com.hotelcontinental.room_service.dto.response.building.FloorResponse;
import com.hotelcontinental.room_service.dto.response.room.RoomResponse;
import com.hotelcontinental.room_service.entity.Building;
import com.hotelcontinental.room_service.entity.Floor;
import com.hotelcontinental.room_service.entity.Rooms;
import com.hotelcontinental.room_service.enums.BuildingStatus;
import com.hotelcontinental.room_service.enums.FloorStatus;
import com.hotelcontinental.room_service.enums.RoomStatus;
import com.hotelcontinental.room_service.exception.AppException;
import com.hotelcontinental.room_service.exception.ErrorCode;
import com.hotelcontinental.room_service.repository.BuildingRepository;
import com.hotelcontinental.room_service.repository.FloorRepository;
import com.hotelcontinental.room_service.repository.RoomRepository;
import com.hotelcontinental.room_service.repository.httpclient.IdentityClient;
import com.hotelcontinental.room_service.service.interfaces.BuildingService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BuildingServiceImpl implements BuildingService {
    private final BuildingRepository buildingRepository;
    private final FloorRepository floorRepository;
    private final RoomRepository roomRepository;
    private final IdentityClient identityClient;

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public BuildingSetupResponse setupBuilding(BuildingSetupRequest request) {
        validateSetupRequest(request);

        String username = getCurrentUsername();
        LocalDateTime now = LocalDateTime.now();
        String pattern = request.getRoomNumberPattern() == null || request.getRoomNumberPattern().isBlank()
                ? "{floor}{room:02}"
                : request.getRoomNumberPattern();
        Set<String> skipRooms = new HashSet<>(request.getSkipRoomNumbers() == null ? List.of() : request.getSkipRoomNumbers());

        Building building = buildingRepository.save(Building.builder()
                .name(request.getBuildingName().trim())
                .description(request.getDescription())
                .address(request.getAddress())
                .status(BuildingStatus.ACTIVE)
                .createdTime(now)
                .createdBy(username)
                .build());

        List<Floor> floors = new ArrayList<>();
        List<Rooms> rooms = new ArrayList<>();

        for (int floorNumber = request.getFloorStart(); floorNumber <= request.getFloorEnd(); floorNumber++) {
            Floor floor = floorRepository.save(Floor.builder()
                    .buildingId(building.getId())
                    .name("Tầng " + floorNumber)
                    .floorNumber(floorNumber)
                    .status(FloorStatus.ACTIVE)
                    .createdTime(now)
                    .createdBy(username)
                    .build());
            floors.add(floor);

            for (int roomIndex = 1; roomIndex <= request.getRoomsPerFloor(); roomIndex++) {
                String roomNumber = formatRoomNumber(pattern, floorNumber, roomIndex);
                if (skipRooms.contains(roomNumber)) {
                    continue;
                }

                rooms.add(roomRepository.save(Rooms.builder()
                        .floorId(floor.getId())
                        .roomTypeId(request.getDefaultRoomTypeId())
                        .name(roomNumber)
                        .pricePerDay(request.getDefaultPricePerDay())
                        .pricePerHour(request.getDefaultPricePerHour())
                        .description("Phòng " + roomNumber + " thuộc " + building.getName())
                        .roomSize(request.getDefaultRoomSize())
                        .status(RoomStatus.AVAILABLE)
                        .createdTime(now)
                        .createdBy(username)
                        .build()));
            }
        }

        return BuildingSetupResponse.builder()
                .building(mapBuilding(building))
                .floors(floors.stream().map(this::mapFloor).toList())
                .rooms(rooms.stream().map(this::mapRoom).toList())
                .createdFloorCount(floors.size())
                .createdRoomCount(rooms.size())
                .build();
    }

    @Override
    public List<BuildingResponse> getBuildings() {
        return buildingRepository.findAllByDeletedFalse().stream().map(this::mapBuilding).toList();
    }

    @Override
    public List<FloorResponse> getFloorsByBuilding(String buildingId) {
        return floorRepository.findAllByBuildingIdAndDeletedFalseOrderByFloorNumberAsc(buildingId)
                .stream()
                .map(this::mapFloor)
                .toList();
    }

    private void validateSetupRequest(BuildingSetupRequest request) {
        if (request.getBuildingName() == null || request.getBuildingName().isBlank()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        if (request.getFloorStart() == null || request.getFloorEnd() == null || request.getFloorStart() > request.getFloorEnd()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        if (request.getRoomsPerFloor() == null || request.getRoomsPerFloor() <= 0) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        if (request.getDefaultRoomTypeId() == null || request.getDefaultRoomTypeId().isBlank()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        if (request.getDefaultPricePerDay() == null || request.getDefaultPricePerDay() <= 0
                || request.getDefaultPricePerHour() == null || request.getDefaultPricePerHour() <= 0) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        if (request.getDefaultRoomSize() == null || request.getDefaultRoomSize().isBlank()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
        String accessToken = jwtAuthenticationToken.getToken().getTokenValue();
        return identityClient.getUserInfo(accessToken).getResult().getPreferred_username();
    }

    private String formatRoomNumber(String pattern, int floorNumber, int roomIndex) {
        String roomTwoDigits = String.format("%02d", roomIndex);
        String roomThreeDigits = String.format("%03d", roomIndex);
        return pattern
                .replace("{floor}", String.valueOf(floorNumber))
                .replace("{room}", String.valueOf(roomIndex))
                .replace("{room:02}", roomTwoDigits)
                .replace("{room:03}", roomThreeDigits);
    }

    private BuildingResponse mapBuilding(Building building) {
        return BuildingResponse.builder()
                .id(building.getId())
                .name(building.getName())
                .description(building.getDescription())
                .address(building.getAddress())
                .status(building.getStatus())
                .createdTime(building.getCreatedTime())
                .createdBy(building.getCreatedBy())
                .build();
    }

    private FloorResponse mapFloor(Floor floor) {
        return FloorResponse.builder()
                .id(floor.getId())
                .buildingId(floor.getBuildingId())
                .name(floor.getName())
                .floorNumber(floor.getFloorNumber())
                .status(floor.getStatus())
                .build();
    }

    private RoomResponse mapRoom(Rooms room) {
        return RoomResponse.builder()
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
                .createdTime(room.getCreatedTime())
                .createdBy(room.getCreatedBy())
                .modifiedTime(room.getModifiedTime())
                .modifiedBy(room.getModifiedBy())
                .deleted(Boolean.TRUE.equals(room.getDeleted()))
                .deletedTime(room.getDeletedTime())
                .deletedBy(room.getDeletedBy())
                .build();
    }
}
