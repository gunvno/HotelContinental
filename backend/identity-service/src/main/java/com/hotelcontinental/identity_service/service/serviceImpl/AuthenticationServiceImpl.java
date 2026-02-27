package com.hotelcontinental.identity_service.service.serviceImpl;

import com.hotelcontinental.event.dto.NotificationEvent;
import com.hotelcontinental.identity_service.dto.identity.Credential;
import com.hotelcontinental.identity_service.dto.identity.TokenExchangeParam;
import com.hotelcontinental.identity_service.dto.identity.UserCreationParam;
import com.hotelcontinental.identity_service.dto.redis.RedisOtp;
import com.hotelcontinental.identity_service.dto.request.Authentication.OtpVerifyRequest;
import com.hotelcontinental.identity_service.dto.request.User.RegistrationRequest;
import com.hotelcontinental.identity_service.exception.ErrorNormalizer;
import com.hotelcontinental.identity_service.repository.httpclient.IdentityClient;
import com.hotelcontinental.identity_service.service.interfaces.AuthenticationService;
import feign.FeignException;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {
    @Autowired
    private IdentityClient identityClient;
    @Value("${idp.client-id}")
    @NonFinal
    String clientId;

    @Value("${idp.client-secret}")
    @NonFinal
    String clientSecret;

    @Autowired
    private ErrorNormalizer errorNormalizer;
    @Autowired
    private  KafkaTemplate<String, Object> kafkaTemplate;
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public String register(RegistrationRequest request) {
        try {
            // Create account in KeyCloak
            // Exchange client Token
            var token = identityClient.exchangeToken(TokenExchangeParam.builder()
                    .grant_type("client_credentials")
                    .client_id(clientId)
                    .client_secret(clientSecret)
                    .build());

            log.info("TokenInfo {}", token);
            // Create user with client Token and given info

            // Get userId of keyCloak account
            var creationResponse = identityClient.createUser(
                    "Bearer " + token.getAccessToken(),
                    UserCreationParam.builder()
                            .username(request.getUsername())
                            .firstName(request.getFirstName())
                            .lastName(request.getLastName())
                            .email(request.getEmail())
                            .enabled(true)
                            .emailVerified(false)
                            .build());

            String userId = extractUserId(creationResponse);
            log.info("UserId {}", userId);
            identityClient.setPassword("Bearer " + token.getAccessToken(), userId, Credential.builder()
                    .type("password")
                    .value(request.getPassword())
                    .temporary(false)
                    .build());
            return userId;
        } catch (FeignException exception) {
            throw errorNormalizer.handleKeyCloakException(exception);
        }
    }
    private String extractUserId(ResponseEntity<?> response) {
        List<String> locationHeader = response.getHeaders().get("Location");

        if (locationHeader == null || locationHeader.isEmpty()) {
            throw new RuntimeException("Không tìm thấy Location header trong phản hồi từ Keycloak");
        }

        String location = locationHeader.getFirst();
        String[] splitedStr = location.split("/");
        return splitedStr[splitedStr.length - 1];
    }
    public void sendRegistrationOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(900000) + 100000);
        saveOtp(email, otp, "REGISTER");
        NotificationEvent event = new NotificationEvent(
                "EMAIL",
                "OTP_REGISTER",
                email,
                otp
        );

        kafkaTemplate.send("notifications", event);
    }
    private void saveOtp(String email, String otp, String type) {

        String key = "otp:" + email;

        RedisOtp redisOtp = new RedisOtp(email, otp, type);

        redisTemplate.opsForValue().set(
                key,
                redisOtp,
                5,
                TimeUnit.MINUTES
        );
    }
    public boolean verifyOtp(OtpVerifyRequest request) {

        String key = "otp:" + request.getEmail();

        RedisOtp cached = (RedisOtp) redisTemplate.opsForValue().get(key);

        if (cached == null) {
            return false; // hết hạn
        }

        if (!cached.getType().equals(request.getExpectedType())) {
            return false; // sai loại OTP
        }

        boolean matched = cached.getOtp().equals(request.getInputOtp());

        if (matched) {
            redisTemplate.delete(key);
        }

        return matched;
    }

}
