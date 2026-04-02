package com.hotelcontinental.identity_service.service.interfaces;

import com.hotelcontinental.identity_service.dto.request.ProfileExpand.ProfileExpandCreationRequest;
import com.hotelcontinental.identity_service.dto.response.ProfileExpand.ProfileExpandResponse;
import com.hotelcontinental.identity_service.entity.ProfileExpands;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProfileExpandService {
    ProfileExpandResponse createProfileExpand(ProfileExpandCreationRequest request);
    ProfileExpandResponse getMyProfile();
    Page<ProfileExpandResponse> getAllProfileExpands(Pageable pageable);
}
