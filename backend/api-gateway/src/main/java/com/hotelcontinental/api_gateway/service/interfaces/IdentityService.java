package com.hotelcontinental.api_gateway.service.interfaces;

import com.hotelcontinental.api_gateway.dto.ApiResponse;
import com.hotelcontinental.api_gateway.dto.response.IntrospectResponse;
import reactor.core.publisher.Mono;

public interface IdentityService {
    Mono<ApiResponse<IntrospectResponse>> introspect(String token);
}
