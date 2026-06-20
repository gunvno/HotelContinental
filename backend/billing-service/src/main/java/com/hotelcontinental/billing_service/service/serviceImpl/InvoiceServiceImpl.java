package com.hotelcontinental.billing_service.service.serviceImpl;

import com.hotelcontinental.billing_service.dto.response.InvoiceResponse;
import com.hotelcontinental.billing_service.dto.response.RoomBookingSnapshotResponse;
import com.hotelcontinental.billing_service.entity.PaymentHistory;
import com.hotelcontinental.billing_service.entity.PaymentRequest;
import com.hotelcontinental.billing_service.enums.PaymentRequestStatus;
import com.hotelcontinental.billing_service.exception.AppException;
import com.hotelcontinental.billing_service.exception.ErrorCode;
import com.hotelcontinental.billing_service.repository.PaymentHistoryRepository;
import com.hotelcontinental.billing_service.repository.PaymentRequestRepository;
import com.hotelcontinental.billing_service.service.interfaces.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {
    private final PaymentHistoryRepository paymentHistoryRepository;
    private final PaymentRequestRepository paymentRequestRepository;
    private final ExternalServiceClient externalServiceClient;

    @Override
    public InvoiceResponse getByBooking(String roomBookingId) {
        if (!StringUtils.hasText(roomBookingId)) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_REQUEST);
        }

        RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(roomBookingId.trim());
        return paymentHistoryRepository
                .findFirstByRoomBookingIdAndDeletedFalseOrderByCreatedTimeDesc(booking.getId())
                .map(payment -> buildFromPaymentHistory(booking, payment))
                .orElseGet(() -> buildFromPaidPaymentRequest(booking));
    }

    private InvoiceResponse buildFromPaymentHistory(RoomBookingSnapshotResponse booking, PaymentHistory payment) {
        return InvoiceResponse.builder()
                .invoiceNo("INV-" + LocalDateTime.now().getYear() + "-" + payment.getId().substring(0, 8).toUpperCase())
                .roomBookingId(booking.getId())
                .paymentId(payment.getId())
                .customerId(booking.getCustomerId())
                .roomId(booking.getRoomId())
                .totalRoomPrice(booking.getTotalRoomPrice())
                .totalServicePrice(booking.getTotalServicePrice())
                .totalExtraPrice(booking.getTotalExtraPrice())
                .voucherCode(booking.getVoucherCode())
                .discountAmount(booking.getDiscountAmount())
                .totalPrice(booking.getTotalPrice())
                .paidAmount(payment.getAmount())
                .remainingAmount(Math.max(0, booking.getTotalPrice() - payment.getAmount()))
                .refundStatus(booking.getRefundStatus())
                .refundAmount(booking.getRefundAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentTime(payment.getPaymentTime())
                .issuedTime(LocalDateTime.now())
                .build();
    }

    private InvoiceResponse buildFromPaidPaymentRequest(RoomBookingSnapshotResponse booking) {
        PaymentRequest paymentRequest = paymentRequestRepository
                .findFirstByRoomBookingIdAndStatusAndDeletedFalseOrderByCreatedTimeDesc(
                        booking.getId(),
                        PaymentRequestStatus.PAID
                )
                .orElseThrow(() -> new AppException(ErrorCode.INVOICE_NOT_FOUND));

        String paymentId = StringUtils.hasText(paymentRequest.getProviderTransactionId())
                ? paymentRequest.getProviderTransactionId()
                : paymentRequest.getId();
        LocalDate paymentTime = paymentRequest.getPaidTime() != null
                ? paymentRequest.getPaidTime().toLocalDate()
                : LocalDate.now();

        return InvoiceResponse.builder()
                .invoiceNo("INV-" + LocalDateTime.now().getYear() + "-" + paymentRequest.getId().substring(0, 8).toUpperCase())
                .roomBookingId(booking.getId())
                .paymentId(paymentId)
                .customerId(booking.getCustomerId())
                .roomId(booking.getRoomId())
                .totalRoomPrice(booking.getTotalRoomPrice())
                .totalServicePrice(booking.getTotalServicePrice())
                .totalExtraPrice(booking.getTotalExtraPrice())
                .voucherCode(booking.getVoucherCode())
                .discountAmount(booking.getDiscountAmount())
                .totalPrice(booking.getTotalPrice())
                .paidAmount(paymentRequest.getAmount())
                .remainingAmount(Math.max(0, booking.getTotalPrice() - paymentRequest.getAmount()))
                .refundStatus(booking.getRefundStatus())
                .refundAmount(booking.getRefundAmount())
                .paymentMethod(paymentRequest.getPaymentMethod())
                .paymentTime(paymentTime)
                .issuedTime(LocalDateTime.now())
                .build();
    }
}
