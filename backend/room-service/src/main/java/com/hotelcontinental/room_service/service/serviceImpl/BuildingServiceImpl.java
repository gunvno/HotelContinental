package com.hotelcontinental.room_service.service.serviceImpl;

import com.hotelcontinental.identity_service.dto.response.User.UserInfoResponse;
import com.hotelcontinental.room_service.dto.request.FullCreationRequest;
import com.hotelcontinental.room_service.dto.request.building.BuildingEditRequest;
import com.hotelcontinental.room_service.dto.response.FullCreationResponse;
import com.hotelcontinental.room_service.dto.response.building.BuildingCustomerResponse;
import com.hotelcontinental.room_service.entity.Floor;
import com.hotelcontinental.room_service.entity.Rooms;
import com.hotelcontinental.room_service.enums.FloorStatus;
import com.hotelcontinental.room_service.enums.RoomStatus;
import com.hotelcontinental.room_service.repository.FloorRepository;
import com.hotelcontinental.room_service.repository.RoomRepository;
import com.hotelcontinental.room_service.repository.httpclient.IdentityClient;
import com.hotelcontinental.room_service.dto.request.building.BuildingCreationRequest;
import com.hotelcontinental.room_service.dto.response.building.BuildingResponse;
import com.hotelcontinental.room_service.entity.Building;
import com.hotelcontinental.room_service.enums.BuildingStatus;
import com.hotelcontinental.room_service.exception.AppException;
import com.hotelcontinental.room_service.exception.ErrorCode;
import com.hotelcontinental.room_service.repository.BuildingRepository;
import com.hotelcontinental.room_service.service.interfaces.BuildingService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class BuildingServiceImpl implements BuildingService {
    @Autowired
    private BuildingRepository buildingRepository;
    @Autowired
    private FloorRepository floorRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private IdentityClient identityClient;
    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public BuildingResponse createBuilding(BuildingCreationRequest request) {
        var context = SecurityContextHolder.getContext();
        Jwt jwt = (Jwt) context.getAuthentication().getPrincipal();
        String token = "Bearer " + jwt.getTokenValue();

        var userInfoResponse = identityClient.getUserInfo(token);

        if (buildingRepository.existsByName(request.getName()))
            throw new AppException(ErrorCode.ROOM_ALREADY_EXISTS);
        Building building = Building.builder()
                .name(request.getName())
                .status(BuildingStatus.ISACTIVE)
                .address(request.getAddress())
                .createdTime(LocalDateTime.now())
                .createdBy(userInfoResponse.getResult().getEmail())
                .modifiedTime(LocalDateTime.now())
                .modifiedBy(userInfoResponse.getResult().getEmail())
                .deleted(false)
                .deletedTime(null)
                .deletedBy(null)
                .build();
        buildingRepository.save(building);
        return BuildingResponse.builder()
                .name(request.getName())
                .status(BuildingStatus.ISACTIVE)
                .address(request.getAddress())
                .createdTime(LocalDateTime.now())
                .createdBy(userInfoResponse.getResult().getEmail())
                .modifiedTime(LocalDateTime.now())
                .modifiedBy(userInfoResponse.getResult().getEmail())
                .deleted(false)
                .deletedTime(null)
                .deletedBy(null)
                .build();
    };

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public void deleteBuilding(String buildingId){
        var context = SecurityContextHolder.getContext();
        Jwt jwt = (Jwt) context.getAuthentication().getPrincipal();
        String token = "Bearer " + jwt.getTokenValue();

        var userInfoResponse = identityClient.getUserInfo(token);

        Building building = buildingRepository.findById(buildingId).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        building.setDeleted(true);
        building.setDeletedTime(LocalDateTime.now());
        building.setDeletedBy(userInfoResponse.getResult().getEmail());
        buildingRepository.save(building);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public BuildingResponse editBuilding(String buildingId, BuildingEditRequest request){
        var context = SecurityContextHolder.getContext();
        Jwt jwt = (Jwt) context.getAuthentication().getPrincipal();
        String token = "Bearer " + jwt.getTokenValue();

        var userInfoResponse = identityClient.getUserInfo(token);
        Building builidng = Building.builder()
                .name(request.getName())
                .status(request.getStatus())
                .address(request.getAddress())
                .modifiedBy(userInfoResponse.getResult().getEmail())
                .modifiedTime(LocalDateTime.now())
                .build();
        return BuildingResponse.builder()
                .name(request.getName())
                .status(request.getStatus())
                .address(request.getAddress())
                .modifiedBy(userInfoResponse.getResult().getEmail())
                .modifiedTime(LocalDateTime.now())
                .build();
    }
    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public Page<BuildingResponse> getAllBuildings(Pageable pageable, String name,
                                                  BuildingStatus status,String address){
        return buildingRepository.getAllBuilding(name, address, pageable)
                .map(building -> BuildingResponse.builder()
                        .name(building.getName())
                        .status(building.getStatus())
                        .address(building.getAddress())
                        .createdTime(building.getCreatedTime())
                        .createdBy(building.getCreatedBy())
                        .modifiedTime(building.getModifiedTime())
                        .modifiedBy(building.getModifiedBy())
                        .deleted(building.getDeleted())
                        .deletedTime(building.getDeletedTime())
                        .deletedBy(building.getDeletedBy())
                        .build());

    }
    @Override
    public Page<BuildingCustomerResponse> getBuildings(Pageable pageable, String name,
                                                       BuildingStatus status, String address){
        return buildingRepository.getBuilding(name, address, pageable)
                .map(building -> BuildingCustomerResponse.builder()
                        .name(building.getName())
                        .status(building.getStatus())
                        .address(building.getAddress())
                        .build());

    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public FullCreationResponse createFullBuilding(FullCreationRequest request) {
        var context = SecurityContextHolder.getContext();
        Jwt jwt = (Jwt) context.getAuthentication().getPrincipal();
        String token = "Bearer " + jwt.getTokenValue();

        var userInfoResponse = identityClient.getUserInfo(token);

        if (buildingRepository.existsByName(request.getBuildingName()))
            throw new AppException(ErrorCode.BUILDING_ALREADY_EXISTS);
        Building building = Building.builder()
                .name(request.getBuildingName())
                .status(BuildingStatus.ISACTIVE)
                .address(request.getBuildingAddress())
                .createdTime(LocalDateTime.now())
                .createdBy(userInfoResponse.getResult().getEmail())
                .modifiedTime(LocalDateTime.now())
                .modifiedBy(userInfoResponse.getResult().getEmail())
                .deleted(false)
                .deletedTime(null)
                .deletedBy(null)
                .build();
        var savedbuilding = buildingRepository.save(building);
        for(int i =1 ; i<= request.getNumberOfFloors(); i++){
            Floor floor = Floor.builder()
                    .name("Tầng " + i)
                    .status(FloorStatus.ISACTIVE)
                    .building(savedbuilding)
                    .numberOfRooms(request.getNumberOfRooms())
                    .createdTime(LocalDateTime.now())
                    .createdBy(userInfoResponse.getResult().getEmail())
                    .modifiedTime(LocalDateTime.now())
                    .modifiedBy(userInfoResponse.getResult().getEmail())
                    .deleted(false)
                    .deletedTime(null)
                    .deletedBy(null)
                    .build();
            var savedFloor = floorRepository.save(floor);
            for(int j =1; j <= request.getNumberOfRooms(); j++){
                Rooms room = Rooms.builder()
                        .name("Phòng " + i + "0" + j)
                        .status(RoomStatus.AVAILABLE)
                        .floor(savedFloor)
                        .address(savedbuilding.getAddress())
                        .pricePerDay(0.0f)
                        .pricePerHour(0.0f)
                        .roomSize("Standard")
                        .createdTime(LocalDateTime.now())
                        .createdBy(userInfoResponse.getResult().getEmail())
                        .modifiedTime(LocalDateTime.now())
                        .modifiedBy(userInfoResponse.getResult().getEmail())
                        .deleted(false)
                        .deletedTime(null)
                        .deletedBy(null)
                        .build();
                roomRepository.save(room);
            }
        }
        return FullCreationResponse.builder()
                .buildingName(request.getBuildingName())
                .buildingAddress(request.getBuildingAddress())
                .numberOfFloors(request.getNumberOfFloors())
                .numberOfRooms(request.getNumberOfRooms())
                .build();
    };

}
