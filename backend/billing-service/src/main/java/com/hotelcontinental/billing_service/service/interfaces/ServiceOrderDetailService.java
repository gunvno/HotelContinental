package com.hotelcontinental.billing_service.service.interfaces;

import com.hotelcontinental.billing_service.dto.request.ServiceOrderDetailCreationRequest;
import com.hotelcontinental.billing_service.dto.request.ServiceOrderCheckoutPaymentRequest;
import com.hotelcontinental.billing_service.dto.response.ServiceOrderDetailResponse;

import java.util.List;

public interface ServiceOrderDetailService {
    ServiceOrderDetailResponse create(ServiceOrderDetailCreationRequest request);

    ServiceOrderDetailResponse createForCurrentCustomer(ServiceOrderDetailCreationRequest request);

    List<ServiceOrderDetailResponse> ensureIncludedServices(String roomBookingId);

    List<ServiceOrderDetailResponse> getAll(String roomBookingId);

    List<ServiceOrderDetailResponse> getForCurrentCustomer(String roomBookingId);

    ServiceOrderDetailResponse assign(String id);

    ServiceOrderDetailResponse markServed(String id);

    ServiceOrderDetailResponse approve(String id);

    ServiceOrderDetailResponse reject(String id);

    List<ServiceOrderDetailResponse> markBookingServiceOrdersPaidAtCheckout(
            String roomBookingId,
            ServiceOrderCheckoutPaymentRequest request
    );

    void delete(String id);
}
