package com.hotelcontinental.notification_service.event;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {

    private String channel;     // EMAIL
    private String type;        // OTP_REGISTER / OTP_LOGIN / etc
    private String recipient;   // email
    private String otp;         // otp value
}
