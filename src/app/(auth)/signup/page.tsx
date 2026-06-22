"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      try {
        await authClient.signUp.email(
          {
            email,
            password,
            name,
            callbackURL: "/dashboard",
          },
          {
            onSuccess: () => {
              setSuccessMsg("Account created successfully! Redirecting...");
              setTimeout(() => {
                router.push("/dashboard");
                router.refresh();
              }, 800);
            },
            onError: (context) => {
              setErrorMsg(context.error.message || "Failed to create account.");
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
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Get started with your M&amp;A AI deal command center</p>
      </div>

      {errorMsg && <div className="auth-message error">{errorMsg}</div>}
      {successMsg && <div className="auth-message success">{successMsg}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label">Full Name</label>
          <div className="auth-input-wrapper">
            <input
              type="text"
              className="auth-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={isPending}
            />
          </div>
        </div>

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

        <div className="auth-field">
          <label className="auth-label">Confirm Password</label>
          <div className="auth-input-wrapper">
            <input
              type="password"
              className="auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isPending}
            />
          </div>
        </div>

        <button type="submit" className="auth-button" disabled={isPending}>
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account?{" "}
        <Link href="/login" className="auth-link">
          Sign in
        </Link>
      </div>
    </div>
  );
}
