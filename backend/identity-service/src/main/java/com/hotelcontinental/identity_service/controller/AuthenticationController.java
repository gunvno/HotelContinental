package com.hotelcontinental.identity_service.controller;

import com.hotelcontinental.identity_service.dto.ApiResponse;
import com.hotelcontinental.identity_service.dto.request.Authentication.OtpRegisterRequest;
import com.hotelcontinental.identity_service.dto.request.Authentication.OtpVerifyRequest;
import com.hotelcontinental.identity_service.dto.request.User.RegistrationRequest;
import com.hotelcontinental.identity_service.service.interfaces.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/otp-register")
    public ApiResponse<Void> otpRegister(@RequestBody OtpRegisterRequest request) {
        authenticationService.sendRegistrationOtp(request.getEmail());
        return ApiResponse.<Void>builder().build();
    }
    @PostMapping("/otp-verify")
    public ApiResponse<Boolean> otpVerify(@RequestBody OtpVerifyRequest request) {
        boolean isValid = authenticationService.verifyOtp(request);
        return ApiResponse.<Boolean>builder().result(isValid).build();
    }
    @PostMapping("/register")
    public ApiResponse<String> register(@RequestBody RegistrationRequest request) {
        String userId = authenticationService.register(request);
        return ApiResponse.<String>builder().result(userId).build();
    }
}
