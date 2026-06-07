package com.hotelcontinental.booking_service.service.serviceImpl;

import com.hotelcontinental.booking_service.enums.RoomBookingDetailStatus;
import com.hotelcontinental.booking_service.exception.AppException;
import com.hotelcontinental.booking_service.exception.ErrorCode;
import com.hotelcontinental.booking_service.repository.RoomBookingDetailsRepository;
import com.hotelcontinental.booking_service.service.interfaces.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {
    private final RoomBookingDetailsRepository roomBookingDetailsRepository;

    private static final List<RoomBookingDetailStatus> BLOCKING_STATUSES = List.of(
            RoomBookingDetailStatus.BOOKED,
            RoomBookingDetailStatus.CHECKED_IN
    );
    
    @Override
    public List<String> getBusyRoomIds(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null || !start.isBefore(end)) {
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);
        }

        return roomBookingDetailsRepository.findBusyRoomIds(start, end, BLOCKING_STATUSES);
    }
}
