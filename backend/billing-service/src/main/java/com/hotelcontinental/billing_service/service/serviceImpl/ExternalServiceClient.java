package com.hotelcontinental.billing_service.service.serviceImpl;

import com.hotelcontinental.billing_service.dto.ApiResponse;
import com.hotelcontinental.billing_service.dto.request.RoomBookingTotalsUpdateRequest;
import com.hotelcontinental.billing_service.dto.response.CatalogServiceSnapshotResponse;
import com.hotelcontinental.billing_service.dto.response.RoomBookingSnapshotResponse;
import com.hotelcontinental.billing_service.dto.response.RoomSnapshotResponse;
import com.hotelcontinental.billing_service.dto.response.RoomTypeServiceSnapshotResponse;
import com.hotelcontinental.billing_service.dto.response.SpringPageResponse;
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

import java.util.List;

@Component
@RequiredArgsConstructor
public class ExternalServiceClient {
    private final RestClient.Builder restClientBuilder;

    @Value("${app.services.booking:http://localhost:8082/booking}")
    private String bookingServiceUrl;

    @Value("${app.services.catalog:http://localhost:8083/catalog}")
    private String catalogServiceUrl;

    @Value("${app.services.room:http://localhost:8081/room}")
    private String roomServiceUrl;

    @Value("${app.internal-secret:dev-internal-secret}")
    private String internalSecret;

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
        RestClient.RequestHeadersSpec<?> requestSpec;
        String bearerHeader = bearerHeaderOrNull();
        if (bearerHeader != null) {
            requestSpec = restClientBuilder.baseUrl(bookingServiceUrl).build()
                    .post()
                    .uri("/room-bookings/{id}/mark-deposited", roomBookingId)
                    .header("Authorization", bearerHeader);
        } else {
            requestSpec = restClientBuilder.baseUrl(bookingServiceUrl).build()
                    .post()
                    .uri("/internal/room-bookings/{id}/mark-deposited", roomBookingId)
                    .header("X-Internal-Secret", internalSecret);
        }

        ApiResponse<RoomBookingSnapshotResponse> response = requestSpec.retrieve()
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

    public RoomSnapshotResponse getRoom(String roomId) {
        ApiResponse<RoomSnapshotResponse> response = restClientBuilder.baseUrl(roomServiceUrl).build()
                .get()
                .uri("/room/customer/{id}", roomId)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (response == null || response.getResult() == null) {
            throw new AppException(ErrorCode.BOOKING_SYNC_FAILED);
        }

        return response.getResult();
    }

    public List<RoomTypeServiceSnapshotResponse> getIncludedServicesByRoomType(String roomTypeId) {
        ApiResponse<SpringPageResponse<RoomTypeServiceSnapshotResponse>> response =
                restClientBuilder.baseUrl(catalogServiceUrl).build()
                        .get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/roomTypeService/roomType/{roomTypeId}")
                                .queryParam("page", 0)
                                .queryParam("size", 200)
                                .build(roomTypeId))
                        .retrieve()
                        .body(new ParameterizedTypeReference<>() {});

        if (response == null || response.getResult() == null || response.getResult().getContent() == null) {
            return List.of();
        }

        return response.getResult().getContent();
    }

    private String bearerHeader() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            return "Bearer " + jwtAuthenticationToken.getToken().getTokenValue();
        }
        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    private String bearerHeaderOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            return "Bearer " + jwtAuthenticationToken.getToken().getTokenValue();
        }
        return null;
    }
}
