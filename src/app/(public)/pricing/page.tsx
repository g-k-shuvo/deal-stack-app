"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";


const plans = [
  {
    name: "Starter",
    price: { monthly: 199, annual: 159 },
    desc: "For solo brokers and advisors managing a handful of active deals at a time.",
    ctaVariant: "outline",
    included: [
      "Up to 10 active deals",
      "Deal pipeline management",
      "AI document analysis (50 docs/mo)",
      "CIM & teaser generator",
      "Basic financial modeling",
      "1 virtual data room",
      "Email support",
    ],
    excluded: ["Buyer matching AI", "White-label branding", "Team seats"],
  },
  {
    name: "Professional",
    price: { monthly: 499, annual: 399 },
    desc: "For growing advisory practices that need AI firepower across their full deal pipeline.",
    ctaVariant: "primary",
    featured: true,
    included: [
      "Unlimited active deals",
      "Full pipeline management",
      "AI document analysis (unlimited)",
      "All document generators",
      "Advanced financial modeling",
      "Unlimited data rooms",
      "AI buyer matching",
      "White-label branding",
      "Up to 3 team seats",
      "Priority support",
    ],
    excluded: [],
  },
  {
    name: "Firm",
    price: { monthly: 999, annual: 799 },
    desc: "For multi-advisor firms that need team collaboration, advanced analytics, and custom workflows.",
    ctaVariant: "outline",
    included: [
      "Everything in Professional",
      "Unlimited team seats",
      "Team-level pipeline views",
      "Custom deal stages & workflows",
      "Firm-wide reporting & analytics",
      "API access",
      "SSO & advanced security",
      "Dedicated success manager",
      "Custom integrations",
      "SLA & uptime guarantee",
    ],
    excluded: [],
  },
];

const comparisonRows = [
  { section: "Deal Management" },
  { feature: "Active deals", values: ["10", "Unlimited", "Unlimited"] },
  {
    feature: "Pipeline views (Kanban, list)",
    values: ["✓", "✓", "✓"],
    highlight: [false, true, false],
  },
  { feature: "AI deal scoring", values: ["—", "✓", "✓"], highlight: [false, true, false] },
  { feature: "Custom pipeline stages", values: ["—", "—", "✓"] },
  { section: "AI Capabilities" },
  { feature: "Document analysis", values: ["50/mo", "Unlimited", "Unlimited"] },
  { feature: "Buyer matching AI", values: ["—", "✓", "✓"] },
  { feature: "Financial modeling", values: ["Basic", "Advanced", "Advanced"] },
  { feature: "Prospect identification", values: ["—", "✓", "✓"] },
  { section: "Document Generation" },
  { feature: "CIM generator", values: ["✓", "✓", "✓"] },
  { feature: "Teaser & blind profile", values: ["✓", "✓", "✓"] },
  { feature: "LOI & NDA drafting", values: ["—", "✓", "✓"] },
  { feature: "White-label branding", values: ["—", "✓", "✓"] },
  { section: "Data Room & Security" },
  { feature: "Virtual data rooms", values: ["1", "Unlimited", "Unlimited"] },
  { feature: "NDA gating", values: ["✓", "✓", "✓"] },
  { feature: "Audit trail", values: ["✓", "✓", "✓"] },
  { feature: "SSO", values: ["—", "—", "✓"] },
  { section: "Team & Support" },
  { feature: "Team seats", values: ["1", "3", "Unlimited"] },
  { feature: "Support", values: ["Email", "Priority", "Dedicated CSM"] },
  { feature: "API access", values: ["—", "—", "✓"] },
];

