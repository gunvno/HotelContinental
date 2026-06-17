package com.hotelcontinental.identity_service.service.serviceImpl;

import com.hotelcontinental.identity_service.dto.response.User.UserSummaryResponse;
import com.hotelcontinental.identity_service.entity.Accounts;
import com.hotelcontinental.identity_service.entity.User;
import com.hotelcontinental.identity_service.exception.AppException;
import com.hotelcontinental.identity_service.exception.ErrorCode;
import com.hotelcontinental.identity_service.repository.AccountsRepository;
import com.hotelcontinental.identity_service.repository.UserRepository;
import com.hotelcontinental.identity_service.service.interfaces.UserLookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserLookupServiceImpl implements UserLookupService {
    private final UserRepository userRepository;
    private final AccountsRepository accountsRepository;

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('CHAT_STAFF_VIEW', 'GET_ALL_USER', 'PERMISSION_MANAGE', 'BOOKING_VIEW', 'BOOKING_CHECKIN')")
    public UserSummaryResponse getUserSummary(String userId) {
        User user = userRepository.findById(userId)
                .filter(item -> !Boolean.TRUE.equals(item.getDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Accounts account = accountsRepository.findByUserId(userId).orElse(null);

        return UserSummaryResponse.builder()
                .id(user.getId())
                .username(account != null ? account.getUsername() : null)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .build();
    }
}
