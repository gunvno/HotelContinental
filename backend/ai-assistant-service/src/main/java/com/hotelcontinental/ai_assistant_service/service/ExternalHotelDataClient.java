package com.hotelcontinental.ai_assistant_service.service;

import com.hotelcontinental.ai_assistant_service.dto.ApiResponse;
import lombok.AccessLevel;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ExternalHotelDataClient {
    private final RestClient.Builder restClientBuilder;

    @Value("${app.room-service-url}")
    private String roomServiceUrl;

    @Value("${app.booking-service-url}")
    private String bookingServiceUrl;

    public List<RoomSnapshot> getRooms() {
        RestClient restClient = restClientBuilder.baseUrl(roomServiceUrl).build();
        ApiResponse<PageResponse<RoomSnapshot>> response = restClient.get()
                .uri(uriBuilder -> uriBuilder.path("/room/customer")
                        .queryParam("page", 0)
                        .queryParam("size", 200)
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });

        return response != null && response.getResult() != null
                ? response.getResult().getContent()
                : List.of();
    }

    public List<String> getBusyRoomIds(LocalDateTime start, LocalDateTime end) {
        RestClient restClient = restClientBuilder.baseUrl(bookingServiceUrl).build();
        ApiResponse<List<String>> response = restClient.get()
                .uri(uriBuilder -> uriBuilder.path("/availability/busy-room-ids")
                        .queryParam("start", start)
                        .queryParam("end", end)
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });

        return response != null && response.getResult() != null ? response.getResult() : List.of();
    }

    @Data
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PageResponse<T> {
        List<T> content = List.of();
        int totalPages;
        long totalElements;
        int size;
        int number;
    }

    @Data
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class RoomSnapshot {
        String id;
        String roomTypeId;
        String image;
        String name;
        Float pricePerDay;
        Float pricePerHour;
        String description;
        String roomSize;
        String status;
    }
}
