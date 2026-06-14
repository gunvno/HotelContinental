package com.hotelcontinental.billing_service.service.interfaces;

import com.hotelcontinental.billing_service.dto.request.PaymentRequestCreationRequest;
import com.hotelcontinental.billing_service.dto.request.PayosWebhookRequest;
import com.hotelcontinental.billing_service.dto.response.PaymentRequestResponse;

import java.util.List;

public interface PaymentRequestService {
    PaymentRequestResponse create(PaymentRequestCreationRequest request);

    PaymentRequestResponse get(String id);

    PaymentRequestResponse getLatestByBooking(String roomBookingId);

    List<PaymentRequestResponse> getMyPaymentRequests();

    PaymentRequestResponse mockPaid(String id);

    PaymentRequestResponse handlePayosWebhook(PayosWebhookRequest request);
}
