package com.hotelcontinental.booking_service.service.interfaces;

import java.time.LocalDateTime;
import java.util.List;

public interface AvailabilityService {
    List<String> getBusyRoomIds(LocalDateTime start, LocalDateTime end);
}
