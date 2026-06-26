package com.hotelcontinental.identity_service.service.serviceImpl;

import com.hotelcontinental.identity_service.dto.response.StaffActivity.StaffActivitySessionResponse;
import com.hotelcontinental.identity_service.entity.Accounts;
import com.hotelcontinental.identity_service.entity.Roles;
import com.hotelcontinental.identity_service.entity.StaffActivitySession;
import com.hotelcontinental.identity_service.entity.User;
import com.hotelcontinental.identity_service.enums.Role;
import com.hotelcontinental.identity_service.enums.StaffActivityStatus;
import com.hotelcontinental.identity_service.exception.AppException;
import com.hotelcontinental.identity_service.exception.ErrorCode;
import com.hotelcontinental.identity_service.repository.AccountsRepository;
import com.hotelcontinental.identity_service.repository.StaffActivitySessionRepository;
import com.hotelcontinental.identity_service.service.interfaces.StaffActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StaffActivityServiceImpl implements StaffActivityService {
    private final StaffActivitySessionRepository staffActivitySessionRepository;
    private final AccountsRepository accountsRepository;

    @Override
    @Transactional
    public void recordLogin(Accounts account) {
        if (!isStaff(account)) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        staffActivitySessionRepository
                .findFirstByAccountIdAndStatusOrderByLoginTimeDesc(account.getId(), StaffActivityStatus.ACTIVE)
                .ifPresent(session -> {
                    session.setLogoutTime(now);
                    session.setStatus(StaffActivityStatus.COMPLETED);
                    session.setModifiedTime(now);
                    staffActivitySessionRepository.save(session);
                });

        staffActivitySessionRepository.save(StaffActivitySession.builder()
                .accountId(account.getId())
                .userId(account.getUserId())
                .username(account.getUsername())
                .fullName(buildFullName(account.getUser()))
                .primaryRole(resolvePrimaryRole(account))
                .loginTime(now)
                .status(StaffActivityStatus.ACTIVE)
                .createdTime(now)
                .modifiedTime(now)
                .build());
    }

    @Override
    @Transactional
    public void recordLogout(String accountId) {
        staffActivitySessionRepository
                .findFirstByAccountIdAndStatusOrderByLoginTimeDesc(accountId, StaffActivityStatus.ACTIVE)
                .ifPresent(session -> {
                    LocalDateTime now = LocalDateTime.now();
                    session.setLogoutTime(now);
                    session.setStatus(StaffActivityStatus.COMPLETED);
                    session.setModifiedTime(now);
                    staffActivitySessionRepository.save(session);
                });
    }

    @Override
    @Transactional
    public StaffActivitySessionResponse checkIn() {
        Accounts account = getCurrentAccount();
        if (!isStaff(account)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        StaffActivitySession session = staffActivitySessionRepository
                .findFirstByAccountIdAndStatusOrderByLoginTimeDesc(account.getId(), StaffActivityStatus.ACTIVE)
                .orElseGet(() -> createSession(account));

        if (session.getWorkCheckInTime() == null) {
            LocalDateTime now = LocalDateTime.now();
            session.setWorkCheckInTime(now);
            session.setModifiedTime(now);
            session = staffActivitySessionRepository.save(session);
        }

        return toResponse(session);
    }

    @Override
    @Transactional
    public StaffActivitySessionResponse checkOut() {
        Accounts account = getCurrentAccount();
        if (!isStaff(account)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        StaffActivitySession session = staffActivitySessionRepository
                .findFirstByAccountIdAndWorkCheckInTimeIsNotNullAndWorkCheckOutTimeIsNullOrderByWorkCheckInTimeDesc(account.getId())
                .orElseGet(() -> staffActivitySessionRepository
                        .findFirstByAccountIdAndStatusOrderByLoginTimeDesc(account.getId(), StaffActivityStatus.ACTIVE)
                        .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION)));

        if (session.getWorkCheckOutTime() == null) {
            LocalDateTime now = LocalDateTime.now();
            session.setWorkCheckOutTime(now);
            session.setModifiedTime(now);
            session = staffActivitySessionRepository.save(session);
        }

        return toResponse(session);
    }

    @Override
    public List<StaffActivitySessionResponse> getAll() {
        return staffActivitySessionRepository.findTop200ByOrderByLoginTimeDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<StaffActivitySessionResponse> getMine() {
        Accounts account = getCurrentAccount();
        return staffActivitySessionRepository.findByAccountIdOrderByLoginTimeDesc(account.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private StaffActivitySession createSession(Accounts account) {
        LocalDateTime now = LocalDateTime.now();
        return staffActivitySessionRepository.save(StaffActivitySession.builder()
                .accountId(account.getId())
                .userId(account.getUserId())
                .username(account.getUsername())
                .fullName(buildFullName(account.getUser()))
                .primaryRole(resolvePrimaryRole(account))
                .loginTime(now)
                .status(StaffActivityStatus.ACTIVE)
                .createdTime(now)
                .modifiedTime(now)
                .build());
    }

    private Accounts getCurrentAccount() {
        String userId = currentUserId();
        return accountsRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
    }

    private String currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken token) {
            String subject = token.getToken().getSubject();
            if (StringUtils.hasText(subject)) {
                return subject;
            }
        }
        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    private StaffActivitySessionResponse toResponse(StaffActivitySession session) {
        LocalDateTime now = LocalDateTime.now();
        return StaffActivitySessionResponse.builder()
                .id(session.getId())
                .accountId(session.getAccountId())
                .userId(session.getUserId())
                .username(session.getUsername())
                .fullName(session.getFullName())
                .primaryRole(session.getPrimaryRole())
                .loginTime(session.getLoginTime())
                .logoutTime(session.getLogoutTime())
                .workCheckInTime(session.getWorkCheckInTime())
                .workCheckOutTime(session.getWorkCheckOutTime())
                .status(session.getStatus())
                .loginDurationMinutes(minutesBetween(
                        session.getLoginTime(),
                        Optional.ofNullable(session.getLogoutTime()).orElse(now)
                ))
                .workDurationMinutes(minutesBetween(
                        session.getWorkCheckInTime(),
                        Optional.ofNullable(session.getWorkCheckOutTime()).orElse(now)
                ))
                .build();
    }

    private Long minutesBetween(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null || end.isBefore(start)) {
            return null;
        }
        return Duration.between(start, end).toMinutes();
    }

    private boolean isStaff(Accounts account) {
        if (account == null || account.getRoles() == null) {
            return false;
        }
        return account.getRoles().stream()
                .map(Roles::getName)
                .anyMatch(role -> role != Role.CUSTOMER);
    }

    private String resolvePrimaryRole(Accounts account) {
        if (account.getRoles() == null) {
            return null;
        }
        return account.getRoles().stream()
                .map(Roles::getName)
                .filter(role -> role != Role.CUSTOMER)
                .map(Role::name)
                .findFirst()
                .orElse(null);
    }

    private String buildFullName(User user) {
        if (user == null) {
            return "";
        }
        return ("%s %s".formatted(
                Optional.ofNullable(user.getFirstName()).orElse(""),
                Optional.ofNullable(user.getLastName()).orElse("")
        )).trim();
    }
}
