package com.hotelcontinental.identity_service.service.interfaces;

import com.hotelcontinental.identity_service.dto.response.User.UserSummaryResponse;

public interface UserLookupService {
    UserSummaryResponse getUserSummary(String userId);
}
