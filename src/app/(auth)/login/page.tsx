"use client";

import React, { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const callbackURL = searchParams.get("callbackURL") || "/dashboard";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      try {
        await authClient.signIn.email(
          {
            email,
            password,
            rememberMe,
            callbackURL,
          },
          {
            onSuccess: () => {
              setSuccessMsg("Successfully signed in! Redirecting...");
              setTimeout(() => {
                router.push(callbackURL);
                router.refresh();
              }, 800);
            },
            onError: (context) => {
              setErrorMsg(context.error.message || "Failed to sign in. Please try again.");
            },
          },
        );
      } catch (err: any) {
        setErrorMsg(err.message || "An unexpected error occurred.");
      }
    });
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo">
          Deal <span>Command</span> Center
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to manage your deal desk pipeline</p>
      </div>

      {errorMsg && <div className="auth-message error">{errorMsg}</div>}
      {successMsg && <div className="auth-message success">{successMsg}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label">Email Address</label>
          <div className="auth-input-wrapper">
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              disabled={isPending}
            />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label">Password</label>
          <div className="auth-input-wrapper">
            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isPending}
            />
          </div>
        </div>

        <div className="auth-row">
          <label className="auth-checkbox-label">
            <input
              type="checkbox"
              className="auth-checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isPending}
            />
            Remember me
          </label>
        </div>

        <button type="submit" className="auth-button" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="auth-footer">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="auth-link">
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="auth-card"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
          }}
        >
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
