package com.hotelcontinental.billing_service.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

@ConfigurationProperties(prefix = "payos")
public record PayosProperties(
        boolean enabled,
        String baseUrl,
        String clientId,
        String apiKey,
        String checksumKey,
        String returnUrl,
        String cancelUrl
) {
    public boolean configured() {
        return enabled
                && StringUtils.hasText(baseUrl)
                && StringUtils.hasText(clientId)
                && StringUtils.hasText(apiKey)
                && StringUtils.hasText(checksumKey)
                && StringUtils.hasText(returnUrl)
                && StringUtils.hasText(cancelUrl);
    }
}
