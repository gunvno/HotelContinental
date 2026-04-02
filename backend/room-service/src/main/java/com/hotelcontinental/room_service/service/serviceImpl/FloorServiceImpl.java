package com.hotelcontinental.room_service.service.serviceImpl;

import com.hotelcontinental.room_service.dto.request.building.BuildingCreationRequest;
import com.hotelcontinental.room_service.dto.request.floor.FloorCreationRequest;
import com.hotelcontinental.room_service.dto.response.building.BuildingResponse;
import com.hotelcontinental.room_service.dto.response.floor.FloorCustomerResponse;
import com.hotelcontinental.room_service.dto.response.floor.FloorResponse;
import com.hotelcontinental.room_service.entity.Building;
import com.hotelcontinental.room_service.entity.Floor;
import com.hotelcontinental.room_service.entity.Rooms;
import com.hotelcontinental.room_service.enums.BuildingStatus;
import com.hotelcontinental.room_service.enums.FloorStatus;
import com.hotelcontinental.room_service.exception.AppException;
import com.hotelcontinental.room_service.exception.ErrorCode;
import com.hotelcontinental.room_service.repository.FloorRepository;
import com.hotelcontinental.room_service.repository.httpclient.IdentityClient;
import com.hotelcontinental.room_service.service.interfaces.FloorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import static java.util.stream.Collectors.toList;

@Service
public class FloorServiceImpl implements FloorService {
    @Autowired
    private FloorRepository floorRepository;

    @Autowired
    private IdentityClient identityClient;
    @PreAuthorize("hasRole('ADMIN')")
    @Override
    public FloorResponse createFloor(FloorCreationRequest request) {
        var context = SecurityContextHolder.getContext();
        Jwt jwt = (Jwt) context.getAuthentication().getPrincipal();
        String token = "Bearer " + jwt.getTokenValue();

        var userInfoResponse = identityClient.getUserInfo(token);

        Floor building = Floor.builder()
                .name(request.getName())
                .status(FloorStatus.ISACTIVE)
                .numberOfRooms(0)
                .building(request.getBuilding())
                .createdTime(LocalDateTime.now())
                .createdBy(userInfoResponse.getResult().getEmail())
                .modifiedTime(LocalDateTime.now())
                .modifiedBy(userInfoResponse.getResult().getEmail())
                .deleted(false)
                .deletedTime(null)
                .deletedBy(null)
                .build();
        floorRepository.save(building);
        return FloorResponse.builder()
                .name(request.getName())
                .status(FloorStatus.ISACTIVE)
                .numberOfRooms(0)
                .building(request.getBuilding())
                .createdTime(LocalDateTime.now())
                .createdBy(userInfoResponse.getResult().getEmail())
                .modifiedTime(LocalDateTime.now())
                .modifiedBy(userInfoResponse.getResult().getEmail())
                .deleted(false)
                .deletedTime(null)
                .deletedBy(null)
                .build();
    };



    public List<FloorCustomerResponse> getFloor(String buildingId){
        var floor = floorRepository.findByBuildingId(buildingId);

        return floor.stream().map(f -> FloorCustomerResponse.builder()
                .name(f.getName())
                .numberOfRooms(f.getNumberOfRooms())
                .status(f.getStatus())
                .rooms(f.getRooms().stream().map(r -> Rooms.builder()
                        .name(r.getName())
                        .status(r.getStatus())
                        .build()).toList())
                .build()).collect(toList());
    }
}
