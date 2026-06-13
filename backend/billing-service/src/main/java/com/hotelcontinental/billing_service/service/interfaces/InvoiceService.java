package com.hotelcontinental.billing_service.service.interfaces;

import com.hotelcontinental.billing_service.dto.response.InvoiceResponse;

public interface InvoiceService {
    InvoiceResponse getByBooking(String roomBookingId);
}
