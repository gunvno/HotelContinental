package com.hotelcontinental.billing_service.service.serviceImpl;

import com.hotelcontinental.billing_service.dto.request.PaymentCreationRequest;
import com.hotelcontinental.billing_service.dto.request.PaymentRequestCreationRequest;
import com.hotelcontinental.billing_service.dto.response.PaymentRequestResponse;
import com.hotelcontinental.billing_service.dto.response.RoomBookingSnapshotResponse;
import com.hotelcontinental.billing_service.entity.PaymentRequest;
import com.hotelcontinental.billing_service.enums.PaymentMethod;
import com.hotelcontinental.billing_service.enums.PaymentRequestStatus;
import com.hotelcontinental.billing_service.exception.AppException;
import com.hotelcontinental.billing_service.exception.ErrorCode;
import com.hotelcontinental.billing_service.repository.PaymentRequestRepository;
import com.hotelcontinental.billing_service.service.interfaces.PaymentRequestService;
import com.hotelcontinental.billing_service.service.interfaces.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentRequestServiceImpl implements PaymentRequestService {
    private static final String BANK_NAME = "MB Bank";
    private static final String BANK_ACCOUNT_NO = "0386404269";
    private static final String BANK_ACCOUNT_NAME = "TA VAN LONG";

    private final PaymentRequestRepository paymentRequestRepository;
    private final ExternalServiceClient externalServiceClient;
    private final PaymentService paymentService;

    @Override
    @Transactional
    public PaymentRequestResponse create(PaymentRequestCreationRequest request) {
        validateCreationRequest(request);
        RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(request.getRoomBookingId().trim());
        validateBookingAccess(booking);

        var existingPending = paymentRequestRepository
                .findFirstByRoomBookingIdAndStatusAndDeletedFalseOrderByCreatedTimeDesc(
                        booking.getId(),
                        PaymentRequestStatus.PENDING
                );
        if (existingPending.isPresent()) {
            return map(existingPending.get());
        }

        LocalDateTime now = LocalDateTime.now();
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setRoomBookingId(booking.getId());
        paymentRequest.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        paymentRequest.setAmount(request.getAmount());
        paymentRequest.setBankName(BANK_NAME);
        paymentRequest.setBankAccountNo(BANK_ACCOUNT_NO);
        paymentRequest.setBankAccountName(BANK_ACCOUNT_NAME);
        paymentRequest.setTransferContent("BOOKING " + booking.getId());
        paymentRequest.setStatus(PaymentRequestStatus.PENDING);
        paymentRequest.setExpiredTime(now.plusMinutes(15));
        paymentRequest.setCreatedTime(now);
        paymentRequest.setCreatedBy(getCurrentActor());
        paymentRequest.setDeleted(false);

        return map(paymentRequestRepository.save(paymentRequest));
    }

    @Override
    public PaymentRequestResponse get(String id) {
        PaymentRequest paymentRequest = getRequiredPaymentRequest(id);
        validateBookingAccess(externalServiceClient.getBooking(paymentRequest.getRoomBookingId()));
        return map(paymentRequest);
    }

    @Override
    public PaymentRequestResponse getLatestByBooking(String roomBookingId) {
        if (!StringUtils.hasText(roomBookingId)) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_REQUEST);
        }

        RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(roomBookingId.trim());
        validateBookingAccess(booking);

        return paymentRequestRepository.findFirstByRoomBookingIdAndDeletedFalseOrderByCreatedTimeDesc(booking.getId())
                .map(this::map)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_REQUEST_NOT_FOUND));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('PAYMENT_CONFIRM')")
    public PaymentRequestResponse mockPaid(String id) {
        PaymentRequest paymentRequest = getRequiredPaymentRequest(id);
        if (paymentRequest.getStatus() == PaymentRequestStatus.PAID) {
            throw new AppException(ErrorCode.PAYMENT_REQUEST_ALREADY_PAID);
        }

        PaymentCreationRequest paymentCreationRequest = new PaymentCreationRequest();
        paymentCreationRequest.setRoomBookingId(paymentRequest.getRoomBookingId());
        paymentCreationRequest.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        paymentCreationRequest.setAmount(paymentRequest.getAmount());
        paymentCreationRequest.setNote("Mock bank transfer confirmation - " + paymentRequest.getTransferContent());
        paymentService.createPayment(paymentCreationRequest);
        externalServiceClient.markBookingDeposited(paymentRequest.getRoomBookingId());

        LocalDateTime now = LocalDateTime.now();
        paymentRequest.setStatus(PaymentRequestStatus.PAID);
        paymentRequest.setPaidTime(now);
        paymentRequest.setProviderTransactionId("MOCK-" + paymentRequest.getId());
        paymentRequest.setModifiedTime(now);
        paymentRequest.setModifiedBy(getCurrentActor());
        return map(paymentRequestRepository.save(paymentRequest));
    }

    private PaymentRequest getRequiredPaymentRequest(String id) {
        if (!StringUtils.hasText(id)) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_REQUEST);
        }
        return paymentRequestRepository.findById(id)
                .filter(request -> !Boolean.TRUE.equals(request.getDeleted()))
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_REQUEST_NOT_FOUND));
    }

    private void validateCreationRequest(PaymentRequestCreationRequest request) {
        if (request == null || !StringUtils.hasText(request.getRoomBookingId()) || request.getAmount() <= 0) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_REQUEST);
        }
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

    private String getCurrentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return authentication.getName();
    }

    private PaymentRequestResponse map(PaymentRequest paymentRequest) {
        return PaymentRequestResponse.builder()
                .id(paymentRequest.getId())
                .roomBookingId(paymentRequest.getRoomBookingId())
                .paymentMethod(paymentRequest.getPaymentMethod())
                .amount(paymentRequest.getAmount())
                .bankAccountNo(paymentRequest.getBankAccountNo())
                .bankAccountName(paymentRequest.getBankAccountName())
                .bankName(paymentRequest.getBankName())
                .transferContent(paymentRequest.getTransferContent())
                .status(paymentRequest.getStatus())
                .providerTransactionId(paymentRequest.getProviderTransactionId())
                .paidTime(paymentRequest.getPaidTime())
                .expiredTime(paymentRequest.getExpiredTime())
                .createdTime(paymentRequest.getCreatedTime())
                .build();
    }
}
