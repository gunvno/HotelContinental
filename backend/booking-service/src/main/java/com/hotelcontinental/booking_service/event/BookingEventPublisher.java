package com.hotelcontinental.booking_service.event;

import com.hotelcontinental.booking_service.entity.RoomBookingDetails;
import com.hotelcontinental.booking_service.entity.RoomBookings;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingEventPublisher {
    public static final String TOPIC = "booking-events";

    private final KafkaTemplate<String, BookingEvent> kafkaTemplate;

    public void publish(String eventType, RoomBookings booking, RoomBookingDetails detail, String actor) {
        if (booking == null) {
            return;
        }

        BookingEvent event = BookingEvent.builder()
                .eventType(eventType)
                .bookingId(booking.getId())
                .bookingDetailId(detail != null ? detail.getId() : null)
                .customerId(booking.getCustomerId())
                .customerEmail(currentCustomerEmail())
                .roomId(detail != null ? detail.getRoomId() : null)
                .bookingType(booking.getBookingType() != null ? booking.getBookingType().name() : null)
                .status(booking.getStatus() != null ? booking.getStatus().name() : null)
                .detailStatus(detail != null && detail.getStatus() != null ? detail.getStatus().name() : null)
                .checkin(detail != null ? detail.getCheckin() : null)
                .checkout(detail != null ? detail.getCheckout() : null)
                .checkinReality(detail != null ? detail.getCheckinReality() : null)
                .checkoutReality(detail != null ? detail.getCheckoutReality() : null)
                .totalRoomPrice(booking.getTotalRoomPrice())
                .totalServicePrice(booking.getTotalServicePrice())
                .totalExtraPrice(booking.getTotalExtraPrice())
                .totalPrice(booking.getTotalPrice())
                .voucherCode(booking.getVoucherCode())
                .discountAmount(booking.getDiscountAmount())
                .refundStatus(booking.getRefundStatus())
                .refundAmount(booking.getRefundAmount())
                .actor(actor)
                .occurredAt(LocalDateTime.now())
                .build();

        kafkaTemplate.send(TOPIC, booking.getId(), event)
                .whenComplete((result, exception) -> {
                    if (exception != null) {
                        log.error("Failed to publish booking event {} for booking {}", eventType, booking.getId(), exception);
                    } else {
                        log.info("Published booking event {} for booking {}", eventType, booking.getId());
                    }
                });
    }

    private String currentCustomerEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            return jwtAuthenticationToken.getToken().getClaimAsString("email");
        }
        return null;
    }
}