const faqs = [
  {
    q: "Is there a free trial?",
    a: "Yes — all plans include a 14-day free trial, no credit card required. During early access, trial periods may be extended.",
  },
  {
    q: "Can I change plans later?",
    a: "Absolutely. You can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades take effect at your next billing cycle.",
  },
  {
    q: 'What counts as an "active deal"?',
    a: "Any deal in your pipeline that is not archived or closed. You can archive completed deals at any time to free up slots on the Starter plan.",
  },
  {
    q: "Is my client data secure?",
    a: "Yes. All data is encrypted at rest and in transit with 256-bit AES encryption. We never use your deal data to train our models without explicit consent.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes — pay annually and save 20% on any plan. Annual plans are billed upfront and are non-refundable after 30 days.",
  },
  {
    q: "What integrations are available?",
    a: "DealStack integrates with Gmail, Outlook, Dropbox, Google Drive, DocuSign, and major CRMs. The Firm plan includes API access for custom integrations.",
  },
  {
    q: "Can I use DealStack as a solo advisor?",
    a: "Absolutely — the Starter and Professional plans are built with solo practitioners in mind. No team required.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "You retain access to export all your data for 30 days after cancellation. After 30 days, your data is permanently deleted from our servers.",
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handlePlanSelect = async (planName: string) => {
    const planKey = planName.toLowerCase();
    if (!session) {
      router.push(`/signup?plan=${planKey}&billing=${billing}`);
      return;
    }
    setLoadingPlan(planKey);
    try {
      const res = await authClient.subscription.upgrade({
        plan: planKey,
        annual: billing === "annual",
        successUrl: window.location.origin + "/dashboard",
        cancelUrl: window.location.origin + "/pricing",
      });
      if (res?.error) {
        alert(res.error.message || "Failed to start checkout session.");
      }
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <>
      {/* PAGE HERO */}
      <div className="ds-page-hero">
        <div className="ds-page-hero-bg" />
        <div className="ds-page-hero-content">
          <div className="ds-page-label">Simple Pricing</div>
          <h1>Pricing built for deal professionals</h1>
          <p>
            No per-seat fees that punish team growth. No hidden charges. Pay for what you use and
            scale as your practice grows.
          </p>
          <div className="billing-toggle">
            <button
              className={`toggle-option${billing === "monthly" ? " active" : ""}`}
              onClick={() => setBilling("monthly")}
            >
              Monthly
            </button>
            <button
              className={`toggle-option${billing === "annual" ? " active" : ""}`}
              onClick={() => setBilling("annual")}
            >
              Annual <span className="save-badge">Save 20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRICING CARDS */}
      <div className="pricing-section">
        <div className="pricing-grid">
          {plans.map((plan) => (
            <div className={`plan-card${plan.featured ? " featured" : ""}`} key={plan.name}>
              {plan.featured && <div className="plan-badge">Most Popular</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">
                <div className={`plan-price-num${plan.featured ? " gradient" : ""}`}>
                  ${billing === "monthly" ? plan.price.monthly : plan.price.annual}
                </div>
                <div className="plan-price-period">/mo</div>
              </div>
              <p className="plan-desc">{plan.desc}</p>
              <button
                onClick={() => handlePlanSelect(plan.name)}
                disabled={loadingPlan !== null}
                className={`plan-cta ${plan.ctaVariant}`}
                style={{ width: "100%", border: "none", cursor: "pointer" }}
              >
                {loadingPlan === plan.name.toLowerCase()
                  ? "Redirecting..."
                  : session
                  ? `Subscribe to ${plan.name}`
                  : "Get Started"}
              </button>
              <hr className="plan-divider" />
              <div className="plan-features">
                {plan.included.map((f) => (
                  <div className="plan-feature" key={f}>
                    <div className={`plan-feature-check${plan.featured ? " green" : ""}`}>✓</div>
                    {f}
                  </div>
                ))}
                {plan.excluded.map((f) => (
                  <div className="plan-feature" key={f}>
                    <div className="plan-feature-cross">✕</div>
                    <span style={{ color: "var(--text-dim)" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ENTERPRISE */}
      <section className="ds-enterprise">
        <div className="enterprise-inner">
          <div>
            <h2>Need something custom?</h2>
            <p>
              Large advisory firms and M&A boutiques with specialized needs — custom AI training,
              compliance requirements, or white-label deployments — talk to our team about a bespoke
              arrangement.
            </p>
            <div className="enterprise-features">
              {[
                "Custom AI training",
                "White-label deployment",
                "Compliance packages",
                "Dedicated infrastructure",
                "Custom SLA",
              ].map((f) => (
                <span className="enterprise-feature" key={f}>
                  {f}
                </span>
              ))}
            </div>
          </div>
          <Link href="/contact" className="ds-btn-primary">
            Contact Sales →
          </Link>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="ds-comparison">
        <div className="comparison-header">
          <div className="ds-section-label">Compare Plans</div>
          <h2 className="ds-section-title">Full feature comparison</h2>
        </div>
        <table className="compare-table">
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Feature</th>
              <th>Starter</th>
              <th className="compare-highlight">Professional</th>
              <th>Firm</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, i) => {
              if ("section" in row) {
                return (
                  <tr className="section-row" key={i}>
                    <td colSpan={4}>{row.section}</td>
                  </tr>
                );
              }
              return (
                <tr key={i}>
                  <td>{row.feature}</td>
                  {row.values.map((v, j) => (
                    <td key={j} className={j === 1 ? "compare-highlight" : ""}>
                      <span
                        className={
                          v === "✓" ? (j === 1 ? "check green" : "check") : v === "—" ? "cross" : ""
                        }
                      >
                        {v}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* FAQ */}
      <section className="ds-faq">
        <div style={{ maxWidth: 640, marginBottom: 48 }}>
          <div className="ds-section-label">FAQ</div>
          <h2 className="ds-section-title">Common questions</h2>
        </div>
        <div className="faq-grid">
          {faqs.map((faq) => (
            <div className="faq-item" key={faq.q}>
              <h4>{faq.q}</h4>
              <p>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="ds-cta-band">
        <div className="cta-band-inner">
          <h2>Start your free trial today</h2>
          <p>
            No credit card required. 14-day free trial on all plans. Early access pricing locked in
            for life.
          </p>
          <Link href={session ? "/pricing" : "/signup"} className="ds-btn-primary ds-btn-lg">
            {session ? "Choose a plan above" : "Get Started →"}
          </Link>
        </div>
      </section>
    </>
  );
}
