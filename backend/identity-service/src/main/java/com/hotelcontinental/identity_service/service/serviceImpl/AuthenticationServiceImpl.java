package com.hotelcontinental.identity_service.service.serviceImpl;

import com.hotelcontinental.event.dto.NotificationEvent;
import com.hotelcontinental.identity_service.dto.redis.RedisOtp;
import com.hotelcontinental.identity_service.dto.request.Authentication.AuthenticationRequest;
import com.hotelcontinental.identity_service.dto.request.Authentication.IntrospectRequest;
import com.hotelcontinental.identity_service.dto.request.Authentication.LogoutRequest;
import com.hotelcontinental.identity_service.dto.request.Authentication.OtpVerifyRequest;
import com.hotelcontinental.identity_service.dto.request.Authentication.RefreshRequest;
import com.hotelcontinental.identity_service.dto.request.User.RegistrationRequest;
import com.hotelcontinental.identity_service.dto.response.Authentication.AuthenticationResponse;
import com.hotelcontinental.identity_service.dto.response.Authentication.IntrospectResponse;
import com.hotelcontinental.identity_service.dto.response.User.UserInfoResponse;
import com.hotelcontinental.identity_service.entity.Accounts;
import com.hotelcontinental.identity_service.entity.InvalidatedToken;
import com.hotelcontinental.identity_service.entity.Permissions;
import com.hotelcontinental.identity_service.entity.Roles;
import com.hotelcontinental.identity_service.entity.User;
import com.hotelcontinental.identity_service.enums.AccountStatus;
import com.hotelcontinental.identity_service.enums.Role;
import com.hotelcontinental.identity_service.enums.UserStatus;
import com.hotelcontinental.identity_service.exception.AppException;
import com.hotelcontinental.identity_service.exception.ErrorCode;
import com.hotelcontinental.identity_service.repository.AccountsRepository;
import com.hotelcontinental.identity_service.repository.InvalidatedTokenRepository;
import com.hotelcontinental.identity_service.repository.RolesRepository;
import com.hotelcontinental.identity_service.repository.UserRepository;
import com.hotelcontinental.identity_service.service.interfaces.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private static final String TOKEN_ISSUER = "hotelcontinental.identity";

    private final AccountsRepository accountsRepository;
    private final UserRepository userRepository;
    private final RolesRepository rolesRepository;
    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${jwt.signerKey}")
    @NonFinal
    private String signerKey;

    @Value("${jwt.valid-duration}")
    @NonFinal
    private long validDuration;

    @Value("${jwt.refreshable-duration}")
    @NonFinal
    private long refreshableDuration;

    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        Accounts account = accountsRepository.findByUsernameOrEmail(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        if (!isActiveAccount(account) || !passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return buildAuthenticationResponse(account);
    }

    @Override
    public IntrospectResponse introspect(IntrospectRequest request) {
        try {
            verifyToken(request.getToken());
            return IntrospectResponse.builder().valid(true).build();
        } catch (Exception exception) {
            return IntrospectResponse.builder().valid(false).build();
        }
    }

    @Override
    public AuthenticationResponse refreshToken(RefreshRequest request) {
        try {
            SignedJWT signedJWT = verifyToken(request.getToken());
            invalidateToken(signedJWT);

            String userId = signedJWT.getJWTClaimsSet().getSubject();
            Accounts account = accountsRepository.findByUserId(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

            if (!isActiveAccount(account)) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }

            return buildAuthenticationResponse(account);
        } catch (ParseException | JOSEException exception) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    @Override
    public void logout(LogoutRequest request) {
        try {
            invalidateToken(verifyToken(request.getToken()));
        } catch (ParseException | JOSEException exception) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    @Override
    public String register(RegistrationRequest request) {
        if (accountsRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        LocalDateTime now = LocalDateTime.now();
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .status(UserStatus.ACTIVE)
                .userType(Role.CUSTOMER.name())
                .createdBy("system")
                .createdTime(now)
                .deleted(false)
                .build();
        user = userRepository.save(user);

        Set<Roles> roles = rolesRepository.findByName(Role.CUSTOMER)
                .map(Collections::singleton)
                .orElseGet(Collections::emptySet);

        Accounts account = Accounts.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .status(AccountStatus.ACTIVE)
                .userId(user.getId())
                .roles(roles)
                .createdBy("system")
                .createdTime(now)
                .deleted(false)
                .build();
        accountsRepository.save(account);

        return user.getId();
    }

    @Override
    public void sendRegistrationOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(900000) + 100000);
        saveOtp(email, otp, "REGISTER");
        NotificationEvent event = new NotificationEvent(
                "EMAIL",
                "OTP_REGISTER",
                email,
                otp
        );

        try {
            kafkaTemplate.send("notifications", event).get(5, TimeUnit.SECONDS);
            log.info("Published registration OTP event to {}", email);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        } catch (ExecutionException | TimeoutException exception) {
            log.error("Failed to publish registration OTP event to {}", email, exception);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public boolean verifyOtp(OtpVerifyRequest request) {
        String key = "otp:" + request.getEmail();
        RedisOtp cached = (RedisOtp) redisTemplate.opsForValue().get(key);

        if (cached == null || !cached.getType().equals(request.getExpectedType())) {
            return false;
        }

        boolean matched = cached.getOtp().equals(request.getInputOtp());
        if (matched) {
            redisTemplate.delete(key);
        }

        return matched;
    }

    @Override
    public UserInfoResponse getInfoByToken(String token) {
        try {
            SignedJWT signedJWT = verifyToken(token);
            Accounts account = accountsRepository.findByUserId(signedJWT.getJWTClaimsSet().getSubject())
                    .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

            User user = account.getUser();
            UserInfoResponse response = new UserInfoResponse();
            response.setSub(user.getId());
            response.setEmail(user.getEmail());
            response.setPreferred_username(account.getUsername());
            response.setGiven_name(user.getFirstName());
            response.setFamily_name(user.getLastName());
            return response;
        } catch (ParseException | JOSEException exception) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    private AuthenticationResponse buildAuthenticationResponse(Accounts account) {
        try {
            return AuthenticationResponse.builder()
                    .token(generateToken(account, validDuration))
                    .refreshToken(generateToken(account, refreshableDuration))
                    .userName(account.getUsername())
                    .firstName(account.getUser().getFirstName())
                    .lastName(account.getUser().getLastName())
                    .permissions(buildAuthorities(account).toArray(String[]::new))
                    .build();
        } catch (JOSEException exception) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
    }

    private String generateToken(Accounts account, long durationSeconds) throws JOSEException {
        Instant now = Instant.now();
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(account.getUserId())
                .issuer(TOKEN_ISSUER)
                .issueTime(Date.from(now))
                .expirationTime(Date.from(now.plusSeconds(durationSeconds)))
                .jwtID(UUID.randomUUID().toString())
                .claim("username", account.getUsername())
                .claim("scope", String.join(" ", buildAuthorities(account)))
                .build();

        JWSObject jwsObject = new JWSObject(
                new JWSHeader(JWSAlgorithm.HS512),
                new Payload(claimsSet.toJSONObject()));
        jwsObject.sign(new MACSigner(signerKey.getBytes()));
        return jwsObject.serialize();
    }

    private SignedJWT verifyToken(String token) throws ParseException, JOSEException {
        SignedJWT signedJWT = SignedJWT.parse(normalizeToken(token));
        JWSVerifier verifier = new MACVerifier(signerKey.getBytes());

        Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        String jwtId = signedJWT.getJWTClaimsSet().getJWTID();
        boolean verified = signedJWT.verify(verifier);

        if (!verified || expirationTime == null || expirationTime.before(new Date())
                || invalidatedTokenRepository.existsById(jwtId)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return signedJWT;
    }

    private void invalidateToken(SignedJWT signedJWT) throws ParseException {
        String jwtId = signedJWT.getJWTClaimsSet().getJWTID();
        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        invalidatedTokenRepository.save(InvalidatedToken.builder()
                .id(jwtId)
                .expiryTime(expiryTime)
                .build());
    }

    private Set<String> buildAuthorities(Accounts account) {
        if (account.getRoles() == null) {
            return Set.of();
        }

        return account.getRoles().stream()
                .filter(role -> !Boolean.TRUE.equals(role.getDeleted()))
                .flatMap(role -> {
                    Set<String> authorities = new LinkedHashSet<>();
                    if (role.getName() != null) {
                        authorities.add("ROLE_" + role.getName().name());
                    }
                    if (role.getPermissions() != null) {
                        authorities.addAll(role.getPermissions().stream()
                                .filter(permission -> !Boolean.TRUE.equals(permission.getDeleted()))
                                .map(Permissions::getName)
                                .filter(StringUtils::hasText)
                                .collect(Collectors.toCollection(LinkedHashSet::new)));
                    }
                    return authorities.stream();
                })
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private boolean isActiveAccount(Accounts account) {
        User user = account.getUser();
        return !Boolean.TRUE.equals(account.getDeleted())
                && account.getStatus() == AccountStatus.ACTIVE
                && user != null
                && !Boolean.TRUE.equals(user.getDeleted())
                && user.getStatus() == UserStatus.ACTIVE;
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

    private String normalizeToken(String token) {
        if (!StringUtils.hasText(token)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String normalized = token.trim();
        if (normalized.startsWith("\"") && normalized.endsWith("\"") && normalized.length() > 1) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }
        if (normalized.regionMatches(true, 0, "Bearer ", 0, 7)) {
            normalized = normalized.substring(7);
        }

        return normalized.trim();
    }
}
