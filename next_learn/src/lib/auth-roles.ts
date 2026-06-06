type KeycloakTokenPayload = {
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<
    string,
    {
      roles?: string[];
    }
  >;
};

const ADMIN_ROLES = new Set(["ADMIN", "ROLE_ADMIN"]);

export function getRolesFromToken(token: string | null | undefined) {
  if (!token) {
    return [];
  }

  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return [];
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(normalizedPayload)) as KeycloakTokenPayload;
    const realmRoles = decodedPayload.realm_access?.roles ?? [];
    const resourceRoles = Object.values(decodedPayload.resource_access ?? {}).flatMap((resource) => resource.roles ?? []);

    return Array.from(new Set([...realmRoles, ...resourceRoles]));
  } catch (error) {
    console.error("Failed to decode auth token roles:", error);
    return [];
  }
}

export function hasAdminRole(roles: string[] | null | undefined) {
  return (roles ?? []).some((role) => ADMIN_ROLES.has(role.toUpperCase()));
}

export function hasAdminRoleFromToken(token: string | null | undefined) {
  return hasAdminRole(getRolesFromToken(token));
}

export function getAdminAppUrl() {
  return process.env.NEXT_PUBLIC_ADMIN_APP_URL || "http://localhost:3001";
}
