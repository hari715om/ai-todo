"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, saveAuth } from "../lib/auth";
import { authApi } from "../lib/api";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const router = useRouter();
  const googleBtnRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/todos");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  function initGoogle() {
    if (!window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      width: 340,
      text: "signin_with",
      shape: "rectangular",
    });
  }

  async function handleGoogleCredential(response) {
    setLoading(true);
    setError("");
    try {
      const { data } = await authApi.loginWithGoogle(response.credential);
      const user = decodeGoogleToken(response.credential);
      saveAuth(data.access_token, user);
      router.replace("/todos");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </div>

        <h1 className="login-title">AI Todo</h1>
        <p className="login-subtitle">
          Smart task management with AI assistance.<br />
          Sign in to get started.
        </p>

        {error && <div className="error-banner">{error}</div>}

        <div ref={googleBtnRef} id="google-signin-btn" />

        <div className="login-footer">
          By signing in, you agree to keep your tasks organized.
        </div>
      </div>
    </div>
  );
}

function decodeGoogleToken(credential) {
  try {
    const payload = credential.split(".")[1];
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded.replace(/-/g, "+").replace(/_/g, "/")));
    return {
      name: decoded.name || decoded.email?.split("@")[0] || "User",
      email: decoded.email || "",
      picture: decoded.picture || null,
    };
  } catch {
    return { name: "User", email: "", picture: null };
  }
}
