package com.hotelcontinental.billing_service.service.interfaces;

import com.hotelcontinental.billing_service.dto.request.PaymentRequestCreationRequest;
import com.hotelcontinental.billing_service.dto.response.PaymentRequestResponse;

public interface PaymentRequestService {
    PaymentRequestResponse create(PaymentRequestCreationRequest request);

    PaymentRequestResponse get(String id);

    PaymentRequestResponse getLatestByBooking(String roomBookingId);

    PaymentRequestResponse mockPaid(String id);
}
