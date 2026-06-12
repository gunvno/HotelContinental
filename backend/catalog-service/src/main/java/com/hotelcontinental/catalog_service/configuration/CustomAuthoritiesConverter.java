package com.hotelcontinental.catalog_service.configuration;

import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Set;

public class CustomAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
    private static final String SCOPE = "scope";

    @Nullable
    @Override
    public Collection<GrantedAuthority> convert(Jwt source) {
        Set<GrantedAuthority> authorities = new LinkedHashSet<>();

        String scope = source.getClaimAsString(SCOPE);
        if (StringUtils.hasText(scope)) {
            Arrays.stream(scope.split(" "))
                    .filter(StringUtils::hasText)
                    .map(SimpleGrantedAuthority::new)
                    .forEach(authorities::add);
        }

        return authorities;
    }
}
