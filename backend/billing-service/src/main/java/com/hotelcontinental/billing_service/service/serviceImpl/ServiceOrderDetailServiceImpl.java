package com.hotelcontinental.billing_service.service.serviceImpl;

import com.hotelcontinental.billing_service.dto.request.RoomBookingTotalsUpdateRequest;
import com.hotelcontinental.billing_service.dto.request.ServiceOrderDetailCreationRequest;
import com.hotelcontinental.billing_service.dto.request.PaymentCreationRequest;
import com.hotelcontinental.billing_service.dto.request.ServiceOrderCheckoutPaymentRequest;
import com.hotelcontinental.billing_service.dto.response.CatalogServiceSnapshotResponse;
import com.hotelcontinental.billing_service.dto.response.RoomBookingSnapshotResponse;
import com.hotelcontinental.billing_service.dto.response.RoomSnapshotResponse;
import com.hotelcontinental.billing_service.dto.response.RoomTypeServiceSnapshotResponse;
import com.hotelcontinental.billing_service.dto.response.ServiceOrderDetailResponse;
import com.hotelcontinental.billing_service.entity.ServiceOrderDetails;
import com.hotelcontinental.billing_service.enums.PaymentMethod;
import com.hotelcontinental.billing_service.enums.ServiceOrderApprovalStatus;
import com.hotelcontinental.billing_service.enums.ServiceOrderDetailStatus;
import com.hotelcontinental.billing_service.enums.ServiceOrderPaymentStatus;
import com.hotelcontinental.billing_service.enums.ServiceOrderSource;
import com.hotelcontinental.billing_service.exception.AppException;
import com.hotelcontinental.billing_service.exception.ErrorCode;
import com.hotelcontinental.billing_service.repository.ServiceOrderDetailsRepository;
import com.hotelcontinental.billing_service.service.interfaces.ServiceOrderDetailService;
import com.hotelcontinental.billing_service.service.interfaces.PaymentService;
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
    private final PaymentService paymentService;

    @Override
    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_RECEPTIONIST')")
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
        String orderMode = catalogService.getOrderMode() == null || catalogService.getOrderMode().isBlank()
                ? "CUSTOMER_INSTANT"
                : catalogService.getOrderMode();
        if (currentCustomerOnly && "STAFF_ONLY".equals(orderMode)) {
            throw new AppException(ErrorCode.SERVICE_ORDER_STAFF_ONLY);
        }
        RoomSnapshotResponse room = loadRoomSafely(booking.getRoomId());

        LocalDateTime now = LocalDateTime.now();
        String actor = getCurrentActor();
        int quantity = request.getQuantity();

        ServiceOrderDetails detail = new ServiceOrderDetails();
        detail.setRoomBookingId(booking.getId());
        detail.setRoomBookingDetailId(booking.getBookingDetailId());
        detail.setRoomId(booking.getRoomId());
        detail.setRoomNameSnapshot(room != null ? room.getName() : booking.getRoomId());
        detail.setServiceId(catalogService.getId());
        detail.setServiceNameSnapshot(catalogService.getName());
        detail.setQuantity(quantity);
        detail.setAmount(quantity);
        detail.setPrice(catalogService.getPrice());
        detail.setDescription(request.getDescription());
        detail.setStatus(ServiceOrderDetailStatus.WAITING);
        detail.setApprovalStatus(currentCustomerOnly && "CUSTOMER_REQUEST".equals(orderMode)
                ? ServiceOrderApprovalStatus.PENDING
                : ServiceOrderApprovalStatus.NOT_REQUIRED);
        detail.setSource(ServiceOrderSource.EXTRA);
        detail.setChargeable(true);
        detail.setPaymentStatus(ServiceOrderPaymentStatus.POST_TO_ROOM);
        detail.setCreatedTime(now);
        detail.setCreatedBy(actor);
        detail.setDeleted(false);

        detail = serviceOrderDetailsRepository.save(detail);
        if (!currentCustomerOnly || "CHECKED_IN".equals(booking.getStatus())) {
            syncBookingTotals(request.getRoomBookingId().trim(), booking);
        }

        return map(detail, request.getRoomBookingId().trim(), catalogService);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_RECEPTIONIST')")
    public List<ServiceOrderDetailResponse> ensureIncludedServices(String roomBookingId) {
        if (roomBookingId == null || roomBookingId.isBlank()) {
            throw new AppException(ErrorCode.INVALID_SERVICE_ORDER_REQUEST);
        }

        RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(roomBookingId.trim());
        if (booking.getBookingDetailId() == null || booking.getBookingDetailId().isBlank()) {
            throw new AppException(ErrorCode.INVALID_SERVICE_ORDER_REQUEST);
        }

        RoomSnapshotResponse room = externalServiceClient.getRoom(booking.getRoomId());
        if (room.getRoomTypeId() == null || room.getRoomTypeId().isBlank()) {
            throw new AppException(ErrorCode.INVALID_SERVICE_ORDER_REQUEST);
        }

        LocalDateTime now = LocalDateTime.now();
        String actor = getCurrentActor();
        List<RoomTypeServiceSnapshotResponse> includedServices =
                externalServiceClient.getIncludedServicesByRoomType(room.getRoomTypeId());

        for (RoomTypeServiceSnapshotResponse includedService : includedServices) {
            if (Boolean.TRUE.equals(includedService.getDeleted())
                    || includedService.getServiceId() == null
                    || includedService.getServiceId().isBlank()
                    || serviceOrderDetailsRepository.existsByRoomBookingIdAndServiceIdAndSourceAndDeletedFalse(
                    booking.getId(),
                    includedService.getServiceId(),
                    ServiceOrderSource.INCLUDED
            )) {
                continue;
            }

            ServiceOrderDetails detail = new ServiceOrderDetails();
            detail.setRoomBookingId(booking.getId());
            detail.setRoomBookingDetailId(booking.getBookingDetailId());
            detail.setRoomId(booking.getRoomId());
            detail.setRoomNameSnapshot(room.getName());
            detail.setServiceId(includedService.getServiceId());
            detail.setServiceNameSnapshot(includedService.getServiceName());
            detail.setQuantity(Math.max(1, includedService.getAmount()));
            detail.setAmount(Math.max(1, includedService.getAmount()));
            detail.setPrice(0);
            detail.setDescription("Dịch vụ kèm theo loại phòng");
            detail.setStatus(ServiceOrderDetailStatus.WAITING);
            detail.setApprovalStatus(ServiceOrderApprovalStatus.NOT_REQUIRED);
            detail.setSource(ServiceOrderSource.INCLUDED);
            detail.setChargeable(false);
            detail.setPaymentStatus(ServiceOrderPaymentStatus.PAID);
            detail.setCreatedTime(now);
            detail.setCreatedBy(actor);
            detail.setDeleted(false);
            serviceOrderDetailsRepository.save(detail);
        }

        return getAll(booking.getId());
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
    @PreAuthorize("hasAuthority('ROLE_HOUSEKEEPING')")
    public ServiceOrderDetailResponse assign(String id) {
        ServiceOrderDetails detail = getRequiredDetail(id);
        if (detail.getApprovalStatus() == ServiceOrderApprovalStatus.PENDING
                || detail.getApprovalStatus() == ServiceOrderApprovalStatus.REJECTED) {
            throw new AppException(ErrorCode.SERVICE_ORDER_PENDING_APPROVAL);
        }

        LocalDateTime now = LocalDateTime.now();
        String actor = getCurrentActor();
        detail.setAssignedTo(actor);
        detail.setAssignedBy(actor);
        detail.setAssignedTime(now);
        detail.setModifiedTime(now);
        detail.setModifiedBy(actor);
        return map(serviceOrderDetailsRepository.save(detail), null, null);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_HOUSEKEEPING')")
    public ServiceOrderDetailResponse markServed(String id) {
        ServiceOrderDetails detail = getRequiredDetail(id);
        if (detail.getApprovalStatus() == ServiceOrderApprovalStatus.PENDING
                || detail.getApprovalStatus() == ServiceOrderApprovalStatus.REJECTED) {
            throw new AppException(ErrorCode.SERVICE_ORDER_PENDING_APPROVAL);
        }
        LocalDateTime now = LocalDateTime.now();
        String actor = getCurrentActor();
        if (detail.getAssignedTime() == null) {
            detail.setAssignedTo(actor);
            detail.setAssignedBy(actor);
            detail.setAssignedTime(now);
        }
        detail.setStatus(ServiceOrderDetailStatus.SERVED);
        detail.setServedTime(now);
        detail.setServedBy(actor);
        detail.setModifiedTime(now);
        detail.setModifiedBy(actor);
        return map(serviceOrderDetailsRepository.save(detail), null, null);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ServiceOrderDetailResponse approve(String id) {
        ServiceOrderDetails detail = getRequiredDetail(id);
        detail.setApprovalStatus(ServiceOrderApprovalStatus.APPROVED);
        detail.setModifiedTime(LocalDateTime.now());
        detail.setModifiedBy(getCurrentActor());
        detail = serviceOrderDetailsRepository.save(detail);
        if (detail.getRoomBookingId() != null && !detail.getRoomBookingId().isBlank()) {
            RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(detail.getRoomBookingId());
            syncBookingTotals(detail.getRoomBookingId(), booking);
        }
        return map(detail, null, null);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ServiceOrderDetailResponse reject(String id) {
        ServiceOrderDetails detail = getRequiredDetail(id);
        detail.setApprovalStatus(ServiceOrderApprovalStatus.REJECTED);
        detail.setModifiedTime(LocalDateTime.now());
        detail.setModifiedBy(getCurrentActor());
        detail = serviceOrderDetailsRepository.save(detail);
        if (detail.getRoomBookingId() != null && !detail.getRoomBookingId().isBlank()) {
            RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(detail.getRoomBookingId());
            syncBookingTotals(detail.getRoomBookingId(), booking);
        }
        return map(detail, null, null);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_RECEPTIONIST')")
    public List<ServiceOrderDetailResponse> markBookingServiceOrdersPaidAtCheckout(
            String roomBookingId,
            ServiceOrderCheckoutPaymentRequest request
    ) {
        if (roomBookingId == null || roomBookingId.isBlank()) {
            throw new AppException(ErrorCode.INVALID_SERVICE_ORDER_REQUEST);
        }

        RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(roomBookingId.trim());
        List<ServiceOrderDetails> unpaidDetails = serviceOrderDetailsRepository
                .findByRoomBookingIdAndPaymentStatusAndDeletedFalseOrderByCreatedTimeDesc(
                        booking.getId(),
                        ServiceOrderPaymentStatus.POST_TO_ROOM
                )
                .stream()
                .filter(detail -> !Boolean.FALSE.equals(detail.getChargeable()))
                .filter(detail -> detail.getSource() == null || detail.getSource() == ServiceOrderSource.EXTRA)
                .filter(detail -> detail.getApprovalStatus() == null
                        || detail.getApprovalStatus() == ServiceOrderApprovalStatus.NOT_REQUIRED
                        || detail.getApprovalStatus() == ServiceOrderApprovalStatus.APPROVED)
                .toList();

        float totalAmount = unpaidDetails.stream()
                .map(detail -> detail.getPrice() * detail.getQuantity())
                .reduce(0F, Float::sum);
        if (totalAmount <= 0) {
            return getAll(booking.getId());
        }

        PaymentCreationRequest paymentRequest = new PaymentCreationRequest();
        paymentRequest.setRoomBookingId(booking.getId());
        paymentRequest.setPaymentMethod(request != null && request.getPaymentMethod() != null
                ? request.getPaymentMethod()
                : PaymentMethod.CASH);
        paymentRequest.setAmount(totalAmount);
        paymentRequest.setNote(request != null && request.getNote() != null && !request.getNote().isBlank()
                ? request.getNote()
                : "Checkout service charges");
        paymentService.createPayment(paymentRequest);

        LocalDateTime now = LocalDateTime.now();
        String actor = getCurrentActor();
        unpaidDetails.forEach(detail -> {
            detail.setPaymentStatus(ServiceOrderPaymentStatus.PAID);
            detail.setPaymentTime(now);
            detail.setPaidBy(actor);
            detail.setModifiedTime(now);
            detail.setModifiedBy(actor);
            serviceOrderDetailsRepository.save(detail);
        });

        return getAll(booking.getId());
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
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
        float totalPrice = Math.max(
                0,
                booking.getTotalRoomPrice()
                        + totalServicePrice
                        + booking.getTotalExtraPrice()
                        - booking.getDiscountAmount()
        );

        externalServiceClient.updateBookingTotals(roomBookingId, RoomBookingTotalsUpdateRequest.builder()
                .totalRoomPrice(booking.getTotalRoomPrice())
                .totalServicePrice(totalServicePrice)
                .totalExtraPrice(booking.getTotalExtraPrice())
                .totalPrice(totalPrice)
                .voucherCode(booking.getVoucherCode())
                .discountAmount(booking.getDiscountAmount())
                .refundStatus(booking.getRefundStatus())
                .refundAmount(booking.getRefundAmount())
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

        boolean bookingCanOrder = List.of("PENDING", "DEPOSITED", "CHECKED_IN").contains(booking.getStatus());
        boolean detailCanOrder = List.of("BOOKED", "CHECKED_IN").contains(booking.getDetailStatus());

        if (!bookingCanOrder || !detailCanOrder) {
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
                .serviceName(catalogService != null ? catalogService.getName() : detail.getServiceNameSnapshot())
                .roomBookingId(roomBookingId != null ? roomBookingId : detail.getRoomBookingId())
                .roomBookingDetailId(detail.getRoomBookingDetailId())
                .roomId(detail.getRoomId())
                .roomName(detail.getRoomNameSnapshot())
                .quantity(detail.getQuantity())
                .amount(detail.getAmount())
                .price(detail.getPrice())
                .totalPrice(Boolean.FALSE.equals(detail.getChargeable()) ? 0 : detail.getPrice() * detail.getQuantity())
                .description(detail.getDescription())
                .status(detail.getStatus())
                .approvalStatus(detail.getApprovalStatus() != null
                        ? detail.getApprovalStatus()
                        : ServiceOrderApprovalStatus.NOT_REQUIRED)
                .source(detail.getSource() != null ? detail.getSource() : ServiceOrderSource.EXTRA)
                .chargeable(detail.getChargeable() != null ? detail.getChargeable() : true)
                .paymentStatus(detail.getPaymentStatus() != null
                        ? detail.getPaymentStatus()
                        : ServiceOrderPaymentStatus.POST_TO_ROOM)
                .paymentRequestId(detail.getPaymentRequestId())
                .paymentTime(detail.getPaymentTime())
                .paidBy(detail.getPaidBy())
                .assignedTo(detail.getAssignedTo())
                .assignedBy(detail.getAssignedBy())
                .assignedTime(detail.getAssignedTime())
                .servedTime(detail.getServedTime())
                .servedBy(detail.getServedBy())
                .createdTime(detail.getCreatedTime())
                .createdBy(detail.getCreatedBy())
                .build();
    }

    private RoomSnapshotResponse loadRoomSafely(String roomId) {
        if (roomId == null || roomId.isBlank()) {
            return null;
        }
        try {
            return externalServiceClient.getRoom(roomId);
        } catch (Exception ignored) {
            return null;
        }
    }
}
