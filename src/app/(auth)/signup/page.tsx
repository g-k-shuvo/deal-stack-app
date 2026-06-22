"use client";

import React, { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Read initial plan and billing from query params
  const initialPlan = (searchParams.get("plan") || "starter").toLowerCase();
  const initialBilling = (searchParams.get("billing") || "monthly").toLowerCase();

  const [selectedPlan, setSelectedPlan] = useState(
    initialPlan === "professional" || initialPlan === "firm" ? initialPlan : "starter"
  );
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">(
    initialBilling === "annual" ? "annual" : "monthly"
  );

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
            onSuccess: async () => {
              setSuccessMsg("Account created successfully! Redirecting to checkout...");
              try {
                // Call subscription upgrade to redirect the user to Stripe checkout
                const upgradeResult = await authClient.subscription.upgrade({
                  plan: selectedPlan,
                  annual: billingInterval === "annual",
                  successUrl: window.location.origin + "/dashboard",
                  cancelUrl: window.location.origin + "/pricing",
                });
                
                if (upgradeResult?.error) {
                  setErrorMsg(
                    upgradeResult.error.message || "Failed to start payment checkout session."
                  );
                }
              } catch (err: any) {
                console.error("Stripe upgrade error:", err);
                setErrorMsg(
                  err.message || "Account created, but checkout redirect failed. Please log in and subscribe."
                );
              }
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
    <div className="auth-card" style={{ maxWidth: "460px" }}>
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

        {/* PACKAGE SELECTOR */}
        <div className="plan-selector-container">
          <label className="auth-label">Select package subscription</label>
          <div className="billing-toggle-wrapper">
            <button
              type="button"
              className={`billing-toggle-btn${billingInterval === "monthly" ? " active" : ""}`}
              onClick={() => setBillingInterval("monthly")}
              disabled={isPending}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`billing-toggle-btn${billingInterval === "annual" ? " active" : ""}`}
              onClick={() => setBillingInterval("annual")}
              disabled={isPending}
            >
              Annual (-20%)
            </button>
          </div>
          <div className="plan-select-grid">
            {[
              { id: "starter", name: "Starter", monthly: "$199", annual: "$159" },
              { id: "professional", name: "Pro", monthly: "$499", annual: "$399" },
              { id: "firm", name: "Firm", monthly: "$999", annual: "$799" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`plan-select-card${selectedPlan === p.id ? " active" : ""}`}
                onClick={() => setSelectedPlan(p.id)}
                disabled={isPending}
              >
                <div className="plan-select-name">{p.name}</div>
                <div className="plan-select-price">
                  {billingInterval === "monthly" ? p.monthly : p.annual}/mo
                </div>
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="auth-button" disabled={isPending}>
          {isPending ? "Creating account..." : "Subscribe & Create account"}
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

export default function SignupPage() {
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
          Loading signup...
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
