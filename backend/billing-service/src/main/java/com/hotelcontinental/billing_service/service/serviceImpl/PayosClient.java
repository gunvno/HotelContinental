package com.hotelcontinental.billing_service.service.serviceImpl;

import com.hotelcontinental.billing_service.configuration.PayosProperties;
import com.hotelcontinental.billing_service.dto.request.PayosWebhookRequest;
import com.hotelcontinental.billing_service.dto.response.PayosApiResponse;
import com.hotelcontinental.billing_service.dto.response.PayosPaymentLinkResponse;
import com.hotelcontinental.billing_service.exception.AppException;
import com.hotelcontinental.billing_service.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayosClient {
    private static final String SIGNATURE_ALGORITHM = "HmacSHA256";

    private final PayosProperties payosProperties;
    private final RestClient.Builder restClientBuilder;

    public boolean configured() {
        return payosProperties.configured();
    }

    public PayosPaymentLinkResponse createPaymentLink(
            Long orderCode,
            int amount,
            String description
    ) {
        if (!configured()) {
            return null;
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount", amount);
        body.put("cancelUrl", payosProperties.cancelUrl());
        body.put("description", description);
        body.put("orderCode", orderCode);
        body.put("returnUrl", payosProperties.returnUrl());
        body.put("signature", sign(body));

        try {
            PayosApiResponse<PayosPaymentLinkResponse> response = restClientBuilder.build()
                    .post()
                    .uri(payosProperties.baseUrl() + "/v2/payment-requests")
                    .header("x-client-id", payosProperties.clientId())
                    .header("x-api-key", payosProperties.apiKey())
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response == null || !"00".equals(response.getCode()) || response.getData() == null) {
                log.warn(
                        "PayOS create payment link failed. orderCode={}, amount={}, code={}, desc={}",
                        orderCode,
                        amount,
                        response == null ? null : response.getCode(),
                        response == null ? null : response.getDesc()
                );
                throw new AppException(ErrorCode.PAYOS_REQUEST_FAILED);
            }

            return response.getData();
        } catch (RestClientResponseException exception) {
            log.warn(
                    "PayOS create payment link HTTP failed. orderCode={}, status={}, body={}",
                    orderCode,
                    exception.getStatusCode(),
                    exception.getResponseBodyAsString()
            );
            throw new AppException(ErrorCode.PAYOS_REQUEST_FAILED);
        } catch (RestClientException exception) {
            log.warn(
                    "PayOS create payment link request failed. orderCode={}, error={}",
                    orderCode,
                    exception.getMessage()
            );
            throw new AppException(ErrorCode.PAYOS_REQUEST_FAILED);
        }
    }

    public PayosPaymentLinkResponse getPaymentLink(Long orderCode) {
        if (!configured() || orderCode == null) {
            return null;
        }

        try {
            PayosApiResponse<PayosPaymentLinkResponse> response = restClientBuilder.build()
                    .get()
                    .uri(payosProperties.baseUrl() + "/v2/payment-requests/{orderCode}", orderCode)
                    .header("x-client-id", payosProperties.clientId())
                    .header("x-api-key", payosProperties.apiKey())
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            if (response == null || !"00".equals(response.getCode()) || response.getData() == null) {
                log.warn(
                        "PayOS get payment link failed. orderCode={}, code={}, desc={}",
                        orderCode,
                        response == null ? null : response.getCode(),
                        response == null ? null : response.getDesc()
                );
                throw new AppException(ErrorCode.PAYOS_REQUEST_FAILED);
            }

            return response.getData();
        } catch (RestClientResponseException exception) {
            log.warn(
                    "PayOS get payment link HTTP failed. orderCode={}, status={}, body={}",
                    orderCode,
                    exception.getStatusCode(),
                    exception.getResponseBodyAsString()
            );
            throw new AppException(ErrorCode.PAYOS_REQUEST_FAILED);
        } catch (RestClientException exception) {
            log.warn(
                    "PayOS get payment link request failed. orderCode={}, error={}",
                    orderCode,
                    exception.getMessage()
            );
            throw new AppException(ErrorCode.PAYOS_REQUEST_FAILED);
        }
    }

    public boolean verifyWebhook(PayosWebhookRequest request) {
        if (!configured()
                || request == null
                || request.getData() == null
                || !StringUtils.hasText(request.getSignature())) {
            return false;
        }

        String expectedSignature = sign(request.getData());
        return expectedSignature.equalsIgnoreCase(request.getSignature());
    }

    private String sign(Map<String, Object> data) {
        String rawData = new TreeMap<>(data).entrySet().stream()
                .filter(entry -> entry.getValue() != null)
                .filter(entry -> !"signature".equals(entry.getKey()))
                .map(entry -> entry.getKey() + "=" + normalizeValue(entry.getValue()))
                .collect(Collectors.joining("&"));

        try {
            Mac hmac = Mac.getInstance(SIGNATURE_ALGORITHM);
            SecretKeySpec secretKey = new SecretKeySpec(
                    payosProperties.checksumKey().getBytes(StandardCharsets.UTF_8),
                    SIGNATURE_ALGORITHM
            );
            hmac.init(secretKey);
            byte[] signedBytes = hmac.doFinal(rawData.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(signedBytes.length * 2);
            for (byte signedByte : signedBytes) {
                hex.append(String.format(Locale.ROOT, "%02x", signedByte));
            }
            return hex.toString();
        } catch (Exception exception) {
            throw new AppException(ErrorCode.PAYOS_REQUEST_FAILED);
        }
    }

    private String normalizeValue(Object value) {
        return String.valueOf(value);
    }
}
