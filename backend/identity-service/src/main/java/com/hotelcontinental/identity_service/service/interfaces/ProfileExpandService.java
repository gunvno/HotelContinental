package com.hotelcontinental.identity_service.service.interfaces;

import com.hotelcontinental.identity_service.dto.request.ProfileExpand.ProfileExpandCreationRequest;
import com.hotelcontinental.identity_service.dto.response.ProfileExpand.ProfileExpandResponse;

public interface ProfileExpandService {
    ProfileExpandResponse createProfileExpand(ProfileExpandCreationRequest request);
}
