import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features — DealStack",
  description:
    "Explore all of DealStack's AI-powered features for business brokers and M&A advisors.",
};

export default function FeaturesPage() {
  return (
    <>
      {/* PAGE HERO */}
      <div className="ds-page-hero">
        <div className="ds-page-hero-bg" />
        <div className="ds-page-hero-content">
          <div className="ds-page-label">Platform Features</div>
          <h1>Every Tool an M&A Advisor Actually Needs</h1>
          <p>
            DealStack replaces the patchwork of spreadsheets, generic CRMs, and expensive
            consultants with a single AI-powered platform built for deal professionals.
          </p>
          <div className="btn-row">
            <Link href="/contact" className="ds-btn-primary">
              Get Early Access →
            </Link>
            <Link href="/pricing" className="ds-btn-outline">
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* FEATURE 1: PIPELINE */}
      <section id="pipeline" className="ds-section">
        <div className="feature-section">
          <div className="feature-text">
            <div className="ds-section-label">Deal Pipeline</div>
            <h2 className="ds-section-title">Your entire deal flow, visualized and managed</h2>
            <p className="ds-section-sub">
              A pipeline purpose-built for M&A — not a generic sales CRM. Track every deal from
              first conversation to wire transfer with deal-specific fields and AI-powered insights.
            </p>
            <div className="feature-list">
              {[
                {
                  title: "Kanban & list views",
                  desc: "Visualize your entire pipeline at a glance, with drag-and-drop stage management.",
                },
                {
                  title: "AI deal scoring",
                  desc: "Our AI evaluates each deal's close probability and surfaces the ones that need your attention.",
                },
                {
                  title: "Custom M&A stages",
                  desc: "Pre-configured for standard M&A lifecycle stages with full customization available.",
                },
                {
                  title: "Task & deadline tracking",
                  desc: "Never miss a critical deadline with automated reminders tied to each deal's timeline.",
                },
              ].map((item) => (
                <div className="feature-item" key={item.title}>
                  <div className="feature-check">✓</div>
                  <div className="feature-item-text">
                    <div className="feature-item-title">{item.title}</div>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="feature-visual"
            style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)" }}
          >
            <div className="feature-visual-inner">
              <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                {["All Deals", "Active", "Closed"].map((label, i) => (
                  <div
                    key={label}
                    style={{
                      background: i === 1 ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.05)",
                      border: i === 1 ? "1px solid rgba(37,99,235,0.3)" : undefined,
                      borderRadius: 5,
                      padding: "5px 10px",
                      fontSize: "0.7rem",
                      color: i === 1 ? "#93c5fd" : "var(--text-muted)",
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 6,
                  flex: 1,
                }}
              >
                {[
                  { label: "Prospecting", color: "37,99,235", items: [0.1, 0.06] },
                  { label: "Due Diligence", color: "59,130,246", items: [0.1] },
                  { label: "Closing", color: "16,185,129", items: [0.1] },
                ].map((col) => (
                  <div
                    key={col.label}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 6,
                      padding: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: "var(--text-dim)",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      {col.label}
                    </div>
                    {col.items.map((opacity, i) => (
                      <div
                        key={i}
                        style={{
                          background: `rgba(${col.color},${opacity})`,
                          border: `1px solid rgba(${col.color},${opacity + 0.05})`,
                          borderRadius: 5,
                          padding: 7,
                          marginBottom: i < col.items.length - 1 ? 5 : 0,
                        }}
                      >
                        <div
                          style={{
                            height: 5,
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: 2,
                            width: "70%",
                            marginBottom: 4,
                          }}
                        />
                        <div
                          style={{
                            height: 4,
                            background: "rgba(255,255,255,0.06)",
                            borderRadius: 2,
                            width: "50%",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 2: DUE DILIGENCE */}
      <section id="due-diligence" className="ds-section" style={{ background: "#f8faff" }}>
        <div className="feature-section feature-reverse">
          <div className="feature-text">
            <div className="ds-section-label">Due Diligence AI</div>
            <h2 className="ds-section-title">Review hundreds of documents in minutes, not weeks</h2>
            <p className="ds-section-sub">
              Upload any combination of financials, contracts, HR records, and operational
              documents. Our AI reads everything, cross-references key data, and produces a
              structured risk report.
            </p>
            <div className="feature-list">
              {[
                {
                  title: "Automated risk flagging",
                  desc: "Instantly surfaces red flags, inconsistencies, and items requiring human review.",
                },
                {
                  title: "Financial data extraction",
                  desc: "Pulls revenue, EBITDA, debt, and key ratios directly from uploaded financials.",
                },
                {
                  title: "Contract analysis",
                  desc: "Reviews customer contracts, leases, and supplier agreements for concentration risk and change-of-control clauses.",
                },
                {
                  title: "Q&A over your documents",
                  desc: "Ask any question about the target's documents in plain English and get an instant, cited answer.",
                },
              ].map((item) => (
                <div className="feature-item" key={item.title}>
                  <div className="feature-check">✓</div>
                  <div className="feature-item-text">
                    <div className="feature-item-title">{item.title}</div>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="feature-visual"
            style={{ background: "linear-gradient(135deg,#f5f3ff,#ede9fe)" }}
          >
            <div className="feature-visual-inner">
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "rgba(16,185,129,0.8)",
                  }}
                />
                <div
                  style={{
                    height: 5,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    width: "55%",
                  }}
                />
                <div
                  style={{
                    marginLeft: "auto",
                    height: 5,
                    background: "rgba(16,185,129,0.3)",
                    borderRadius: 2,
                    width: "20%",
                  }}
                />
              </div>
              <div
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: "rgba(245,158,11,0.9)",
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  ⚠ Risk flagged
                </div>
                <div
                  style={{
                    height: 4,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 2,
                    width: "80%",
                    marginBottom: 3,
                  }}
                />
                <div
                  style={{
                    height: 4,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 2,
                    width: "65%",
                  }}
                />
              </div>
              <div
                style={{
                  background: "rgba(37,99,235,0.08)",
                  border: "1px solid rgba(37,99,235,0.15)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: "rgba(100,130,255,0.9)",
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  💬 AI Analysis
                </div>
                {["90%", "75%", "55%"].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      height: 4,
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: 2,
                      width: w,
                      marginBottom: 3,
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    height: 5,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 2,
                    flex: 1,
                  }}
                />
                <div
                  style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                    borderRadius: 5,
                    padding: "4px 10px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  Ask AI
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 3: DOCUMENTS */}
      <section id="documents" className="ds-section">
        <div className="feature-section">
          <div className="feature-text">
            <div className="ds-section-label">Document Drafting</div>
            <h2 className="ds-section-title">Professional M&A documents in minutes</h2>
            <p className="ds-section-sub">
              Generate CIMs, teasers, NDAs, LOIs, and due diligence checklists with AI that
              understands M&A document conventions — then edit to your standards.
            </p>
            <div className="feature-list">
              {[
                {
                  title: "CIM generator",
                  desc: "Produce a full Confidential Information Memorandum from your deal data and uploaded financials.",
                },
                {
                  title: "Teaser & blind profiles",
                  desc: "One-page teasers for early-stage buyer outreach, anonymized to protect seller confidentiality.",
                },
                {
                  title: "LOI & NDA drafting",
                  desc: "AI-drafted letters of intent and NDAs based on deal structure and your firm's preferred language.",
                },
                {
                  title: "Branded output",
                  desc: "All documents output in your firm's branding — letterhead, colors, and signature blocks included.",
                },
              ].map((item) => (
                <div className="feature-item" key={item.title}>
                  <div className="feature-check">✓</div>
                  <div className="feature-item-text">
                    <div className="feature-item-title">{item.title}</div>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="feature-visual"
            style={{ background: "linear-gradient(135deg,#fffbeb,#fef3c7)" }}
          >
            <div className="feature-visual-inner">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {[
                  { label: "CIM", color: "245,158,11" },
                  { label: "Teaser", color: "37,99,235" },
                  { label: "LOI", color: null },
                  { label: "NDA", color: null },
                ].map(({ label, color }) => (
                  <div
                    key={label}
                    style={{
                      background: color ? `rgba(${color},0.12)` : "rgba(255,255,255,0.04)",
                      border: color
                        ? `1px solid rgba(${color},0.25)`
                        : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 100,
                      padding: "3px 10px",
                      fontSize: "0.65rem",
                      color: color
                        ? label === "CIM"
                          ? "rgba(245,158,11,0.9)"
                          : "#93c5fd"
                        : "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                {["50%", "90%", "80%", "70%"].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      height: i === 0 ? 8 : 5,
                      background: `rgba(255,255,255,${i === 0 ? 0.12 : 0.06})`,
                      borderRadius: i === 0 ? 3 : 2,
                      width: w,
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderRadius: 6,
                  padding: "7px 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(245,158,11,0.9)",
                    fontWeight: 600,
                  }}
                >
                  Ready to export
                </span>
                <div
                  style={{
                    background: "rgba(245,158,11,0.3)",
                    borderRadius: 4,
                    padding: "3px 8px",
                    fontSize: "0.65rem",
                    color: "rgba(245,158,11,0.95)",
                    fontWeight: 700,
                  }}
                >
                  Download
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ALL FEATURES GRID */}
      <section className="ds-section ds-section-alt">
        <div style={{ marginBottom: 56 }}>
          <div className="ds-section-label">Complete Feature List</div>
          <h2 className="ds-section-title">Everything included in DealStack</h2>
        </div>
        <div className="features-full-grid">
          {[
            {
              icon: "🎯",
              title: "Prospect Identification",
              desc: "AI scans databases and news for acquisition targets matching your client's criteria.",
              badge: "new",
              badgeLabel: "New",
            },
            {
              icon: "📊",
              title: "Financial Modeling",
              desc: "EBITDA valuation, DCF analysis, and scenario modeling from uploaded financials.",
              badge: "",
              badgeLabel: "Core",
            },
            {
              icon: "🔒",
              title: "Virtual Data Room",
              desc: "Encrypted document sharing with granular permissions, NDA gating, and audit trails.",
              badge: "",
              badgeLabel: "Core",
            },
            {
              icon: "🤝",
              title: "Buyer-Seller Matching",
              desc: "AI-ranked buyer lists filtered by acquisition criteria, deal size, and industry focus.",
              badge: "new",
              badgeLabel: "New",
            },
            {
              icon: "📑",
              title: "Document Analysis",
              desc: "Upload any documents and ask questions in plain English — cited, accurate answers instantly.",
              badge: "",
              badgeLabel: "Core",
            },
            {
              icon: "✍️",
              title: "Term Sheet Generator",
              desc: "Draft initial term sheets from deal data and market comps in minutes.",
              badge: "",
              badgeLabel: "Core",
            },
            {
              icon: "📈",
              title: "Client Reporting",
              desc: "Branded progress reports delivered automatically to sellers throughout the deal process.",
              badge: "",
              badgeLabel: "Core",
            },
            {
              icon: "📬",
              title: "Buyer Outreach Automation",
              desc: "Personalized outreach sequences to qualified buyers, tracked and managed in one place.",
              badge: "soon",
              badgeLabel: "Coming soon",
            },
            {
              icon: "🗂️",
              title: "Due Diligence Checklists",
              desc: "Industry-specific DD checklists generated automatically for each deal type.",
              badge: "",
              badgeLabel: "Core",
            },
            {
              icon: "💬",
              title: "Deal Communication Hub",
              desc: "Centralize all deal-related emails, messages, and notes in a single deal workspace.",
              badge: "soon",
              badgeLabel: "Coming soon",
            },
            {
              icon: "🏦",
              title: "SBA Financing Analysis",
              desc: "Automatically assess SBA 7(a) eligibility and financing structure for each deal.",
              badge: "new",
              badgeLabel: "New",
            },
            {
              icon: "⚡",
              title: "E-Signature Integration",
              desc: "Send NDAs, LOIs, and closing documents for signature directly from DealStack.",
              badge: "soon",
              badgeLabel: "Coming soon",
            },
          ].map((feat) => (
            <div className="feat-card" key={feat.title}>
              <span className="feat-icon">{feat.icon}</span>
              <h4>{feat.title}</h4>
              <p>{feat.desc}</p>
              <span className={`feat-badge${feat.badge ? " " + feat.badge : ""}`}>
                {feat.badgeLabel}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS TIMELINE */}
      <section className="ds-section">
        <div style={{ maxWidth: 640, marginBottom: 56 }}>
          <div className="ds-section-label">Process</div>
          <h2 className="ds-section-title">How DealStack fits into your workflow</h2>
          <p className="ds-section-sub">
            DealStack is designed to feel like a natural extension of your existing practice — not a
            replacement for how you work.
          </p>
        </div>
        <div className="steps-timeline">
          {[
            {
              n: "1",
              title: "Onboard a new listing",
              body: "Upload the seller's financials, tax returns, and key documents. DealStack extracts key metrics, flags risks, and pre-populates your deal profile automatically.",
              chips: ["OCR extraction", "Auto data entry", "Risk summary"],
            },
            {
              n: "2",
              title: "Generate your marketing materials",
              body: "With one click, produce a branded teaser and full CIM. Customize any section, then publish your secure data room and teaser to your buyer universe.",
              chips: ["CIM in hours", "Teaser & blind profile", "Branded PDFs"],
            },
            {
              n: "3",
              title: "Identify and engage buyers",
              body: "DealStack surfaces the best-fit buyers from its database and your own contacts, ranked by acquisition criteria. Track NDA signings, data room access, and buyer interest automatically.",
              chips: ["AI buyer matching", "NDA tracking", "Data room analytics"],
            },
            {
              n: "4",
              title: "Negotiate and close",
              body: "Draft LOIs, manage buyer Q&A through the data room, and track deal milestones through to closing. Keep clients updated with automated progress reports.",
              chips: ["LOI drafting", "Milestone tracking", "Client reports"],
            },
          ].map((step) => (
            <div className="timeline-step" key={step.n}>
              <div className="step-circle">{step.n}</div>
              <div className="step-body">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <div className="step-chips">
                  {step.chips.map((chip) => (
                    <span className="step-chip" key={chip}>
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY */}
      <section className="ds-section ds-section-alt" id="security">
        <div style={{ maxWidth: 640, marginBottom: 48 }}>
          <div className="ds-section-label">Security &amp; Compliance</div>
          <h2 className="ds-section-title">Enterprise-grade security for sensitive deal data</h2>
          <p className="ds-section-sub">
            M&A deals involve some of the most confidential business data in existence. DealStack is
            built with that responsibility in mind.
          </p>
        </div>
        <div className="security-grid">
          {[
            {
              icon: "🔐",
              title: "256-bit AES Encryption",
              desc: "All data encrypted at rest and in transit using bank-grade encryption standards.",
            },
            {
              icon: "👤",
              title: "Granular Access Controls",
              desc: "Control exactly who sees what — down to the individual document or data room folder.",
            },
            {
              icon: "📋",
              title: "Full Audit Trail",
              desc: "Every document view, download, and access event is logged with timestamp and user identity.",
            },
            {
              icon: "🛡️",
              title: "SOC 2 Type II",
              desc: "Annual third-party security audits with SOC 2 compliance certification (in progress).",
            },
            {
              icon: "🌐",
              title: "U.S. Data Residency",
              desc: "All data stored on U.S.-based servers. No offshore processing of confidential deal data.",
            },
            {
              icon: "🔑",
              title: "Two-Factor Authentication",
              desc: "Mandatory 2FA for all users, with SSO support for enterprise plans.",
            },
          ].map((card) => (
            <div className="security-card" key={card.title}>
              <span className="icon">{card.icon}</span>
              <h4>{card.title}</h4>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="ds-cta-band"
        style={{ background: "#f0f6ff", borderTop: "1px solid #bfdbfe" }}
      >
        <div className="cta-band-inner">
          <h2>See DealStack in action</h2>
          <p>
            Join hundreds of business brokers and M&A advisors already on the waitlist. Early access
            is limited.
          </p>
          <div className="btn-row">
            <Link href="/contact" className="ds-btn-primary">
              Get Early Access →
            </Link>
            <Link href="/pricing" className="ds-btn-outline">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
