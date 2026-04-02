package com.hotelcontinental.identity_service.dto.response.User;

import lombok.Data;

@Data
public class UserInfoResponse {
    private String sub;
    private String email;
    private String preferred_username;
    private String given_name;
    private String family_name;
}
