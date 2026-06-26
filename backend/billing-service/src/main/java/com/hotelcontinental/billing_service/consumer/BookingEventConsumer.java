package com.hotelcontinental.billing_service.consumer;

import com.hotelcontinental.billing_service.entity.BookingBillingSnapshot;
import com.hotelcontinental.billing_service.event.BookingEvent;
import com.hotelcontinental.billing_service.repository.BookingBillingSnapshotRepository;
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
    private final BookingBillingSnapshotRepository snapshotRepository;

    @Transactional
    @KafkaListener(topics = "booking-events")
    public void consume(BookingEvent event) {
        if (event == null || !StringUtils.hasText(event.getBookingId())) {
            return;
        }

        BookingBillingSnapshot snapshot = snapshotRepository.findById(event.getBookingId())
                .orElseGet(() -> {
                    BookingBillingSnapshot created = new BookingBillingSnapshot();
                    created.setRoomBookingId(event.getBookingId());
                    return created;
                });

        snapshot.setRoomBookingDetailId(event.getBookingDetailId());
        snapshot.setCustomerId(event.getCustomerId());
        snapshot.setCustomerEmail(event.getCustomerEmail());
        snapshot.setRoomId(event.getRoomId());
        snapshot.setBookingType(event.getBookingType());
        snapshot.setStatus(event.getStatus());
        snapshot.setDetailStatus(event.getDetailStatus());
        snapshot.setCheckin(event.getCheckin());
        snapshot.setCheckout(event.getCheckout());
        snapshot.setCheckinReality(event.getCheckinReality());
        snapshot.setCheckoutReality(event.getCheckoutReality());
        snapshot.setTotalRoomPrice(valueOrZero(event.getTotalRoomPrice()));
        snapshot.setTotalServicePrice(valueOrZero(event.getTotalServicePrice()));
        snapshot.setTotalExtraPrice(valueOrZero(event.getTotalExtraPrice()));
        snapshot.setTotalPrice(valueOrZero(event.getTotalPrice()));
        snapshot.setVoucherCode(event.getVoucherCode());
        snapshot.setDiscountAmount(valueOrZero(event.getDiscountAmount()));
        snapshot.setRefundStatus(event.getRefundStatus());
        snapshot.setRefundAmount(valueOrZero(event.getRefundAmount()));
        snapshot.setLastEventType(event.getEventType());
        snapshot.setLastActor(event.getActor());
        snapshot.setLastEventTime(event.getOccurredAt());
        snapshot.setUpdatedTime(LocalDateTime.now());

        snapshotRepository.save(snapshot);
        log.info("Billing snapshot upserted from booking event {} booking={}", event.getEventType(), event.getBookingId());
    }

    private float valueOrZero(Float value) {
        return value == null ? 0 : value;
    }
}
