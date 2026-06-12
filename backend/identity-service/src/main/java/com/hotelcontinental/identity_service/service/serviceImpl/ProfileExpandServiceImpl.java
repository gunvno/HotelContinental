package com.hotelcontinental.identity_service.service.serviceImpl;

import com.hotelcontinental.identity_service.dto.request.ProfileExpand.ProfileExpandCreationRequest;
import com.hotelcontinental.identity_service.dto.response.ProfileExpand.ProfileExpandResponse;
import com.hotelcontinental.identity_service.entity.ProfileExpands;
import com.hotelcontinental.identity_service.entity.User;
import com.hotelcontinental.identity_service.exception.AppException;
import com.hotelcontinental.identity_service.exception.ErrorCode;
import com.hotelcontinental.identity_service.repository.ProfileExpandRepository;
import com.hotelcontinental.identity_service.repository.UserRepository;
import com.hotelcontinental.identity_service.service.interfaces.ProfileExpandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileExpandServiceImpl implements ProfileExpandService {
    @Autowired
    private ProfileExpandRepository profileExpandRepository;
    @Autowired
    private UserRepository userRepository;

    @PreAuthorize("hasAuthority('UPDATE_USER')")
    @Override
    public ProfileExpandResponse createProfileExpand(ProfileExpandCreationRequest request) {
        String userId = request.getUserId();
        if (userId == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            userId = auth.getName();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setModifiedTime(LocalDateTime.now());
        userRepository.save(user);

        boolean exists = profileExpandRepository.existsById(userId);
        if (!exists) {
            ProfileExpands profileExpand = ProfileExpands.builder()
                    .id(userId)
                    .gender(request.getGender())
                    .dateOfBirth(request.getDateOfBirth())
                    .address(request.getAddress())
                    .phoneNumber(request.getPhoneNumber())
                    .identityNumber(request.getIdentityNumber())
                    .createdTime(LocalDateTime.now())
                    .createdBy(null)
                    .modifiedTime(LocalDateTime.now())
                    .modifiedBy(null)
                    .deleted(false)
                    .deletedTime(null)
                    .deletedBy(null)
                    .build();
            profileExpandRepository.save(profileExpand);
        }

        return buildUserProfileResponse(user, request);
    }

    @PreAuthorize("hasAuthority('GET_MY_INFO')")
    @Override
    public ProfileExpandResponse getMyProfile() {
        var context = SecurityContextHolder.getContext();
        String userId = context.getAuthentication().getName();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        ProfileExpands profile = profileExpandRepository.findById(userId).orElse(null);

        return ProfileExpandResponse.builder()
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .gender(profile != null ? profile.getGender() : null)
                .dateOfBirth(profile != null ? profile.getDateOfBirth() : null)
                .address(profile != null ? profile.getAddress() : null)
                .phoneNumber(user.getPhoneNumber())
                .identityNumber(profile != null ? profile.getIdentityNumber() : null)
                .build();
    }
    @PreAuthorize("hasAuthority('GET_ALL_USER')")
    @Override
    public Page<ProfileExpandResponse> getAllProfileExpands(Pageable pageable) {
        return profileExpandRepository.findAll(pageable)
                .map(profile -> ProfileExpandResponse.builder()
                        .gender(profile.getGender())
                        .dateOfBirth(profile.getDateOfBirth())
                        .address(profile.getAddress())
                        .phoneNumber(profile.getPhoneNumber())
                        .identityNumber(profile.getIdentityNumber())
                        .build());
    }

    private ProfileExpandResponse buildUserProfileResponse(User user, ProfileExpandCreationRequest request) {
        return ProfileExpandResponse.builder()
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .phoneNumber(user.getPhoneNumber())
                .identityNumber(request.getIdentityNumber())
                .build();
    }
}
