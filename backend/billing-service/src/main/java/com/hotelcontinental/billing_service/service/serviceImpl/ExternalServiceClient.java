package com.hotelcontinental.billing_service.service.serviceImpl;

import com.hotelcontinental.billing_service.dto.ApiResponse;
import com.hotelcontinental.billing_service.dto.request.RoomBookingTotalsUpdateRequest;
import com.hotelcontinental.billing_service.dto.response.CatalogServiceSnapshotResponse;
import com.hotelcontinental.billing_service.dto.response.RoomBookingSnapshotResponse;
import com.hotelcontinental.billing_service.exception.AppException;
import com.hotelcontinental.billing_service.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class ExternalServiceClient {
    private final RestClient.Builder restClientBuilder;

    @Value("${app.services.booking:http://localhost:8082/booking}")
    private String bookingServiceUrl;

    @Value("${app.services.catalog:http://localhost:8083/catalog}")
    private String catalogServiceUrl;

    public RoomBookingSnapshotResponse getBooking(String roomBookingId) {
        ApiResponse<RoomBookingSnapshotResponse> response = restClientBuilder.baseUrl(bookingServiceUrl).build()
                .get()
                .uri("/room-bookings/{id}", roomBookingId)
                .header("Authorization", bearerHeader())
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (response == null || response.getResult() == null) {
            throw new AppException(ErrorCode.BOOKING_SYNC_FAILED);
        }

        return response.getResult();
    }

    public RoomBookingSnapshotResponse updateBookingTotals(String roomBookingId, RoomBookingTotalsUpdateRequest request) {
        ApiResponse<RoomBookingSnapshotResponse> response = restClientBuilder.baseUrl(bookingServiceUrl).build()
                .post()
                .uri("/room-bookings/{id}/totals", roomBookingId)
                .header("Authorization", bearerHeader())
                .body(request)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (response == null || response.getResult() == null) {
            throw new AppException(ErrorCode.BOOKING_SYNC_FAILED);
        }

        return response.getResult();
    }

    public RoomBookingSnapshotResponse markBookingDeposited(String roomBookingId) {
        ApiResponse<RoomBookingSnapshotResponse> response = restClientBuilder.baseUrl(bookingServiceUrl).build()
                .post()
                .uri("/room-bookings/{id}/mark-deposited", roomBookingId)
                .header("Authorization", bearerHeader())
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (response == null || response.getResult() == null) {
            throw new AppException(ErrorCode.BOOKING_SYNC_FAILED);
        }

        return response.getResult();
    }

    public CatalogServiceSnapshotResponse getCatalogService(String serviceId) {
        ApiResponse<CatalogServiceSnapshotResponse> response = restClientBuilder.baseUrl(catalogServiceUrl).build()
                .get()
                .uri("/service/{id}", serviceId)
                .header("Authorization", bearerHeader())
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (response == null || response.getResult() == null) {
            throw new AppException(ErrorCode.CATALOG_SERVICE_NOT_FOUND);
        }

        return response.getResult();
    }

    private String bearerHeader() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            return "Bearer " + jwtAuthenticationToken.getToken().getTokenValue();
        }
        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
}
