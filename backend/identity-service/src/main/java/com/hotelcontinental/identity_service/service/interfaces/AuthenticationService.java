package com.hotelcontinental.identity_service.service.interfaces;

import com.hotelcontinental.identity_service.dto.request.Authentication.OtpVerifyRequest;
import com.hotelcontinental.identity_service.dto.request.User.RegistrationRequest;

public interface AuthenticationService {
    String register(RegistrationRequest request);
    void sendRegistrationOtp(String email);
    boolean verifyOtp(OtpVerifyRequest request);
}
