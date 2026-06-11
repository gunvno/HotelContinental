package com.hotelcontinental.content_service.service.interfaces;

import com.hotelcontinental.content_service.dto.request.PolicyRequest;
import com.hotelcontinental.content_service.dto.request.PolicyTypeRequest;
import com.hotelcontinental.content_service.dto.response.PolicyResponse;
import com.hotelcontinental.content_service.dto.response.PolicyTypeResponse;

import java.util.List;

public interface PolicyService {
    PolicyTypeResponse createPolicyType(PolicyTypeRequest request);
    PolicyTypeResponse updatePolicyType(String id, PolicyTypeRequest request);
    void deletePolicyType(String id);
    List<PolicyTypeResponse> getPolicyTypes();
    PolicyTypeResponse getPolicyTypeByCode(String code);
    PolicyResponse createPolicy(PolicyRequest request);
    PolicyResponse updatePolicy(String id, PolicyRequest request);
    void deletePolicy(String id);
}
