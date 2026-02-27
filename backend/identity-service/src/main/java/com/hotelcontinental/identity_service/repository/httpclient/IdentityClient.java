package com.hotelcontinental.identity_service.repository.httpclient;

import com.hotelcontinental.identity_service.dto.identity.Credential;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hotelcontinental.identity_service.dto.identity.TokenExchangeParam;
import com.hotelcontinental.identity_service.dto.identity.TokenExchangeResponse;
import com.hotelcontinental.identity_service.dto.identity.UserCreationParam;

import feign.QueryMap;

@FeignClient(name = "identity-client", url = "${idp.url}")
public interface IdentityClient {
    @PostMapping(
            value = "/realms/HotelContinental/protocol/openid-connect/token",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    TokenExchangeResponse exchangeToken(@QueryMap TokenExchangeParam param);

    @PostMapping(value = "/admin/realms/HotelContinental/users", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<?> createUser(@RequestHeader("authorization") String token, @RequestBody UserCreationParam param);
    @PutMapping(
            value = "/admin/realms/HotelContinental/users/{userId}/reset-password",
            consumes = MediaType.APPLICATION_JSON_VALUE)
    void setPassword(
            @RequestHeader("Authorization") String token,
            @PathVariable("userId") String userId,
            @RequestBody Credential credential
    );
}

