package com.hotelcontinental.notification_service.consumer;


import com.hotelcontinental.notification_service.common.CommonUtil;
import com.hotelcontinental.notification_service.event.NotificationEvent;
import com.hotelcontinental.notification_service.handler.EmailNotificationHandler;
import com.hotelcontinental.notification_service.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final EmailNotificationHandler emailHandler;
    private final MailService mailService;
    @KafkaListener(topics = "notifications")
    public void consume(NotificationEvent event) {
        log.info("Received notification event: {}", event);
        if ("EMAIL".equals(event.getChannel())) {
            emailHandler.handle(event);
        }
    }
}
