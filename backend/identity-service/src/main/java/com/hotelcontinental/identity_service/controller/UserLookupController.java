package com.hotelcontinental.identity_service.controller;

import com.hotelcontinental.identity_service.dto.ApiResponse;
import com.hotelcontinental.identity_service.dto.response.User.UserSummaryResponse;
import com.hotelcontinental.identity_service.entity.Accounts;
import com.hotelcontinental.identity_service.entity.User;
import com.hotelcontinental.identity_service.exception.AppException;
import com.hotelcontinental.identity_service.exception.ErrorCode;
import com.hotelcontinental.identity_service.repository.AccountsRepository;
import com.hotelcontinental.identity_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserLookupController {
    private final UserRepository userRepository;
    private final AccountsRepository accountsRepository;

    @GetMapping("/{userId}/summary")
    @PreAuthorize("hasAnyAuthority('CHAT_STAFF_VIEW', 'GET_ALL_USER', 'PERMISSION_MANAGE')")
    public ApiResponse<UserSummaryResponse> getUserSummary(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .filter(item -> !Boolean.TRUE.equals(item.getDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Accounts account = accountsRepository.findByUserId(userId).orElse(null);

        return ApiResponse.<UserSummaryResponse>builder()
                .result(UserSummaryResponse.builder()
                        .id(user.getId())
                        .username(account != null ? account.getUsername() : null)
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .email(user.getEmail())
                        .build())
                .build();
    }
}
