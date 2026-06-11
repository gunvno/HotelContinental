package com.hotelcontinental.billing_service.service.interfaces;

import com.hotelcontinental.billing_service.dto.request.PaymentCreationRequest;
import com.hotelcontinental.billing_service.dto.response.PaymentHistoryResponse;

import java.util.List;

public interface PaymentService {
    PaymentHistoryResponse createPayment(PaymentCreationRequest request);
    PaymentHistoryResponse getLatestPaymentByBooking(String roomBookingId);
    List<PaymentHistoryResponse> getMyPayments();
}
