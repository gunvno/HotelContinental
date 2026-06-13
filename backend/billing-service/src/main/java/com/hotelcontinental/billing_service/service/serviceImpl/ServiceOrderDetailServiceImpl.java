package com.hotelcontinental.billing_service.service.serviceImpl;

import com.hotelcontinental.billing_service.dto.request.RoomBookingTotalsUpdateRequest;
import com.hotelcontinental.billing_service.dto.request.ServiceOrderDetailCreationRequest;
import com.hotelcontinental.billing_service.dto.response.CatalogServiceSnapshotResponse;
import com.hotelcontinental.billing_service.dto.response.RoomBookingSnapshotResponse;
import com.hotelcontinental.billing_service.dto.response.ServiceOrderDetailResponse;
import com.hotelcontinental.billing_service.entity.ServiceOrderDetails;
import com.hotelcontinental.billing_service.enums.ServiceOrderDetailStatus;
import com.hotelcontinental.billing_service.exception.AppException;
import com.hotelcontinental.billing_service.exception.ErrorCode;
import com.hotelcontinental.billing_service.repository.ServiceOrderDetailsRepository;
import com.hotelcontinental.billing_service.service.interfaces.ServiceOrderDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceOrderDetailServiceImpl implements ServiceOrderDetailService {
    private final ServiceOrderDetailsRepository serviceOrderDetailsRepository;
    private final ExternalServiceClient externalServiceClient;

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('SERVICE_ORDER_CREATE')")
    public ServiceOrderDetailResponse create(ServiceOrderDetailCreationRequest request) {
        return createInternal(request, false);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('SERVICE_ORDER_CUSTOMER_CREATE')")
    public ServiceOrderDetailResponse createForCurrentCustomer(ServiceOrderDetailCreationRequest request) {
        return createInternal(request, true);
    }

    private ServiceOrderDetailResponse createInternal(
            ServiceOrderDetailCreationRequest request,
            boolean currentCustomerOnly
    ) {
        validateCreateRequest(request);

        RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(request.getRoomBookingId().trim());
        if (currentCustomerOnly) {
            validateCustomerBookingCanOrderService(booking);
        }
        if (booking.getBookingDetailId() == null || booking.getBookingDetailId().isBlank()) {
            throw new AppException(ErrorCode.INVALID_SERVICE_ORDER_REQUEST);
        }

        CatalogServiceSnapshotResponse catalogService = externalServiceClient.getCatalogService(request.getServiceId().trim());
        if (Boolean.TRUE.equals(catalogService.getDeleted()) || catalogService.getPrice() < 0) {
            throw new AppException(ErrorCode.CATALOG_SERVICE_NOT_FOUND);
        }

        LocalDateTime now = LocalDateTime.now();
        String actor = getCurrentActor();
        int quantity = request.getQuantity();

        ServiceOrderDetails detail = new ServiceOrderDetails();
        detail.setRoomBookingId(booking.getId());
        detail.setRoomBookingDetailId(booking.getBookingDetailId());
        detail.setServiceId(catalogService.getId());
        detail.setQuantity(quantity);
        detail.setAmount(quantity);
        detail.setPrice(catalogService.getPrice());
        detail.setDescription(request.getDescription());
        detail.setStatus(ServiceOrderDetailStatus.WAITING);
        detail.setCreatedTime(now);
        detail.setCreatedBy(actor);
        detail.setDeleted(false);

        detail = serviceOrderDetailsRepository.save(detail);
        syncBookingTotals(request.getRoomBookingId().trim(), booking);

        return map(detail, request.getRoomBookingId().trim(), catalogService);
    }

    @Override
    @PreAuthorize("hasAuthority('SERVICE_ORDER_VIEW')")
    public List<ServiceOrderDetailResponse> getAll(String roomBookingId) {
        if (roomBookingId == null || roomBookingId.isBlank()) {
            return serviceOrderDetailsRepository.findByDeletedFalseOrderByCreatedTimeDesc()
                    .stream()
                    .map(detail -> map(detail, null, null))
                    .toList();
        }

        RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(roomBookingId.trim());
        return serviceOrderDetailsRepository.findByRoomBookingDetailIdAndDeletedFalseOrderByCreatedTimeDesc(booking.getBookingDetailId())
                .stream()
                .map(detail -> map(detail, detail.getRoomBookingId(), null))
                .toList();
    }

    @Override
    @PreAuthorize("hasAuthority('SERVICE_ORDER_CUSTOMER_VIEW')")
    public List<ServiceOrderDetailResponse> getForCurrentCustomer(String roomBookingId) {
        if (roomBookingId == null || roomBookingId.isBlank()) {
            throw new AppException(ErrorCode.INVALID_SERVICE_ORDER_REQUEST);
        }

        RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(roomBookingId.trim());
        validateCustomerBookingAccess(booking);

        return serviceOrderDetailsRepository.findByRoomBookingDetailIdAndDeletedFalseOrderByCreatedTimeDesc(booking.getBookingDetailId())
                .stream()
                .map(detail -> map(detail, detail.getRoomBookingId(), null))
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('SERVICE_ORDER_SERVE')")
    public ServiceOrderDetailResponse markServed(String id) {
        ServiceOrderDetails detail = getRequiredDetail(id);
        detail.setStatus(ServiceOrderDetailStatus.SERVED);
        detail.setServedTime(LocalDateTime.now());
        detail.setModifiedTime(LocalDateTime.now());
        detail.setModifiedBy(getCurrentActor());
        return map(serviceOrderDetailsRepository.save(detail), null, null);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('SERVICE_ORDER_DELETE')")
    public void delete(String id) {
        ServiceOrderDetails detail = getRequiredDetail(id);
        String roomBookingId = detail.getRoomBookingId();
        detail.setDeleted(true);
        detail.setDeletedTime(LocalDateTime.now());
        detail.setDeletedBy(getCurrentActor());
        serviceOrderDetailsRepository.save(detail);

        if (roomBookingId != null && !roomBookingId.isBlank()) {
            RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(roomBookingId);
            syncBookingTotals(roomBookingId, booking);
        }
    }

    private void syncBookingTotals(String roomBookingId, RoomBookingSnapshotResponse booking) {
        float totalServicePrice = serviceOrderDetailsRepository.sumActiveServiceTotal(roomBookingId);
        float totalPrice = booking.getTotalRoomPrice() + totalServicePrice + booking.getTotalExtraPrice();

        externalServiceClient.updateBookingTotals(roomBookingId, RoomBookingTotalsUpdateRequest.builder()
                .totalRoomPrice(booking.getTotalRoomPrice())
                .totalServicePrice(totalServicePrice)
                .totalExtraPrice(booking.getTotalExtraPrice())
                .totalPrice(totalPrice)
                .build());
    }

    private ServiceOrderDetails getRequiredDetail(String id) {
        return serviceOrderDetailsRepository.findById(id)
                .filter(detail -> !Boolean.TRUE.equals(detail.getDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_ORDER_NOT_FOUND));
    }

    private void validateCreateRequest(ServiceOrderDetailCreationRequest request) {
        if (request == null
                || request.getRoomBookingId() == null || request.getRoomBookingId().isBlank()
                || request.getServiceId() == null || request.getServiceId().isBlank()
                || request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new AppException(ErrorCode.INVALID_SERVICE_ORDER_REQUEST);
        }
    }

    private void validateCustomerBookingCanOrderService(RoomBookingSnapshotResponse booking) {
        validateCustomerBookingAccess(booking);

        if (!"CHECKED_IN".equals(booking.getStatus()) || !"CHECKED_IN".equals(booking.getDetailStatus())) {
            throw new AppException(ErrorCode.BOOKING_NOT_AVAILABLE_FOR_SERVICE_ORDER);
        }
    }

    private void validateCustomerBookingAccess(RoomBookingSnapshotResponse booking) {
        if (booking == null || booking.getCustomerId() == null || !booking.getCustomerId().equals(getCurrentActor())) {
            throw new AppException(ErrorCode.SERVICE_ORDER_BOOKING_FORBIDDEN);
        }
    }

    private String getCurrentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return authentication.getName();
    }

    private ServiceOrderDetailResponse map(
            ServiceOrderDetails detail,
            String roomBookingId,
            CatalogServiceSnapshotResponse catalogService
    ) {
        return ServiceOrderDetailResponse.builder()
                .id(detail.getId())
                .serviceId(detail.getServiceId())
                .serviceName(catalogService != null ? catalogService.getName() : null)
                .roomBookingId(roomBookingId != null ? roomBookingId : detail.getRoomBookingId())
                .roomBookingDetailId(detail.getRoomBookingDetailId())
                .quantity(detail.getQuantity())
                .amount(detail.getAmount())
                .price(detail.getPrice())
                .totalPrice(detail.getPrice() * detail.getQuantity())
                .description(detail.getDescription())
                .status(detail.getStatus())
                .servedTime(detail.getServedTime())
                .createdTime(detail.getCreatedTime())
                .createdBy(detail.getCreatedBy())
                .build();
    }
}
