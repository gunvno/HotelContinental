package com.hotelcontinental.identity_service.service.interfaces;

import com.hotelcontinental.identity_service.dto.request.Authentication.OtpVerifyRequest;
import com.hotelcontinental.identity_service.dto.request.User.RegistrationRequest;

import com.hotelcontinental.identity_service.dto.request.Authentication.IntrospectRequest;
import com.hotelcontinental.identity_service.dto.response.Authentication.IntrospectResponse;
import com.hotelcontinental.identity_service.dto.response.User.UserInfoResponse;

public interface AuthenticationService {
    IntrospectResponse introspect(IntrospectRequest request);
    String register(RegistrationRequest request);
    void sendRegistrationOtp(String email);
    boolean verifyOtp(OtpVerifyRequest request);
    UserInfoResponse getInfoByToken(String token);
}
