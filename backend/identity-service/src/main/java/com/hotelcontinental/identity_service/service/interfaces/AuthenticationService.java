package com.hotelcontinental.identity_service.service.interfaces;

import com.hotelcontinental.identity_service.dto.request.Authentication.OtpVerifyRequest;
import com.hotelcontinental.identity_service.dto.request.User.RegistrationRequest;

import com.hotelcontinental.identity_service.dto.request.Authentication.AuthenticationRequest;
import com.hotelcontinental.identity_service.dto.request.Authentication.IntrospectRequest;
import com.hotelcontinental.identity_service.dto.request.Authentication.LogoutRequest;
import com.hotelcontinental.identity_service.dto.request.Authentication.RefreshRequest;
import com.hotelcontinental.identity_service.dto.response.Authentication.AuthenticationResponse;
import com.hotelcontinental.identity_service.dto.response.Authentication.IntrospectResponse;
import com.hotelcontinental.identity_service.dto.response.User.UserInfoResponse;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request);
    IntrospectResponse introspect(IntrospectRequest request);
    AuthenticationResponse refreshToken(RefreshRequest request);
    void logout(LogoutRequest request);
    String register(RegistrationRequest request);
    void sendRegistrationOtp(String email);
    boolean verifyOtp(OtpVerifyRequest request);
    UserInfoResponse getInfoByToken(String token);
}
