package com.hotelcontinental.billing_service.service.serviceImpl;

import com.hotelcontinental.billing_service.dto.request.PaymentCreationRequest;
import com.hotelcontinental.billing_service.dto.response.PaymentHistoryResponse;
import com.hotelcontinental.billing_service.entity.PaymentHistory;
import com.hotelcontinental.billing_service.enums.PaymentMethod;
import com.hotelcontinental.billing_service.exception.AppException;
import com.hotelcontinental.billing_service.exception.ErrorCode;
import com.hotelcontinental.billing_service.repository.PaymentHistoryRepository;
import com.hotelcontinental.billing_service.service.interfaces.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentHistoryRepository paymentHistoryRepository;

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
        return paymentHistoryRepository.findByCreatedByAndDeletedFalseOrderByCreatedTimeDesc(getCurrentActor())
                .stream()
                .map(this::map)
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
            throw new AppException(ErrorCode.UNAUTHENTICATED);
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
}
