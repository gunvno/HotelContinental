"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";

export default function CallbackPage() {
  const router = useRouter();
  const doLogin = useAuthStore((s) => s.login);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    const verifier = sessionStorage.getItem("pkce_verifier");

    if (!code || !verifier) {
      return;
    }

    fetch("http://localhost:8080/auth/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, codeVerifier: verifier }),
    })
      .then((res) => res.json())
      .then((data) => {
        doLogin(data.access_token, true);
        router.replace("/");
      });
  }, [router, doLogin]);

  return <p>Đang đăng nhập...</p>;
}
