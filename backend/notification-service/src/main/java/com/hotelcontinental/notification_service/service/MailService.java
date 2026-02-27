package com.hotelcontinental.notification_service.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void send(String to, String subject, String htmlContent) {

        try {
            log.info("Sending mail to {}", to);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(from, "Hotel Continental Support");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // TRUE = HTML

            mailSender.send(message);

            log.info("Mail sent successfully");

        } catch (Exception e) {
            log.error("Send mail FAILED to {}", to, e);
            throw new RuntimeException(e);
        }
    }
}