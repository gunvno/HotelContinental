package com.hotelcontinental.billing_service.service.serviceImpl;

import com.hotelcontinental.billing_service.dto.response.InvoiceResponse;
import com.hotelcontinental.billing_service.dto.response.RoomBookingSnapshotResponse;
import com.hotelcontinental.billing_service.entity.PaymentHistory;
import com.hotelcontinental.billing_service.exception.AppException;
import com.hotelcontinental.billing_service.exception.ErrorCode;
import com.hotelcontinental.billing_service.repository.PaymentHistoryRepository;
import com.hotelcontinental.billing_service.service.interfaces.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {
    private final PaymentHistoryRepository paymentHistoryRepository;
    private final ExternalServiceClient externalServiceClient;

    @Override
    public InvoiceResponse getByBooking(String roomBookingId) {
        if (!StringUtils.hasText(roomBookingId)) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_REQUEST);
        }

        RoomBookingSnapshotResponse booking = externalServiceClient.getBooking(roomBookingId.trim());
        PaymentHistory payment = paymentHistoryRepository
                .findFirstByRoomBookingIdAndDeletedFalseOrderByCreatedTimeDesc(booking.getId())
                .orElseThrow(() -> new AppException(ErrorCode.INVOICE_NOT_FOUND));

        return InvoiceResponse.builder()
                .invoiceNo("INV-" + LocalDateTime.now().getYear() + "-" + payment.getId().substring(0, 8).toUpperCase())
                .roomBookingId(booking.getId())
                .paymentId(payment.getId())
                .customerId(booking.getCustomerId())
                .roomId(booking.getRoomId())
                .totalRoomPrice(booking.getTotalRoomPrice())
                .totalServicePrice(booking.getTotalServicePrice())
                .totalExtraPrice(booking.getTotalExtraPrice())
                .totalPrice(booking.getTotalPrice())
                .paidAmount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentTime(payment.getPaymentTime())
                .issuedTime(LocalDateTime.now())
                .build();
    }
}
