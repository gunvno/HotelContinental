package com.hotelcontinental.billing_service.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid message key", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_PAYMENT_REQUEST(1011, "Invalid payment request", HttpStatus.BAD_REQUEST),
    PAYMENT_NOT_FOUND(1012, "Payment not found", HttpStatus.NOT_FOUND),
    PAYMENT_REQUEST_NOT_FOUND(1013, "Payment request not found", HttpStatus.NOT_FOUND),
    PAYMENT_REQUEST_ALREADY_PAID(1014, "Payment request already paid", HttpStatus.BAD_REQUEST),
    INVOICE_NOT_FOUND(1015, "Invoice not found", HttpStatus.NOT_FOUND),
    INVALID_SERVICE_ORDER_REQUEST(1020, "Invalid service order request", HttpStatus.BAD_REQUEST),
    SERVICE_ORDER_NOT_FOUND(1021, "Service order not found", HttpStatus.NOT_FOUND),
    BOOKING_SYNC_FAILED(1022, "Cannot sync booking totals", HttpStatus.BAD_GATEWAY),
    CATALOG_SERVICE_NOT_FOUND(1023, "Catalog service not found", HttpStatus.BAD_REQUEST),
    SERVICE_ORDER_BOOKING_FORBIDDEN(1024, "You cannot order service for this booking", HttpStatus.FORBIDDEN),
    BOOKING_NOT_AVAILABLE_FOR_SERVICE_ORDER(1025, "Booking is not checked in", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
