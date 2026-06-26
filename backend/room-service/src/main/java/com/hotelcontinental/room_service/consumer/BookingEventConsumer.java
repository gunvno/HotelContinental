package com.hotelcontinental.room_service.consumer;

import com.hotelcontinental.room_service.entity.Rooms;
import com.hotelcontinental.room_service.enums.HousekeepingStatus;
import com.hotelcontinental.room_service.enums.RoomStatus;
import com.hotelcontinental.room_service.event.BookingEvent;
import com.hotelcontinental.room_service.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingEventConsumer {
    private final RoomRepository roomRepository;

    @Transactional
    @KafkaListener(topics = "booking-events")
    public void consume(BookingEvent event) {
        if (event == null || !StringUtils.hasText(event.getEventType()) || !StringUtils.hasText(event.getRoomId())) {
            return;
        }

        roomRepository.findByIdAndDeletedFalse(event.getRoomId())
                .ifPresentOrElse(
                        room -> applyRoomStatus(room, event),
                        () -> log.warn("Booking event {} references missing room {}", event.getEventType(), event.getRoomId())
                );
    }

    private void applyRoomStatus(Rooms room, BookingEvent event) {
        RoomStatus targetStatus = targetStatus(event);
        if (targetStatus == null || room.getStatus() == RoomStatus.MAINTENANCE) {
            return;
        }

        LocalDateTime occurredAt = event.getOccurredAt() != null ? event.getOccurredAt() : LocalDateTime.now();
        String actor = StringUtils.hasText(event.getActor()) ? event.getActor() : "booking-events";
        room.setStatus(targetStatus);
        if ("BOOKING_CHECKED_OUT".equals(event.getEventType())) {
            room.setHousekeepingStatus(HousekeepingStatus.DIRTY);
            room.setHousekeepingNote("Phòng vừa checkout, cần dọn trước khi bán tiếp.");
            room.setHousekeepingAssignedTo(null);
            room.setHousekeepingAssignedBy(null);
            room.setHousekeepingAssignedTime(null);
            room.setHousekeepingCompletedBy(null);
            room.setHousekeepingCompletedTime(null);
            room.setHousekeepingUpdatedBy(actor);
            room.setHousekeepingUpdatedTime(occurredAt);
        }
        room.setModifiedBy(actor);
        room.setModifiedTime(occurredAt);
        roomRepository.save(room);
        log.info("Room {} status changed to {} from booking event {}", room.getId(), targetStatus, event.getEventType());
    }

    private RoomStatus targetStatus(BookingEvent event) {
        return switch (event.getEventType()) {
            case "BOOKING_CREATED", "BOOKING_DEPOSITED", "BOOKING_DATES_CHANGED" -> RoomStatus.RESERVED;
            case "BOOKING_CHECKED_IN" -> RoomStatus.OCCUPIED;
            case "BOOKING_CHECKED_OUT", "BOOKING_CANCELLED", "BOOKING_CANCELLATION_APPROVED", "BOOKING_AUTO_CANCELLED" -> RoomStatus.AVAILABLE;
            default -> null;
        };
    }
}
