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
import java.util.List;
import java.util.Map;
import java.util.Set;

public class CustomAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
    private static final String SCOPE = "scope";
    private static final String REALM_ACCESS = "realm_access";
    private static final String ROLE_PREFIX = "ROLE_";

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

        Map<String, Object> realmAccessMap = source.getClaimAsMap(REALM_ACCESS);
        if (realmAccessMap != null) {
            Object roles = realmAccessMap.get("roles");
            if (roles instanceof List<?> roleList) {
                roleList.stream()
                        .filter(String.class::isInstance)
                        .map(String.class::cast)
                        .map(role -> role.startsWith(ROLE_PREFIX) ? role : ROLE_PREFIX + role)
                        .map(SimpleGrantedAuthority::new)
                        .forEach(authorities::add);
            }
        }

        return authorities;
    }
}
