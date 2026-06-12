package com.hotelcontinental.billing_service.service.interfaces;

import com.hotelcontinental.billing_service.dto.request.ServiceOrderDetailCreationRequest;
import com.hotelcontinental.billing_service.dto.response.ServiceOrderDetailResponse;

import java.util.List;

public interface ServiceOrderDetailService {
    ServiceOrderDetailResponse create(ServiceOrderDetailCreationRequest request);

    List<ServiceOrderDetailResponse> getAll(String roomBookingId);

    ServiceOrderDetailResponse markServed(String id);

    void delete(String id);
}
