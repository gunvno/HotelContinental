package com.hotelcontinental.room_service.security;

import com.hotelcontinental.room_service.exception.AppException;
import com.hotelcontinental.room_service.exception.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {
    public String getUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            String username = jwtAuthenticationToken.getToken().getClaimAsString("username");
            if (username != null && !username.isBlank()) {
                return username;
            }

            String preferredUsername = jwtAuthenticationToken.getToken().getClaimAsString("preferred_username");
            if (preferredUsername != null && !preferredUsername.isBlank()) {
                return preferredUsername;
            }
        }

        return authentication.getName();
    }
}
