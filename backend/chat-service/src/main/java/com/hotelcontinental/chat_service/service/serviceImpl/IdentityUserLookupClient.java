package com.hotelcontinental.chat_service.service.serviceImpl;

import com.hotelcontinental.chat_service.dto.ApiResponse;
import com.hotelcontinental.chat_service.dto.response.IdentityUserSummaryResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class IdentityUserLookupClient {
    private final RestClient restClient;
    private final Map<String, String> displayNameCache = new ConcurrentHashMap<>();

    public IdentityUserLookupClient(
            RestClient.Builder restClientBuilder,
            @Value("${app.identity-service-url:http://localhost:8080/identity}") String identityServiceUrl
    ) {
        this.restClient = restClientBuilder.baseUrl(identityServiceUrl).build();
    }

    public Optional<String> findDisplayName(String userId) {
        if (userId == null || userId.isBlank()) {
            return Optional.empty();
        }

        String cached = displayNameCache.get(userId);
        if (cached != null && !cached.isBlank()) {
            return Optional.of(cached);
        }

        String bearerToken = getCurrentBearerToken();
        if (bearerToken == null) {
            return Optional.empty();
        }

        try {
            ApiResponse<IdentityUserSummaryResponse> response = restClient.get()
                    .uri("/users/{userId}/summary", userId)
                    .header("Authorization", "Bearer " + bearerToken)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            IdentityUserSummaryResponse user = response != null ? response.getResult() : null;
            String displayName = buildDisplayName(user);
            if (displayName != null && !displayName.isBlank()) {
                displayNameCache.put(userId, displayName);
                return Optional.of(displayName);
            }
        } catch (Exception exception) {
            log.debug("Cannot resolve display name for user {}", userId, exception);
        }

        return Optional.empty();
    }

    private String getCurrentBearerToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            return jwtAuthenticationToken.getToken().getTokenValue();
        }
        return null;
    }

    private String buildDisplayName(IdentityUserSummaryResponse user) {
        if (user == null) {
            return null;
        }

        String fullName = String.join(" ",
                user.getLastName() != null ? user.getLastName().trim() : "",
                user.getFirstName() != null ? user.getFirstName().trim() : ""
        ).trim();
        if (!fullName.isBlank()) {
            return fullName;
        }
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername();
        }
        return user.getEmail();
    }
}
