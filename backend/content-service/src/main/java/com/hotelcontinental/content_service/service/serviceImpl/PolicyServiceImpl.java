package com.hotelcontinental.content_service.service.serviceImpl;

import com.hotelcontinental.content_service.dto.request.PolicyRequest;
import com.hotelcontinental.content_service.dto.request.PolicyTypeRequest;
import com.hotelcontinental.content_service.dto.response.PolicyResponse;
import com.hotelcontinental.content_service.dto.response.PolicyTypeResponse;
import com.hotelcontinental.content_service.entity.Policy;
import com.hotelcontinental.content_service.entity.PolicyTypes;
import com.hotelcontinental.content_service.exception.AppException;
import com.hotelcontinental.content_service.exception.ErrorCode;
import com.hotelcontinental.content_service.repository.PolicyRepository;
import com.hotelcontinental.content_service.repository.PolicyTypesRepository;
import com.hotelcontinental.content_service.service.interfaces.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PolicyServiceImpl implements PolicyService {
    private final PolicyTypesRepository policyTypesRepository;
    private final PolicyRepository policyRepository;

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('POLICY_TYPE_CREATE')")
    public PolicyTypeResponse createPolicyType(PolicyTypeRequest request) {
        validatePolicyType(request);
        LocalDateTime now = LocalDateTime.now();
        String actor = getCurrentActor();
        String code = normalizeCode(request.getCode());

        policyTypesRepository.findAvailableByCode(code)
                .ifPresent(existing -> {
                    throw new AppException(ErrorCode.POLICY_CODE_EXISTED);
                });

        PolicyTypes type = new PolicyTypes();
        type.setCode(code);
        type.setTitleOfType(request.getTitleOfType().trim());
        type.setContent(request.getContent());
        type.setCreatedTime(now);
        type.setCreatedBy(actor);
        type.setDeleted(false);
        return mapType(policyTypesRepository.save(type));
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('POLICY_TYPE_UPDATE')")
    public PolicyTypeResponse updatePolicyType(String id, PolicyTypeRequest request) {
        validatePolicyType(request);
        PolicyTypes type = getType(id);
        String code = normalizeCode(request.getCode());

        policyTypesRepository.findAvailableByCode(code)
                .filter(existing -> !existing.getId().equals(type.getId()))
                .ifPresent(existing -> {
                    throw new AppException(ErrorCode.POLICY_CODE_EXISTED);
                });

        type.setCode(code);
        type.setTitleOfType(request.getTitleOfType().trim());
        type.setContent(request.getContent());
        type.setModifiedTime(LocalDateTime.now());
        type.setModifiedBy(getCurrentActor());
        return mapType(policyTypesRepository.save(type));
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('POLICY_TYPE_DELETE')")
    public void deletePolicyType(String id) {
        PolicyTypes type = getType(id);
        type.setDeleted(true);
        type.setDeletedTime(LocalDateTime.now());
        type.setDeletedBy(getCurrentActor());
        policyTypesRepository.save(type);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PolicyTypeResponse> getPolicyTypes() {
        return policyTypesRepository.findAvailable().stream().map(this::mapType).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PolicyTypeResponse getPolicyTypeByCode(String code) {
        return mapType(policyTypesRepository.findAvailableByCode(normalizeCode(code))
                .orElseThrow(() -> new AppException(ErrorCode.POLICY_NOT_FOUND)));
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('POLICY_CREATE')")
    public PolicyResponse createPolicy(PolicyRequest request) {
        validatePolicy(request);
        LocalDateTime now = LocalDateTime.now();
        String actor = getCurrentActor();

        Policy policy = new Policy();
        policy.setPolicyTypes(getType(request.getPolicyTypeId()));
        policy.setTitle(request.getTitle().trim());
        policy.setContent(request.getContent());
        policy.setCreatedTime(now);
        policy.setCreatedBy(actor);
        policy.setDeleted(false);
        return mapPolicy(policyRepository.save(policy));
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('POLICY_UPDATE')")
    public PolicyResponse updatePolicy(String id, PolicyRequest request) {
        validatePolicy(request);
        Policy policy = getPolicy(id);
        policy.setPolicyTypes(getType(request.getPolicyTypeId()));
        policy.setTitle(request.getTitle().trim());
        policy.setContent(request.getContent());
        policy.setModifiedTime(LocalDateTime.now());
        policy.setModifiedBy(getCurrentActor());
        return mapPolicy(policyRepository.save(policy));
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('POLICY_DELETE')")
    public void deletePolicy(String id) {
        Policy policy = getPolicy(id);
        policy.setDeleted(true);
        policy.setDeletedTime(LocalDateTime.now());
        policy.setDeletedBy(getCurrentActor());
        policyRepository.save(policy);
    }

    private PolicyTypes getType(String id) {
        if (!StringUtils.hasText(id)) {
            throw new AppException(ErrorCode.INVALID_POLICY_REQUEST);
        }
        return policyTypesRepository.findById(id)
                .filter(type -> !Boolean.TRUE.equals(type.getDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.POLICY_NOT_FOUND));
    }

    private Policy getPolicy(String id) {
        if (!StringUtils.hasText(id)) {
            throw new AppException(ErrorCode.INVALID_POLICY_REQUEST);
        }
        return policyRepository.findById(id)
                .filter(policy -> !Boolean.TRUE.equals(policy.getDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.POLICY_NOT_FOUND));
    }

    private void validatePolicyType(PolicyTypeRequest request) {
        if (request == null || !StringUtils.hasText(request.getCode()) || !StringUtils.hasText(request.getTitleOfType())) {
            throw new AppException(ErrorCode.INVALID_POLICY_REQUEST);
        }
    }

    private void validatePolicy(PolicyRequest request) {
        if (request == null || !StringUtils.hasText(request.getPolicyTypeId()) || !StringUtils.hasText(request.getTitle())) {
            throw new AppException(ErrorCode.INVALID_POLICY_REQUEST);
        }
    }

    private String normalizeCode(String code) {
        if (!StringUtils.hasText(code)) {
            throw new AppException(ErrorCode.INVALID_POLICY_REQUEST);
        }
        return code.trim().toUpperCase(Locale.ROOT).replace(" ", "_");
    }

    private String getCurrentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return authentication.getName();
    }

    private PolicyTypeResponse mapType(PolicyTypes type) {
        return PolicyTypeResponse.builder()
                .id(type.getId())
                .code(type.getCode())
                .titleOfType(type.getTitleOfType())
                .content(type.getContent())
                .policies(policyRepository.findAvailableByPolicyTypeId(type.getId()).stream().map(this::mapPolicy).toList())
                .createdTime(type.getCreatedTime())
                .modifiedTime(type.getModifiedTime())
                .build();
    }

    private PolicyResponse mapPolicy(Policy policy) {
        return PolicyResponse.builder()
                .id(policy.getId())
                .policyTypeId(policy.getPolicyTypes() != null ? policy.getPolicyTypes().getId() : null)
                .title(policy.getTitle())
                .content(policy.getContent())
                .createdTime(policy.getCreatedTime())
                .modifiedTime(policy.getModifiedTime())
                .build();
    }
}
