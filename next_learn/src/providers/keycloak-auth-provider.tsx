/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Keycloak from "keycloak-js";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const doLogin = useAuthStore((s) => s.login);
  const router = useRouter();
  const currentPath = usePathname();

  useEffect(() => {
    const initKeycloak = async () => {
      const keycloakInstance = new Keycloak({
        url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
        realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "master",
        clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "next-app",
      });

      try {
        const authenticated = await keycloakInstance.init({
          onLoad: "check-sso",
          // silentCheckSsoRedirectUri: typeof window !== 'undefined' ? 
          //   window.location.origin + "/silent-check-sso.html" : undefined,
          checkLoginIframe: false,
          enableLogging: true,
        });

        setKeycloak(keycloakInstance);
        setAuthenticated(authenticated);

        if (authenticated) {
          setToken(keycloakInstance.token || null);
          const userInfo = await keycloakInstance.loadUserInfo() as UserInfo;
          setUserInfo(userInfo);

           // Sync to Zustand store when Keycloak login (e.g. from Google redirect)
           if (keycloakInstance.token) {
            doLogin({
              token: keycloakInstance.token,
              refreshToken: keycloakInstance.refreshToken || null,
              userName: userInfo?.preferred_username || userInfo?.name || null,
              firstName: userInfo?.given_name || null,
              lastName: userInfo?.family_name || null,
              permissions: [], // Keycloak roles mapping would go here if needed
            }, true);

            // Check if user has profile
            try {
              const profile = await getMyProfile();
              // If no profile and not already on the registration page
              if (!profile && currentPath !== "/register-profile") {
                router.push(`/register-profile?userId=${userInfo.sub}`);
              }
            } catch (error) {
              console.error("Error checking profile:", error);
            }
          }
        }


        // Set up token refresh
        keycloakInstance.onTokenExpired = () => {
          keycloakInstance
            .updateToken(70)
            .then((refreshed) => {
              if (refreshed) {
                setToken(keycloakInstance.token || null);
              }
            })
            .catch(() => {
              console.error("Failed to refresh token");
            });
        };

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