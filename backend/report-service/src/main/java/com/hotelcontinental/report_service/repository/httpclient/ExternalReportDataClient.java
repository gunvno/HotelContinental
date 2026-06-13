package com.hotelcontinental.report_service.repository.httpclient;

import com.hotelcontinental.report_service.dto.ApiResponse;
import com.hotelcontinental.report_service.dto.response.PaymentHistorySnapshotResponse;
import com.hotelcontinental.report_service.dto.response.RoomBookingSnapshotResponse;
import com.hotelcontinental.report_service.exception.AppException;
import com.hotelcontinental.report_service.exception.ErrorCode;
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
public class ExternalReportDataClient {
    private final RestClient.Builder restClientBuilder;

    @Value("${app.services.booking:http://localhost:8084/booking}")
    private String bookingServiceUrl;

    @Value("${app.services.billing:http://localhost:8085/billing}")
    private String billingServiceUrl;

    public List<RoomBookingSnapshotResponse> getRoomBookings() {
        ApiResponse<List<RoomBookingSnapshotResponse>> response = restClientBuilder.baseUrl(bookingServiceUrl).build()
                .get()
                .uri("/room-bookings")
                .header("Authorization", bearerHeader())
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        return response != null && response.getResult() != null ? response.getResult() : List.of();
    }

    public List<PaymentHistorySnapshotResponse> getPayments() {
        ApiResponse<List<PaymentHistorySnapshotResponse>> response = restClientBuilder.baseUrl(billingServiceUrl).build()
                .get()
                .uri("/payments")
                .header("Authorization", bearerHeader())
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        return response != null && response.getResult() != null ? response.getResult() : List.of();
    }

    private String bearerHeader() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            return "Bearer " + jwtAuthenticationToken.getToken().getTokenValue();
        }

        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
}
