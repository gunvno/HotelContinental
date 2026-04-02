package com.hotelcontinental.identity_service.controller;

import com.hotelcontinental.identity_service.dto.ApiResponse;
import com.hotelcontinental.identity_service.dto.request.ProfileExpand.ProfileExpandCreationRequest;
import com.hotelcontinental.identity_service.dto.response.ProfileExpand.ProfileExpandResponse;
import com.hotelcontinental.identity_service.service.interfaces.ProfileExpandService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

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

    @GetMapping("/my-profile")
    ApiResponse<ProfileExpandResponse> getMyProfile() {
        return ApiResponse.<ProfileExpandResponse>builder()
                .result(profileExpandService.getMyProfile())
                .build();
    }

    @GetMapping
    ApiResponse<Page<ProfileExpandResponse>> getAllProfileExpands(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<Page<ProfileExpandResponse>>builder()
                .result(profileExpandService.getAllProfileExpands(pageable))
                .build();
    }
}
