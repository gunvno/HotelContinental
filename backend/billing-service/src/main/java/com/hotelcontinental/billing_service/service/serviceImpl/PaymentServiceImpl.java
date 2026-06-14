package com.hotelcontinental.billing_service.service.serviceImpl;

import com.hotelcontinental.billing_service.dto.request.PaymentCreationRequest;
import com.hotelcontinental.billing_service.dto.response.PaymentHistoryResponse;
import com.hotelcontinental.billing_service.dto.response.RoomBookingSnapshotResponse;
import com.hotelcontinental.billing_service.entity.PaymentHistory;
import com.hotelcontinental.billing_service.entity.PaymentRequest;
import com.hotelcontinental.billing_service.enums.PaymentMethod;
import com.hotelcontinental.billing_service.enums.PaymentRequestStatus;
import com.hotelcontinental.billing_service.exception.AppException;
import com.hotelcontinental.billing_service.exception.ErrorCode;
import com.hotelcontinental.billing_service.repository.PaymentHistoryRepository;
import com.hotelcontinental.billing_service.repository.PaymentRequestRepository;
import com.hotelcontinental.billing_service.service.interfaces.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentHistoryRepository paymentHistoryRepository;
    private final PaymentRequestRepository paymentRequestRepository;
    private final ExternalServiceClient externalServiceClient;

    @Transactional
    @Override
    public PaymentHistoryResponse createPayment(PaymentCreationRequest request) {
        validate(request);

        String actor = getCurrentActor();
        LocalDateTime now = LocalDateTime.now();

        PaymentHistory payment = new PaymentHistory();
        payment.setRoomBookingId(request.getRoomBookingId().trim());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setAmount(request.getAmount());
        payment.setPaymentTime(LocalDate.now());
        payment.setNote(request.getNote());
        payment.setCreatedTime(now);
        payment.setCreatedBy(actor);
        payment.setDeleted(false);

        return map(paymentHistoryRepository.save(payment));
    }

    @Override
    public PaymentHistoryResponse getLatestPaymentByBooking(String roomBookingId) {
        if (roomBookingId == null || roomBookingId.isBlank()) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_REQUEST);
        }

        return paymentHistoryRepository
                .findFirstByRoomBookingIdAndDeletedFalseOrderByCreatedTimeDesc(roomBookingId)
                .map(this::map)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
    }

    @Override
    public List<PaymentHistoryResponse> getMyPayments() {
        String currentActor = getCurrentActor();
        List<PaymentHistoryResponse> result = new ArrayList<>();
        Set<String> bookingIdsWithHistory = new HashSet<>();

        List<PaymentHistory> historyPayments = paymentHistoryRepository.findByDeletedFalseOrderByCreatedTimeDesc()
                .stream()
                .filter(payment -> isPaymentOfCustomer(payment, currentActor))
                .toList();

        historyPayments.forEach(payment -> {
            bookingIdsWithHistory.add(payment.getRoomBookingId());
            result.add(map(payment));
        });

        paymentRequestRepository.findByDeletedFalseOrderByCreatedTimeDesc()
                .stream()
                .filter(request -> !bookingIdsWithHistory.contains(request.getRoomBookingId()))
                .filter(request -> isRequestPaidOrBookingPaid(request, currentActor))
                .map(this::map)
                .forEach(result::add);

        return result.stream()
                .sorted(Comparator.comparing(
                        PaymentHistoryResponse::getCreatedTime,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .toList();
    }

    @Override
    @PreAuthorize("hasAuthority('REVENUE_VIEW')")
    public List<PaymentHistoryResponse> getAllPayments() {
        return paymentHistoryRepository.findByDeletedFalseOrderByCreatedTimeDesc()
                .stream()
                .map(this::map)
                .toList();
    }

    private void validate(PaymentCreationRequest request) {
        if (request == null || request.getRoomBookingId() == null || request.getRoomBookingId().isBlank()
                || request.getAmount() <= 0) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_REQUEST);
        }

        if (request.getPaymentMethod() == null) {
            request.setPaymentMethod(PaymentMethod.ONLINE_PAYMENT);
        }
    }

    private String getCurrentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "payos-webhook";
        }
        return authentication.getName();
    }

    private PaymentHistoryResponse map(PaymentHistory payment) {
        return PaymentHistoryResponse.builder()
                .id(payment.getId())
                .roomBookingId(payment.getRoomBookingId())
                .paymentMethod(payment.getPaymentMethod())
                .amount(payment.getAmount())
                .paymentTime(payment.getPaymentTime())
                .note(payment.getNote())
                .createdTime(payment.getCreatedTime())
                .build();
    }

    private PaymentHistoryResponse map(PaymentRequest paymentRequest) {
        LocalDateTime paidTime = paymentRequest.getPaidTime() != null
                ? paymentRequest.getPaidTime()
                : paymentRequest.getModifiedTime();
        LocalDate paymentTime = paidTime != null
                ? paidTime.toLocalDate()
                : LocalDate.now();

        return PaymentHistoryResponse.builder()
                .id(paymentRequest.getProviderTransactionId() != null
                        ? paymentRequest.getProviderTransactionId()
                        : paymentRequest.getId())
                .roomBookingId(paymentRequest.getRoomBookingId())
                .paymentMethod(paymentRequest.getPaymentMethod())
                .amount(paymentRequest.getAmount())
                .paymentTime(paymentTime)
                .note("PayOS payment request")
                .createdTime(paidTime != null ? paidTime : paymentRequest.getCreatedTime())
                .build();
    }

    private boolean isPaymentOfCustomer(PaymentHistory payment, String customerId) {
        try {
            return customerId.equals(externalServiceClient.getBooking(payment.getRoomBookingId()).getCustomerId());
        } catch (Exception ignored) {
            return customerId.equals(payment.getCreatedBy());
        }
    }

    private boolean isRequestPaidOrBookingPaid(PaymentRequest request, String customerId) {
        try {
            RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(request.getRoomBookingId());
            if (!customerId.equals(booking.getCustomerId())) {
                return false;
            }

            return request.getStatus() == PaymentRequestStatus.PAID
                    || List.of("DEPOSITED", "CHECKED_IN", "DONE").contains(booking.getStatus());
        } catch (Exception ignored) {
            return customerId.equals(request.getCreatedBy())
                    && request.getStatus() == PaymentRequestStatus.PAID;
        }
    }
}
