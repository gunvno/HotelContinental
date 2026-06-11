package com.hotelcontinental.promotion_service.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid message key", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_VOUCHER_REQUEST(1011, "Invalid voucher request", HttpStatus.BAD_REQUEST),
    VOUCHER_NOT_FOUND(1012, "Voucher not found", HttpStatus.NOT_FOUND),
    VOUCHER_EXPIRED(1013, "Voucher is not available", HttpStatus.BAD_REQUEST),
    VOUCHER_ALREADY_USED(1014, "Voucher has already been used", HttpStatus.CONFLICT),
    VOUCHER_CODE_EXISTED(1015, "Voucher code already exists", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
