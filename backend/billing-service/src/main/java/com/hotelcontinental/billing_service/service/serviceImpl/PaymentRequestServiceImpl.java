package com.hotelcontinental.billing_service.service.serviceImpl;

import com.hotelcontinental.billing_service.dto.request.PaymentCreationRequest;
import com.hotelcontinental.billing_service.dto.request.PaymentRequestCreationRequest;
import com.hotelcontinental.billing_service.dto.request.PayosWebhookRequest;
import com.hotelcontinental.billing_service.dto.request.RoomBookingTotalsUpdateRequest;
import com.hotelcontinental.billing_service.dto.response.PayosPaymentLinkResponse;
import com.hotelcontinental.billing_service.dto.response.PaymentRequestResponse;
import com.hotelcontinental.billing_service.dto.response.RoomBookingSnapshotResponse;
import com.hotelcontinental.billing_service.entity.PaymentRequest;
import com.hotelcontinental.billing_service.entity.ServiceOrderDetails;
import com.hotelcontinental.billing_service.enums.PaymentMethod;
import com.hotelcontinental.billing_service.enums.PaymentRequestPurpose;
import com.hotelcontinental.billing_service.enums.PaymentRequestStatus;
import com.hotelcontinental.billing_service.enums.ServiceOrderApprovalStatus;
import com.hotelcontinental.billing_service.enums.ServiceOrderPaymentStatus;
import com.hotelcontinental.billing_service.exception.AppException;
import com.hotelcontinental.billing_service.exception.ErrorCode;
import com.hotelcontinental.billing_service.repository.PaymentRequestRepository;
import com.hotelcontinental.billing_service.repository.ServiceOrderDetailsRepository;
import com.hotelcontinental.billing_service.service.interfaces.PaymentRequestService;
import com.hotelcontinental.billing_service.service.interfaces.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentRequestServiceImpl implements PaymentRequestService {
    private static final String BANK_NAME = "MB Bank";
    private static final String BANK_ACCOUNT_NO = "0386404269";
    private static final String BANK_ACCOUNT_NAME = "TA VAN LONG";
    private static final int PENDING_PAYMENT_EXPIRATION_HOURS = 24;

    private final PaymentRequestRepository paymentRequestRepository;
    private final ServiceOrderDetailsRepository serviceOrderDetailsRepository;
    private final ExternalServiceClient externalServiceClient;
    private final PaymentService paymentService;
    private final PayosClient payosClient;

    @Override
    @Transactional
    public PaymentRequestResponse create(PaymentRequestCreationRequest request) {
        validateCreationRequest(request);
        PaymentRequestPurpose purpose = parsePurpose(request.getPurpose());
        ServiceOrderDetails serviceOrder = purpose == PaymentRequestPurpose.SERVICE_ORDER
                ? getPayableServiceOrder(request.getServiceOrderId())
                : null;
        String roomBookingId = serviceOrder != null
                ? serviceOrder.getRoomBookingId()
                : request.getRoomBookingId().trim();
        RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(roomBookingId);
        validateBookingAccess(booking);
        float amount = purpose == PaymentRequestPurpose.SERVICE_ORDER
                ? serviceOrder.getPrice() * serviceOrder.getQuantity()
                : request.getAmount();

        var existingPending = purpose == PaymentRequestPurpose.SERVICE_ORDER
                ? paymentRequestRepository
                .findFirstByServiceOrderIdAndStatusAndDeletedFalseOrderByCreatedTimeDesc(
                        serviceOrder.getId(),
                        PaymentRequestStatus.PENDING
                )
                : paymentRequestRepository
                .findFirstByRoomBookingIdAndPurposeAndStatusAndDeletedFalseOrderByCreatedTimeDesc(
                        booking.getId(),
                        purpose,
                        PaymentRequestStatus.PENDING
                );
        if (existingPending.isPresent()) {
            return map(attachPayosLinkIfNeeded(existingPending.get()));
        }

        LocalDateTime now = LocalDateTime.now();
        long orderCode = System.currentTimeMillis();
        String transferContent = "BK" + orderCode;
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setRoomBookingId(booking.getId());
        paymentRequest.setPurpose(purpose);
        paymentRequest.setServiceOrderId(serviceOrder != null ? serviceOrder.getId() : null);
        paymentRequest.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        paymentRequest.setAmount(amount);
        paymentRequest.setBankName(BANK_NAME);
        paymentRequest.setBankAccountNo(BANK_ACCOUNT_NO);
        paymentRequest.setBankAccountName(BANK_ACCOUNT_NAME);
        paymentRequest.setTransferContent(transferContent);
        paymentRequest.setStatus(PaymentRequestStatus.PENDING);
        paymentRequest.setProviderOrderCode(orderCode);
        paymentRequest.setExpiredTime(now.plusHours(PENDING_PAYMENT_EXPIRATION_HOURS));
        paymentRequest.setCreatedTime(now);
        paymentRequest.setCreatedBy(getCurrentActor());
        paymentRequest.setDeleted(false);

        paymentRequest = paymentRequestRepository.save(paymentRequest);
        if (serviceOrder != null) {
            serviceOrder.setPaymentStatus(ServiceOrderPaymentStatus.PENDING_PAYMENT);
            serviceOrder.setPaymentRequestId(paymentRequest.getId());
            serviceOrder.setModifiedTime(now);
            serviceOrder.setModifiedBy(getCurrentActor());
            serviceOrderDetailsRepository.save(serviceOrder);
        }
        paymentRequest = attachPayosLinkIfNeeded(paymentRequest);

        return map(paymentRequest);
    }

    @Override
    @Transactional
    public PaymentRequestResponse get(String id) {
        PaymentRequest paymentRequest = getRequiredPaymentRequest(id);
        RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(paymentRequest.getRoomBookingId());
        validateBookingAccess(booking);
        paymentRequest = reconcilePaidBooking(paymentRequest, booking);
        paymentRequest = attachPayosLinkIfNeeded(paymentRequest);
        paymentRequest = refreshPayosStatus(paymentRequest);
        return map(paymentRequest);
    }

    @Override
    @Transactional
    public PaymentRequestResponse getLatestByBooking(String roomBookingId) {
        if (!StringUtils.hasText(roomBookingId)) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_REQUEST);
        }

        RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(roomBookingId.trim());
        validateBookingAccess(booking);

        return paymentRequestRepository.findFirstByRoomBookingIdAndPurposeAndDeletedFalseOrderByCreatedTimeDesc(
                        booking.getId(),
                        PaymentRequestPurpose.ROOM_BOOKING
                )
                .or(() -> paymentRequestRepository.findFirstByRoomBookingIdAndDeletedFalseOrderByCreatedTimeDesc(booking.getId()))
                .map(paymentRequest -> reconcilePaidBooking(paymentRequest, booking))
                .map(this::attachPayosLinkIfNeeded)
                .map(this::refreshPayosStatus)
                .map(this::map)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_REQUEST_NOT_FOUND));
    }

    @Override
    @Transactional
    public List<PaymentRequestResponse> getMyPaymentRequests() {
        String actor = getCurrentActor();
        return paymentRequestRepository.findByCreatedByAndDeletedFalseOrderByCreatedTimeDesc(actor)
                .stream()
                .map(this::refreshBeforeList)
                .map(this::map)
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('ROLE_RECEPTIONIST')")
    public PaymentRequestResponse mockPaid(String id) {
        PaymentRequest paymentRequest = getRequiredPaymentRequest(id);
        if (paymentRequest.getStatus() == PaymentRequestStatus.PAID) {
            throw new AppException(ErrorCode.PAYMENT_REQUEST_ALREADY_PAID);
        }

        return markAsPaid(
                paymentRequest,
                "MOCK-" + paymentRequest.getId(),
                "Mock bank transfer confirmation - " + paymentRequest.getTransferContent()
        );
    }

    @Override
    @Transactional
    public PaymentRequestResponse handlePayosWebhook(PayosWebhookRequest request) {
        if (!payosClient.verifyWebhook(request) || request.getData() == null) {
            throw new AppException(ErrorCode.INVALID_PAYOS_WEBHOOK);
        }

        Long orderCode = asLong(request.getData().get("orderCode"));
        if (orderCode == null) {
            throw new AppException(ErrorCode.INVALID_PAYOS_WEBHOOK);
        }

        PaymentRequest paymentRequest = paymentRequestRepository
                .findFirstByProviderOrderCodeAndDeletedFalse(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_REQUEST_NOT_FOUND));

        if (paymentRequest.getStatus() == PaymentRequestStatus.PAID) {
            return map(paymentRequest);
        }

        Integer paidAmount = asInteger(request.getData().get("amount"));
        if (paidAmount == null || Math.round(paymentRequest.getAmount()) != paidAmount) {
            throw new AppException(ErrorCode.INVALID_PAYOS_WEBHOOK);
        }

        String reference = asString(request.getData().get("reference"));
        if (!StringUtils.hasText(reference)) {
            reference = asString(request.getData().get("paymentLinkId"));
        }
        if (!StringUtils.hasText(reference)) {
            reference = "PAYOS-" + orderCode;
        }

        return markAsPaid(
                paymentRequest,
                reference,
                "PayOS webhook confirmation - " + paymentRequest.getTransferContent()
        );
    }

    private PaymentRequest getRequiredPaymentRequest(String id) {
        if (!StringUtils.hasText(id)) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_REQUEST);
        }
        return paymentRequestRepository.findById(id)
                .filter(request -> !Boolean.TRUE.equals(request.getDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_REQUEST_NOT_FOUND));
    }

    @Scheduled(
            initialDelayString = "${app.payment-request-expiration-initial-delay-ms:60000}",
            fixedDelayString = "${app.payment-request-expiration-delay-ms:600000}"
    )
    @Transactional
    public void expirePendingPaymentRequests() {
        LocalDateTime now = LocalDateTime.now();
        paymentRequestRepository
                .findByStatusAndExpiredTimeBeforeAndDeletedFalse(PaymentRequestStatus.PENDING, now)
                .forEach(paymentRequest -> {
                    paymentRequest.setStatus(PaymentRequestStatus.EXPIRED);
                    paymentRequest.setModifiedTime(now);
                    paymentRequest.setModifiedBy("system-expired-payment");
                    paymentRequestRepository.save(paymentRequest);
                });
    }

    private void validateCreationRequest(PaymentRequestCreationRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_REQUEST);
        }
        PaymentRequestPurpose purpose = parsePurpose(request.getPurpose());
        if (purpose == PaymentRequestPurpose.SERVICE_ORDER) {
            if (!StringUtils.hasText(request.getServiceOrderId())) {
                throw new AppException(ErrorCode.INVALID_PAYMENT_REQUEST);
            }
            return;
        }
        if (!StringUtils.hasText(request.getRoomBookingId()) || request.getAmount() <= 0) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_REQUEST);
        }
    }

    private PaymentRequestPurpose parsePurpose(String purpose) {
        if (!StringUtils.hasText(purpose)) {
            return PaymentRequestPurpose.ROOM_BOOKING;
        }
        try {
            return PaymentRequestPurpose.valueOf(purpose.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_REQUEST);
        }
    }

    private ServiceOrderDetails getPayableServiceOrder(String serviceOrderId) {
        if (!StringUtils.hasText(serviceOrderId)) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_REQUEST);
        }

        ServiceOrderDetails serviceOrder = serviceOrderDetailsRepository.findById(serviceOrderId.trim())
                .filter(detail -> !Boolean.TRUE.equals(detail.getDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_ORDER_NOT_FOUND));

        if (Boolean.FALSE.equals(serviceOrder.getChargeable())
                || serviceOrder.getPrice() * serviceOrder.getQuantity() <= 0
                || serviceOrder.getPaymentStatus() == ServiceOrderPaymentStatus.PAID) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_REQUEST);
        }
        if (serviceOrder.getApprovalStatus() == ServiceOrderApprovalStatus.PENDING
                || serviceOrder.getApprovalStatus() == ServiceOrderApprovalStatus.REJECTED) {
            throw new AppException(ErrorCode.SERVICE_ORDER_PENDING_APPROVAL);
        }
        return serviceOrder;
    }

    private void validateBookingAccess(RoomBookingSnapshotResponse booking) {
        if (canAccessAdminPortal()) {
            return;
        }
        if (booking == null || booking.getCustomerId() == null || !booking.getCustomerId().equals(getCurrentActor())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private boolean canAccessAdminPortal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ADMIN_PORTAL_ACCESS"::equals);
    }

    private PaymentRequestResponse markAsPaid(PaymentRequest paymentRequest, String providerTransactionId, String note) {
        PaymentCreationRequest paymentCreationRequest = new PaymentCreationRequest();
        paymentCreationRequest.setRoomBookingId(paymentRequest.getRoomBookingId());
        paymentCreationRequest.setPaymentMethod(paymentRequest.getPaymentMethod());
        paymentCreationRequest.setAmount(paymentRequest.getAmount());
        paymentCreationRequest.setNote(note);
        paymentService.createPayment(paymentCreationRequest);

        if (paymentRequest.getPurpose() == PaymentRequestPurpose.SERVICE_ORDER) {
            markServiceOrderPaid(paymentRequest);
        } else {
            externalServiceClient.markBookingDeposited(paymentRequest.getRoomBookingId());
        }

        LocalDateTime now = LocalDateTime.now();
        paymentRequest.setStatus(PaymentRequestStatus.PAID);
        paymentRequest.setPaidTime(now);
        paymentRequest.setProviderTransactionId(providerTransactionId);
        paymentRequest.setModifiedTime(now);
        paymentRequest.setModifiedBy(getCurrentActorOrSystem());
        return map(paymentRequestRepository.save(paymentRequest));
    }

    private void markServiceOrderPaid(PaymentRequest paymentRequest) {
        if (!StringUtils.hasText(paymentRequest.getServiceOrderId())) {
            return;
        }

        serviceOrderDetailsRepository.findById(paymentRequest.getServiceOrderId())
                .filter(detail -> !Boolean.TRUE.equals(detail.getDeleted()))
                .ifPresent(detail -> {
                    LocalDateTime now = LocalDateTime.now();
                    detail.setPaymentStatus(ServiceOrderPaymentStatus.PAID);
                    detail.setPaymentRequestId(paymentRequest.getId());
                    detail.setPaymentTime(now);
                    detail.setPaidBy(getCurrentActorOrSystem());
                    detail.setModifiedTime(now);
                    detail.setModifiedBy(getCurrentActorOrSystem());
                    serviceOrderDetailsRepository.save(detail);
                    syncBookingTotals(detail.getRoomBookingId());
                });
    }

    private void syncBookingTotals(String roomBookingId) {
        if (!StringUtils.hasText(roomBookingId)) {
            return;
        }

        RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(roomBookingId);
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

    private PaymentRequest refreshPayosStatus(PaymentRequest paymentRequest) {
        if (paymentRequest.getStatus() != PaymentRequestStatus.PENDING
                || !"PAYOS".equalsIgnoreCase(paymentRequest.getProvider())
                || paymentRequest.getProviderOrderCode() == null) {
            return paymentRequest;
        }

        PayosPaymentLinkResponse payosPaymentLink;
        try {
            payosPaymentLink = payosClient.getPaymentLink(paymentRequest.getProviderOrderCode());
        } catch (Exception exception) {
            return paymentRequest;
        }

        if (payosPaymentLink == null || !StringUtils.hasText(payosPaymentLink.getStatus())) {
            return paymentRequest;
        }

        String status = payosPaymentLink.getStatus().trim().toUpperCase();
        if ("PAID".equals(status)) {
            markAsPaid(
                    paymentRequest,
                    "PAYOS-" + paymentRequest.getProviderOrderCode(),
                    "PayOS status refresh - " + paymentRequest.getTransferContent()
            );
            return getRequiredPaymentRequest(paymentRequest.getId());
        }

        if ("EXPIRED".equals(status)) {
            paymentRequest.setStatus(PaymentRequestStatus.EXPIRED);
            paymentRequest.setModifiedTime(LocalDateTime.now());
            paymentRequest.setModifiedBy(getCurrentActorOrSystem());
            return paymentRequestRepository.save(paymentRequest);
        }

        if ("CANCELLED".equals(status) || "CANCELED".equals(status)) {
            paymentRequest.setStatus(PaymentRequestStatus.FAILED);
            paymentRequest.setModifiedTime(LocalDateTime.now());
            paymentRequest.setModifiedBy(getCurrentActorOrSystem());
            return paymentRequestRepository.save(paymentRequest);
        }

        return paymentRequest;
    }

    private PaymentRequest refreshBeforeList(PaymentRequest paymentRequest) {
        try {
            RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(paymentRequest.getRoomBookingId());
            paymentRequest = reconcilePaidBooking(paymentRequest, booking);
        } catch (Exception ignored) {
            // Keep the list available even if booking-service is temporarily unavailable.
        }

        paymentRequest = attachPayosLinkIfNeeded(paymentRequest);
        return refreshPayosStatus(paymentRequest);
    }

    private PaymentRequest attachPayosLinkIfNeeded(PaymentRequest paymentRequest) {
        if (paymentRequest.getStatus() != PaymentRequestStatus.PENDING
                || !payosClient.configured()
                || StringUtils.hasText(paymentRequest.getProviderQrCode())) {
            return paymentRequest;
        }

        Long orderCode = paymentRequest.getProviderOrderCode();
        if (orderCode == null) {
            orderCode = extractOrderCode(paymentRequest.getTransferContent());
        }
        if (orderCode == null) {
            orderCode = System.currentTimeMillis();
            paymentRequest.setProviderOrderCode(orderCode);
            paymentRequest.setTransferContent("BK" + orderCode);
            paymentRequest = paymentRequestRepository.save(paymentRequest);
        }

        String transferContent = StringUtils.hasText(paymentRequest.getTransferContent())
                ? paymentRequest.getTransferContent()
                : "BK" + orderCode;

        try {
            PayosPaymentLinkResponse payosPaymentLink;
            try {
                payosPaymentLink = payosClient.getPaymentLink(orderCode);
            } catch (RuntimeException ignored) {
                payosPaymentLink = payosClient.createPaymentLink(
                        orderCode,
                        Math.round(paymentRequest.getAmount()),
                        transferContent
                );
            }

            paymentRequest.setProvider("PAYOS");
            paymentRequest.setProviderOrderCode(orderCode);
            paymentRequest.setProviderPaymentLinkId(payosPaymentLink.getPaymentLinkId());
            paymentRequest.setProviderCheckoutUrl(payosPaymentLink.getCheckoutUrl());
            paymentRequest.setProviderQrCode(payosPaymentLink.getQrCode());
            if (StringUtils.hasText(payosPaymentLink.getDescription())) {
                paymentRequest.setTransferContent(payosPaymentLink.getDescription());
            }
            return paymentRequestRepository.save(paymentRequest);
        } catch (RuntimeException exception) {
            log.warn("Could not attach PayOS link to payment request {}: {}", paymentRequest.getId(), exception.getMessage());
            return paymentRequest;
        }
    }

    private Long extractOrderCode(String transferContent) {
        if (!StringUtils.hasText(transferContent)) {
            return null;
        }
        String digits = transferContent.trim().replaceFirst("^BK", "");
        try {
            return Long.parseLong(digits);
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private PaymentRequest reconcilePaidBooking(
            PaymentRequest paymentRequest,
            RoomBookingSnapshotResponse booking
    ) {
        if (paymentRequest.getPurpose() == PaymentRequestPurpose.SERVICE_ORDER
                || paymentRequest.getStatus() != PaymentRequestStatus.PENDING
                || booking == null
                || !List.of("DEPOSITED", "CHECKED_IN", "DONE").contains(booking.getStatus())) {
            return paymentRequest;
        }

        String providerTransactionId = "SYNC-" + paymentRequest.getId();
        try {
            providerTransactionId = paymentService
                    .getLatestPaymentByBooking(paymentRequest.getRoomBookingId())
                    .getId();
        } catch (Exception ignored) {
            // Booking already confirms money was received. Keep the request consistent with booking state.
        }

        LocalDateTime now = LocalDateTime.now();
        paymentRequest.setStatus(PaymentRequestStatus.PAID);
        paymentRequest.setPaidTime(now);
        paymentRequest.setProviderTransactionId(providerTransactionId);
        paymentRequest.setModifiedTime(now);
        paymentRequest.setModifiedBy(getCurrentActorOrSystem());
        return paymentRequestRepository.save(paymentRequest);
    }

    private String getCurrentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return authentication.getName();
    }

    private String getCurrentActorOrSystem() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "payos-webhook";
        }
        return authentication.getName();
    }

    private Long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text && StringUtils.hasText(text)) {
            try {
                return Long.parseLong(text);
            } catch (NumberFormatException exception) {
                return null;
            }
        }
        return null;
    }

    private Integer asInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text && StringUtils.hasText(text)) {
            try {
                return Integer.parseInt(text);
            } catch (NumberFormatException exception) {
                return null;
            }
        }
        return null;
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private PaymentRequestResponse map(PaymentRequest paymentRequest) {
        return PaymentRequestResponse.builder()
                .id(paymentRequest.getId())
                .roomBookingId(paymentRequest.getRoomBookingId())
                .purpose(paymentRequest.getPurpose() != null
                        ? paymentRequest.getPurpose()
                        : PaymentRequestPurpose.ROOM_BOOKING)
                .serviceOrderId(paymentRequest.getServiceOrderId())
                .paymentMethod(paymentRequest.getPaymentMethod())
                .amount(paymentRequest.getAmount())
                .bankAccountNo(paymentRequest.getBankAccountNo())
                .bankAccountName(paymentRequest.getBankAccountName())
                .bankName(paymentRequest.getBankName())
                .transferContent(paymentRequest.getTransferContent())
                .status(paymentRequest.getStatus())
                .providerTransactionId(paymentRequest.getProviderTransactionId())
                .provider(paymentRequest.getProvider())
                .providerOrderCode(paymentRequest.getProviderOrderCode())
                .providerPaymentLinkId(paymentRequest.getProviderPaymentLinkId())
                .providerCheckoutUrl(paymentRequest.getProviderCheckoutUrl())
                .providerQrCode(paymentRequest.getProviderQrCode())
                .paidTime(paymentRequest.getPaidTime())
                .expiredTime(paymentRequest.getExpiredTime())
                .createdTime(paymentRequest.getCreatedTime())
                .build();
    }
}
