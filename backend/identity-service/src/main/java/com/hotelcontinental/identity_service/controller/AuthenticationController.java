package com.hotelcontinental.identity_service.controller;

import com.hotelcontinental.identity_service.dto.ApiResponse;
import com.hotelcontinental.identity_service.dto.request.Authentication.OtpRegisterRequest;
import com.hotelcontinental.identity_service.dto.request.Authentication.OtpVerifyRequest;
import com.hotelcontinental.identity_service.dto.request.User.RegistrationRequest;
import com.hotelcontinental.identity_service.dto.request.Authentication.IntrospectRequest;
import com.hotelcontinental.identity_service.dto.response.Authentication.IntrospectResponse;
import com.hotelcontinental.identity_service.dto.response.User.UserInfoResponse;
import com.hotelcontinental.identity_service.service.interfaces.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) {
        return ApiResponse.<IntrospectResponse>builder()
                .result(authenticationService.introspect(request))
                .build();
    }

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
    @PostMapping("/userinfo")
    public ApiResponse<UserInfoResponse> getUserInfo(@RequestBody String token){
        UserInfoResponse userInfo = authenticationService.getInfoByToken(token);
        return ApiResponse.<UserInfoResponse>builder().result(userInfo).build();
    }
}
