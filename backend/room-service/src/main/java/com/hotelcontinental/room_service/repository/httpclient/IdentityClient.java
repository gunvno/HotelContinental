package com.hotelcontinental.room_service.repository.httpclient;

import com.hotelcontinental.room_service.configuration.AuthenticationRequestInterceptor;
import com.hotelcontinental.room_service.dto.ApiResponse;
import com.hotelcontinental.room_service.dto.response.user.UserInfoResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "identity-service",
        url = "${app.services.identity}",
        configuration = {AuthenticationRequestInterceptor.class})
public interface IdentityClient {
    @PostMapping(value = "/auth/userinfo", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserInfoResponse> getUserInfo(@RequestBody String token);
}
