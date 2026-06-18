package com.hotelcontinental.catalog_service.controller;

import com.hotelcontinental.catalog_service.dto.ApiResponse;
import com.hotelcontinental.catalog_service.dto.request.service.ServiceRequest;
import com.hotelcontinental.catalog_service.dto.response.service.ServiceResponse;
import com.hotelcontinental.catalog_service.entity.Services;
import com.hotelcontinental.catalog_service.enums.ServiceStatus;
import com.hotelcontinental.catalog_service.repository.ServicesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

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

    @PostMapping
    public ApiResponse<ServiceResponse> createService(@RequestBody ServiceRequest request) {
        Services entity = new Services();
        applyRequest(entity, request);
        entity.setDeleted(false);
        entity.setCreatedTime(LocalDateTime.now());

        return ApiResponse.<ServiceResponse>builder()
                .result(map(servicesRepository.save(entity)))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<ServiceResponse> updateService(
            @PathVariable String id,
            @RequestBody ServiceRequest request
    ) {
        Services entity = servicesRepository.findById(id).orElseThrow();
        applyRequest(entity, request);
        if (request.getDeleted() != null) {
            entity.setDeleted(request.getDeleted());
        }
        entity.setModifiedTime(LocalDateTime.now());

        return ApiResponse.<ServiceResponse>builder()
                .result(map(servicesRepository.save(entity)))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteService(@PathVariable String id) {
        Services entity = servicesRepository.findById(id).orElseThrow();
        entity.setDeleted(true);
        entity.setDeletedTime(LocalDateTime.now());
        servicesRepository.save(entity);

        return ApiResponse.<Void>builder().build();
    }

    private void applyRequest(Services entity, ServiceRequest request) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setPrice(request.getPrice() == null ? 0 : request.getPrice());
        entity.setImage(request.getImage());
        entity.setStatus(request.getStatus() == null ? ServiceStatus.AVAILABLE : request.getStatus());
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
