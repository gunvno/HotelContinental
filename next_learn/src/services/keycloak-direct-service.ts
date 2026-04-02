const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080";
const REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "master";
const CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "next-app";
// Note: Direct Access Grants must be enabled for this client in Keycloak
// and "Client authentication" should be OFF (Public client) or you need client_secret.

export async function loginWithKeycloakDirect(username: string, password: string) {
  const url = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
  console.log(`[Keycloak Direct] Attempting login for user: ${username} at ${url}`);

  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("grant_type", "password");
  params.append("username", username);
  params.append("password", password);
  params.append("scope", "openid profile email");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Keycloak Direct] Error:", data);
      
      // Xử lý các lỗi phổ biến từ Keycloak
      if (data.error === "invalid_grant") {
        throw new Error("Tài khoản hoặc mật khẩu không chính xác");
      }
      if (data.error_description) {
        throw new Error(data.error_description);
      }
      throw new Error(`Lỗi đăng nhập: ${data.error || response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error("[Keycloak Direct] Exception:", error);
    throw error;
  }
}
export async function refreshTokenKeycloak(refreshToken: string) {
  const url = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
  
  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) throw new Error("Failed to refresh token");
  return await res.json();
}

export async function getUserInfoKeycloak(accessToken: string) {
  const url = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/userinfo`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error("Failed to fetch user info");
  return await res.json();
}
