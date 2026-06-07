package com.hotelcontinental.identity_service.configuration;

import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class CustomAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
    @Nullable
    @Override
    public Collection<GrantedAuthority> convert(Jwt source) {
        String scope = source.getClaimAsString("scope");

        if (!StringUtils.hasText(scope)) {
            return List.of();
        }

        return Arrays.stream(scope.split(" "))
                .filter(StringUtils::hasText)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }
}
