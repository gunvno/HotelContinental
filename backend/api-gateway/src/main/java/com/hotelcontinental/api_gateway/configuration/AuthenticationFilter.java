package com.hotelcontinental.api_gateway.configuration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotelcontinental.api_gateway.dto.ApiResponse;
import com.hotelcontinental.api_gateway.service.interfaces.IdentityService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationFilter implements GlobalFilter, Ordered {
    IdentityService identityService;
    ObjectMapper objectMapper;

    @NonFinal
    @Value("${app.api-prefix}")
    String apiPrefix;

    @NonFinal
    PublicEndpoint[] publicEndpoints = {
            PublicEndpoint.any("/identity/auth/(token|login|register|otp-register|otp-verify|introspect|refresh|logout)"),
            PublicEndpoint.post("/identity/profileExpand/create"),

            PublicEndpoint.get("/notification/health"),
            PublicEndpoint.get("/room/health"),
            PublicEndpoint.get("/catalog/health"),
            PublicEndpoint.get("/booking/health"),
            PublicEndpoint.get("/booking/availability/busy-room-ids"),

            PublicEndpoint.get("/room/media/download/.*"),
            PublicEndpoint.get("/room/room/customer"),
            PublicEndpoint.get("/room/room/customer/.*"),
            PublicEndpoint.get("/room/amenityRoom/roomType/.*"),
            PublicEndpoint.get("/room/building"),
            PublicEndpoint.get("/room/building/.*/floors"),

            PublicEndpoint.get("/catalog/roomType"),
            PublicEndpoint.get("/catalog/roomType/.*"),
            PublicEndpoint.get("/catalog/amenity"),
            PublicEndpoint.get("/catalog/amenity/.*"),
            PublicEndpoint.get("/catalog/roomTypeService"),
            PublicEndpoint.get("/catalog/roomTypeService/.*"),
    };

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (isPublicEndpoint(exchange.getRequest())) {
            return chain.filter(exchange);
        }

        List<String> authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION);
        if (CollectionUtils.isEmpty(authHeader)) {
            return unauthenticated(exchange.getResponse());
        }

        String token = authHeader.get(0).replace("Bearer ", "");

        return identityService.introspect(token).flatMap(introspectResponse -> {
            if (introspectResponse.getResult().isValid()) {
                return chain.filter(exchange);
            }
            return unauthenticated(exchange.getResponse());
        }).onErrorResume(throwable -> unauthenticated(exchange.getResponse()));
    }

    @Override
    public int getOrder() {
        return -1;
    }

    private boolean isPublicEndpoint(ServerHttpRequest request) {
        if (request.getMethod() == HttpMethod.OPTIONS) {
            return true;
        }

        String path = request.getURI().getPath();
        HttpMethod method = request.getMethod();

        return Arrays.stream(publicEndpoints)
                .anyMatch(endpoint -> endpoint.matches(method, path, apiPrefix));
    }

    Mono<Void> unauthenticated(ServerHttpResponse response) {
        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(1401)
                .message("Unauthenticated")
                .build();

        String body;
        try {
            body = objectMapper.writeValueAsString(apiResponse);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        return response.writeWith(
                Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }

    private record PublicEndpoint(HttpMethod method, String pathRegex) {
        static PublicEndpoint any(String pathRegex) {
            return new PublicEndpoint(null, pathRegex);
        }

        static PublicEndpoint get(String pathRegex) {
            return new PublicEndpoint(HttpMethod.GET, pathRegex);
        }

        static PublicEndpoint post(String pathRegex) {
            return new PublicEndpoint(HttpMethod.POST, pathRegex);
        }

        boolean matches(HttpMethod requestMethod, String requestPath, String apiPrefix) {
            return (method == null || method == requestMethod)
                    && requestPath.matches(apiPrefix + pathRegex);
        }
    }
}
