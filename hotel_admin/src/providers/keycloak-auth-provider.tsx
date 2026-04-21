/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Keycloak from "keycloak-js";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { getMyProfile } from "@/services/profile-service";

interface UserInfo {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
  preferred_username?: string;
  [key: string]: any;
}

type KeycloakAuthContextType = {
  keycloak: Keycloak | null;
  authenticated: boolean;
  login: () => void;
  logout: () => void;
  token: string | null;
  userInfo: UserInfo | null;
};

const KeycloakAuthContext = createContext<KeycloakAuthContextType | undefined>(
  undefined,
);

export type KeycloakAuthProviderProps = {
  children: ReactNode;
};

import { useAuthStore } from "@/store/auth-store";

export function KeycloakAuthProvider({ children }: KeycloakAuthProviderProps) {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const doLogin = useAuthStore((s) => s.login);

  useEffect(() => {
    let refreshInterval: ReturnType<typeof setInterval>;

    const initKeycloak = async () => {
      const keycloakInstance = new Keycloak({
        url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
        realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "master",
        clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "next-app",
      });

      try {
        const authenticated = await keycloakInstance.init({
          onLoad: "login-required",
          // silentCheckSsoRedirectUri: typeof window !== 'undefined' ? 
          //   window.location.origin + "/silent-check-sso.html" : undefined,
          checkLoginIframe: false,
          enableLogging: true,
        });

        setKeycloak(keycloakInstance);
        setAuthenticated(authenticated);

        if (authenticated) {
          // Check role ADMIN
          const hasAdminRole = keycloakInstance.hasRealmRole("ADMIN") || 
                             keycloakInstance.hasRealmRole("admin") ||
                             keycloakInstance.hasResourceRole("ADMIN") ||
                             keycloakInstance.hasResourceRole("admin");
                             
          if (!hasAdminRole) {
             setAccessDenied(true);
             setLoading(false);
             // Logout automatically or force user action? 
             // Better: Show Access Denied UI.
             return;
          }

          setToken(keycloakInstance.token || null);
          const userInfo = await keycloakInstance.loadUserInfo() as UserInfo;
          setUserInfo(userInfo);

           // Sync to Zustand store when Keycloak login
           if (keycloakInstance.token) {
            doLogin(
              keycloakInstance.token!,
              keycloakInstance.refreshToken || "",
              userInfo
            );

            // Set up token refresh
            keycloakInstance.onTokenExpired = () => {
              keycloakInstance
                .updateToken(70)
                .then((refreshed) => {
                  if (refreshed) {
                    setToken(keycloakInstance.token || null);
                    doLogin(
                      keycloakInstance.token!,
                      keycloakInstance.refreshToken || "",
                      userInfo
                    );
                  }
                })
                .catch(() => {
                  console.error("Failed to refresh token");
                });
            };

            // Periodic check to ensure token is fresh
            refreshInterval = setInterval(() => {
              keycloakInstance
                .updateToken(70) // If less than 70s validity, refresh
                .then((refreshed) => {
                  if (refreshed) {
                    console.log("Token refreshed automatically");
                    setToken(keycloakInstance.token || null);
                    doLogin(
                       keycloakInstance.token!, 
                       keycloakInstance.refreshToken || "",
                       userInfo
                     );
                  }
                })
                .catch(console.error);
            }, 60 * 1000); // Check every minute

            // Optional: ping profile endpoint for warm-up, but do not force redirect.
            await getMyProfile();
          }
        }
        
        setLoading(false);

        keycloakInstance.onAuthSuccess = () => {
          setAuthenticated(true);
          setToken(keycloakInstance.token || null);
          keycloakInstance.loadUserInfo().then(setUserInfo);
        };

        keycloakInstance.onAuthLogout = () => {
          setAuthenticated(false);
          setToken(null);
          setUserInfo(null);
        };
      } catch (error) {
        console.error("Failed to initialize Keycloak", error);
      }
    };

    initKeycloak();

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [doLogin]);

  const login = () => {
    if (keycloak) {
      keycloak.login();
    }
  };

  const logout = () => {
    if (keycloak) {
      keycloak.logout({ redirectUri: window.location.origin });
    }
  };

  const value: KeycloakAuthContextType = {
    keycloak,
    authenticated,
    login,
    logout,
    token,
    userInfo,
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Đang xác thực thông tin...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quyền truy cập bị từ chối</h2>
          <p className="text-gray-600 mb-6">
            Tài khoản của bạn không có vai trò <strong>ADMIN</strong> để truy cập vào hệ thống này.
          </p>
          <button 
            onClick={() => logout()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Đăng xuất và thử tài khoản khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <KeycloakAuthContext.Provider value={value}>
      {children}
    </KeycloakAuthContext.Provider>
  );
}

export function useKeycloakAuth() {
  const context = useContext(KeycloakAuthContext);
  if (context === undefined) {
    throw new Error("useKeycloakAuth must be used within KeycloakAuthProvider");
  }
  return context;
}