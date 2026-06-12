package com.hotelcontinental.content_service.controller;

import com.hotelcontinental.content_service.dto.ApiResponse;
import com.hotelcontinental.content_service.dto.request.PolicyRequest;
import com.hotelcontinental.content_service.dto.request.PolicyTypeRequest;
import com.hotelcontinental.content_service.dto.response.PolicyResponse;
import com.hotelcontinental.content_service.dto.response.PolicyTypeResponse;
import com.hotelcontinental.content_service.service.interfaces.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/policies")
@RequiredArgsConstructor
public class PolicyController {
    private final PolicyService policyService;

    @GetMapping
    public ApiResponse<List<PolicyTypeResponse>> getPolicyTypes() {
        return ApiResponse.<List<PolicyTypeResponse>>builder()
                .result(policyService.getPolicyTypes())
                .build();
    }

    @GetMapping("/{code}")
    public ApiResponse<PolicyTypeResponse> getPolicyTypeByCode(@PathVariable String code) {
        return ApiResponse.<PolicyTypeResponse>builder()
                .result(policyService.getPolicyTypeByCode(code))
                .build();
    }

    @PostMapping("/types")
    @PreAuthorize("hasAuthority('POLICY_TYPE_CREATE')")
    public ApiResponse<PolicyTypeResponse> createPolicyType(@RequestBody PolicyTypeRequest request) {
        return ApiResponse.<PolicyTypeResponse>builder()
                .result(policyService.createPolicyType(request))
                .build();
    }

    @PutMapping("/types/{id}")
    @PreAuthorize("hasAuthority('POLICY_TYPE_UPDATE')")
    public ApiResponse<PolicyTypeResponse> updatePolicyType(@PathVariable String id, @RequestBody PolicyTypeRequest request) {
        return ApiResponse.<PolicyTypeResponse>builder()
                .result(policyService.updatePolicyType(id, request))
                .build();
    }

    @DeleteMapping("/types/{id}")
    @PreAuthorize("hasAuthority('POLICY_TYPE_DELETE')")
    public ApiResponse<Void> deletePolicyType(@PathVariable String id) {
        policyService.deletePolicyType(id);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('POLICY_CREATE')")
    public ApiResponse<PolicyResponse> createPolicy(@RequestBody PolicyRequest request) {
        return ApiResponse.<PolicyResponse>builder()
                .result(policyService.createPolicy(request))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('POLICY_UPDATE')")
    public ApiResponse<PolicyResponse> updatePolicy(@PathVariable String id, @RequestBody PolicyRequest request) {
        return ApiResponse.<PolicyResponse>builder()
                .result(policyService.updatePolicy(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('POLICY_DELETE')")
    public ApiResponse<Void> deletePolicy(@PathVariable String id) {
        policyService.deletePolicy(id);
        return ApiResponse.<Void>builder().build();
    }
}
