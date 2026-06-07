package com.hotelcontinental.catalog_service.controller;

import com.hotelcontinental.catalog_service.dto.ApiResponse;
import com.hotelcontinental.catalog_service.dto.response.service.ServiceResponse;
import com.hotelcontinental.catalog_service.entity.Services;
import com.hotelcontinental.catalog_service.repository.ServicesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/service")
@RequiredArgsConstructor
public class ServiceController {
    private final ServicesRepository servicesRepository;

    @GetMapping
    public ApiResponse<Page<ServiceResponse>> getAllServices(Pageable pageable) {
        return ApiResponse.<Page<ServiceResponse>>builder()
                .result(servicesRepository.findAll(pageable).map(this::map))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ServiceResponse> getService(@PathVariable String id) {
        return ApiResponse.<ServiceResponse>builder()
                .result(servicesRepository.findById(id).map(this::map).orElse(null))
                .build();
    }

    private ServiceResponse map(Services entity) {
        return ServiceResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .image(entity.getImage())
                .status(entity.getStatus())
                .deleted(entity.getDeleted())
                .createdTime(entity.getCreatedTime())
                .createdBy(entity.getCreatedBy())
                .modifiedTime(entity.getModifiedTime())
                .modifiedBy(entity.getModifiedBy())
                .build();
    }
}
