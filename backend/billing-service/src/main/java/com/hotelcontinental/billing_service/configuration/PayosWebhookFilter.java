package com.hotelcontinental.billing_service.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotelcontinental.billing_service.dto.ApiResponse;
import com.hotelcontinental.billing_service.dto.request.PayosWebhookRequest;
import com.hotelcontinental.billing_service.dto.response.PaymentRequestResponse;
import com.hotelcontinental.billing_service.service.interfaces.PaymentRequestService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
@Slf4j
public class PayosWebhookFilter extends OncePerRequestFilter {
    private static final String WEBHOOK_PATH = "/payment-requests/payos/webhook";
    private static final String PAYOS_PATH = "/payment-requests/payos";

    private final ObjectMapper objectMapper;
    private final PaymentRequestService paymentRequestService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = normalizePath(request);
        return !(path.equals(PAYOS_PATH)
                || path.startsWith(PAYOS_PATH + "/")
                || path.endsWith(WEBHOOK_PATH));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if ("GET".equalsIgnoreCase(request.getMethod())
                || "HEAD".equalsIgnoreCase(request.getMethod())
                || "OPTIONS".equalsIgnoreCase(request.getMethod())) {
            writeJson(response, ApiResponse.<String>builder()
                    .message("PayOS webhook is ready")
                    .result("OK")
                    .build());
            return;
        }

        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            writeJson(response, ApiResponse.<String>builder()
                    .message("PayOS webhook is ready")
                    .result("OK")
                    .build());
            return;
        }

        String body = StreamUtils.copyToString(request.getInputStream(), StandardCharsets.UTF_8);
        if (!StringUtils.hasText(body)) {
            writeJson(response, ApiResponse.<String>builder()
                    .message("PayOS webhook is ready")
                    .result("OK")
                    .build());
            return;
        }

        PayosWebhookRequest webhookRequest;
        try {
            webhookRequest = objectMapper.readValue(body, PayosWebhookRequest.class);
        } catch (Exception exception) {
            writeJson(response, ApiResponse.<String>builder()
                    .message("PayOS webhook is ready")
                    .result("OK")
                    .build());
            return;
        }

        if (webhookRequest.getData() == null || !StringUtils.hasText(webhookRequest.getSignature())) {
            writeJson(response, ApiResponse.<String>builder()
                    .message("PayOS webhook is ready")
                    .result("OK")
                    .build());
            return;
        }

        try {
            PaymentRequestResponse result = paymentRequestService.handlePayosWebhook(webhookRequest);
            writeJson(response, ApiResponse.<PaymentRequestResponse>builder()
                    .result(result)
                    .build());
        } catch (Exception exception) {
            log.warn("PayOS webhook received but was not applied: {}", exception.getMessage());
            writeJson(response, ApiResponse.<String>builder()
                    .message("PayOS webhook received")
                    .result("OK")
                    .build());
        }
    }

    private String normalizePath(HttpServletRequest request) {
        String contextPath = request.getContextPath();
        String requestUri = request.getRequestURI();
        if (StringUtils.hasText(contextPath) && requestUri.startsWith(contextPath)) {
            return requestUri.substring(contextPath.length());
        }
        return requestUri;
    }

    private void writeJson(HttpServletResponse response, Object body) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("X-Hotel-Payos-Webhook", "handled");
        objectMapper.writeValue(response.getWriter(), body);
    }
}
