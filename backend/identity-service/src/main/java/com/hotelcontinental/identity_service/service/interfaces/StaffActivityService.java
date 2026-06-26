package com.hotelcontinental.identity_service.service.interfaces;

import com.hotelcontinental.identity_service.dto.response.StaffActivity.StaffActivitySessionResponse;
import com.hotelcontinental.identity_service.entity.Accounts;

import java.util.List;

public interface StaffActivityService {
    void recordLogin(Accounts account);

    void recordLogout(String accountId);

    StaffActivitySessionResponse checkIn();

    StaffActivitySessionResponse checkOut();

    List<StaffActivitySessionResponse> getAll();

    List<StaffActivitySessionResponse> getMine();
}
