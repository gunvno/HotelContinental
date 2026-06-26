package com.hotelcontinental.notification_service.consumer;

import com.hotelcontinental.notification_service.event.BookingEvent;
import com.hotelcontinental.notification_service.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingEventConsumer {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    private final MailService mailService;

    @KafkaListener(
            topics = "booking-events",
            groupId = "notification-service-booking-events",
            properties = "spring.json.value.default.type=com.hotelcontinental.notification_service.event.BookingEvent"
    )
    public void consume(BookingEvent event) {
        if (event == null || !StringUtils.hasText(event.getEventType())) {
            return;
        }
        if (!StringUtils.hasText(event.getCustomerEmail())) {
            log.warn(
                    "Skip booking email because event {} booking={} has no customerEmail",
                    event.getEventType(),
                    event.getBookingId()
            );
            return;
        }

        BookingMailContent content = buildMailContent(event);
        if (content == null) {
            log.debug("No booking email template for event {}", event.getEventType());
            return;
        }

        mailService.send(event.getCustomerEmail(), content.subject(), content.html());
        log.info("Sent booking email {} to {}", event.getEventType(), event.getCustomerEmail());
    }

    private BookingMailContent buildMailContent(BookingEvent event) {
        return switch (event.getEventType()) {
            case "BOOKING_CREATED" -> new BookingMailContent(
                    "Hotel Continental - Booking cua ban da duoc ghi nhan",
                    buildHtml(event, "Booking cua ban da duoc ghi nhan",
                            "Cam on ban da dat phong tai Hotel Continental. Vui long hoan tat thanh toan/dat coc neu booking yeu cau.")
            );
            case "BOOKING_DEPOSITED" -> new BookingMailContent(
                    "Hotel Continental - Booking da thanh toan/dat coc",
                    buildHtml(event, "Booking da thanh toan/dat coc",
                            "Booking cua ban da duoc xac nhan thanh toan/dat coc va san sang cho buoc check-in.")
            );
            case "BOOKING_DATES_CHANGED" -> new BookingMailContent(
                    "Hotel Continental - Ngay luu tru da duoc cap nhat",
                    buildHtml(event, "Ngay luu tru da duoc cap nhat",
                            "Thong tin ngay nhan phong/tra phong cua booking da duoc cap nhat.")
            );
            case "BOOKING_CHECKED_IN" -> new BookingMailContent(
                    "Hotel Continental - Check-in thanh cong",
                    buildHtml(event, "Check-in thanh cong",
                            "Chuc ban co mot ky nghi that thoai mai tai Hotel Continental.")
            );
            case "BOOKING_CHECKED_OUT" -> new BookingMailContent(
                    "Hotel Continental - Check-out thanh cong",
                    buildHtml(event, "Check-out thanh cong",
                            "Cam on ban da luu tru tai Hotel Continental. Hen gap lai ban trong lan tiep theo.")
            );
            case "BOOKING_CANCEL_REQUESTED" -> new BookingMailContent(
                    "Hotel Continental - Yeu cau huy booking da duoc ghi nhan",
                    buildHtml(event, "Yeu cau huy booking da duoc ghi nhan",
                            "Yeu cau huy booking cua ban dang cho nhan vien khach san duyet.")
            );
            case "BOOKING_CANCELLED", "BOOKING_CANCELLATION_APPROVED", "BOOKING_AUTO_CANCELLED" -> new BookingMailContent(
                    "Hotel Continental - Booking da huy",
                    buildHtml(event, "Booking da huy",
                            "Booking cua ban da duoc huy. Neu can ho tro them, vui long lien he Hotel Continental.")
            );
            default -> null;
        };
    }

    private String buildHtml(BookingEvent event, String title, String message) {
        return """
                <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6">
                  <h2 style="color:#9a5a18;margin-bottom:8px">%s</h2>
                  <p>%s</p>
                  <table style="border-collapse:collapse;margin-top:16px">
                    <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Ma booking</td><td><strong>%s</strong></td></tr>
                    <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Phong</td><td>%s</td></tr>
                    <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Nhan phong</td><td>%s</td></tr>
                    <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Tra phong</td><td>%s</td></tr>
                    <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Trang thai</td><td>%s</td></tr>
                    <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Tong tien</td><td><strong>%s d</strong></td></tr>
                  </table>
                  <p style="margin-top:20px;color:#6b7280">Email nay duoc gui tu he thong Hotel Continental.</p>
                </div>
                """.formatted(
                escape(title),
                escape(message),
                escape(valueOrDash(event.getBookingId())),
                escape(valueOrDash(event.getRoomId())),
                escape(formatDateTime(event.getCheckin())),
                escape(formatDateTime(event.getCheckout())),
                escape(valueOrDash(event.getStatus())),
                escape(formatMoney(event.getTotalPrice()))
        );
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "-" : DATE_TIME_FORMATTER.format(value);
    }

    private String formatMoney(Float value) {
        if (value == null) {
            return "0";
        }
        return String.format("%,.0f", value).replace(",", ".");
    }

    private String valueOrDash(String value) {
        return StringUtils.hasText(value) ? value : "-";
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private record BookingMailContent(String subject, String html) {
    }
}
