package com.hotelcontinental.notification_service.handler;

import com.hotelcontinental.notification_service.event.NotificationEvent;
import com.hotelcontinental.notification_service.service.MailService;
import com.hotelcontinental.notification_service.common.CommonUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmailNotificationHandler {

    private final MailService mailService;

    public void handle(NotificationEvent event) {

        if ("OTP_REGISTER".equals(event.getType())) {

            String subject = CommonUtil.buildOtpRegisterSubject();
            String html = CommonUtil.buildOtpRegisterHtml(
                    event.getRecipient(),
                    event.getOtp()
            );

            mailService.send(event.getRecipient(), subject, html);
        }

        // Sau này mở rộng tại đây
        // else if ("BOOKING_CONFIRM".equals(event.getType())) { ... }
    }
}