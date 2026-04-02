package com.hotelcontinental.room_service.repository.httpclient;

import com.hotelcontinental.identity_service.configuration.AuthenticationRequestInterceptor;
import com.hotelcontinental.identity_service.dto.response.User.UserInfoResponse;
import com.hotelcontinental.room_service.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "profile-service",
        url = "${app.services.identity}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface IdentityClient {
    @PostMapping(value = "/auth/userinfo", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserInfoResponse> getUserInfo(@RequestBody String token);
}
