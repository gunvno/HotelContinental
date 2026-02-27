package com.hotelcontinental.identity_service.service.serviceImpl;

import com.hotelcontinental.identity_service.dto.request.ProfileExpand.ProfileExpandCreationRequest;
import com.hotelcontinental.identity_service.dto.response.ProfileExpand.ProfileExpandResponse;
import com.hotelcontinental.identity_service.entity.ProfileExpands;
import com.hotelcontinental.identity_service.repository.ProfileExpandRepository;
import com.hotelcontinental.identity_service.service.interfaces.ProfileExpandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Override
    public ProfileExpandResponse createProfileExpand(ProfileExpandCreationRequest request) {
        String userId = request.getUserId();
        // Fallback to authenticated user if userId not in request (optional, but good for dual-use)
        if (userId == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            userId = auth.getName();
        }
        
        boolean exists = profileExpandRepository.existsById(userId);
        if(!exists) {
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
            return ProfileExpandResponse.builder()
                    .gender(request.getGender())
                    .dateOfBirth(request.getDateOfBirth())
                    .address(request.getAddress())
                    .phoneNumber(request.getPhoneNumber())
                    .identityNumber(request.getIdentityNumber())
                    .build();
        }
        return null;
    }
}
