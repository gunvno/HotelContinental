package com.hotelcontinental.room_service.service.serviceImpl;

import com.hotelcontinental.room_service.exception.AppException;
import com.hotelcontinental.room_service.exception.ErrorCode;
import com.hotelcontinental.room_service.repository.FloorRepository;
import com.hotelcontinental.room_service.repository.RoomRepository;
import com.hotelcontinental.room_service.service.interfaces.RoomService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;

public class RoomServiceImpl implements RoomService {
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private FloorRepository floorRepository;
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Override
    public void deleteRoom(String id){
        if(roomRepository.existsById(id)){
            var room = roomRepository.findById(id).get();
            room.setDeleted(true);
            roomRepository.save(room);
            String floorId = room.getFloor().getId();
            var floor = floorRepository.findById(floorId).get();
            floor.setNumberOfRooms(floor.getNumberOfRooms() -1);
            floorRepository.save(floor);
        }
        else throw new AppException(ErrorCode.ROOM_NOT_FOUND);
    }
}
