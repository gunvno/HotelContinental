package com.hotelcontinental.identity_service.controller;

import com.hotelcontinental.identity_service.dto.ApiResponse;
import com.hotelcontinental.identity_service.dto.request.ProfileExpand.ProfileExpandCreationRequest;
import com.hotelcontinental.identity_service.dto.response.ProfileExpand.ProfileExpandResponse;
import com.hotelcontinental.identity_service.service.interfaces.ProfileExpandService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/profileExpand")
@RequiredArgsConstructor
public class ProfileExpandController {
    @Autowired
    private ProfileExpandService profileExpandService;
    @PostMapping("create")
    ApiResponse<ProfileExpandResponse> createProfileExpand(@RequestBody ProfileExpandCreationRequest request) {
        return ApiResponse.<ProfileExpandResponse>builder()
                .result(profileExpandService.createProfileExpand(request))
                .build();
    }
}
