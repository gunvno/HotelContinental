package com.hotelcontinental.identity_service.configuration;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "authorization")
public class RolePermissionProperties {
    private List<String> adminPermission = new ArrayList<>();
    private List<String> managerPermission = new ArrayList<>();
    private List<String> receptionistPermission = new ArrayList<>();
    private List<String> customerSupportPermission = new ArrayList<>();
    private List<String> housekeepingPermission = new ArrayList<>();
    private List<String> customerPermission = new ArrayList<>();
}
