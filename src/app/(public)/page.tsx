import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DealStack — AI-Powered Deal Tools for Business Brokers & M&A Advisors",
  description:
    "AI-powered deal management software for business brokers and M&A advisors. Streamline your pipeline, automate due diligence, and close more deals.",
};

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="ds-hero" id="home">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Now in Early Access — Join 500+ Advisors
        </div>
        <h1>
          AI-Powered Deal Tools for
          <br />
          <span>Business Brokers</span> &amp; M&amp;A Advisors
        </h1>
        <p className="hero-sub">
          Streamline your entire deal pipeline — from prospect identification to
          closing — with purpose-built AI that understands the language of
          M&amp;A.
        </p>
        <div className="hero-btns">
          <Link href="/contact" className="ds-btn-primary">
            Get Early Access →
          </Link>
          <Link href="/features" className="ds-btn-secondary">
            See All Features
          </Link>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num">3×</div>
            <div className="hero-stat-label">Faster due diligence</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">500+</div>
            <div className="hero-stat-label">Advisors on waitlist</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">$2B+</div>
            <div className="hero-stat-label">Deals tracked in beta</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">40%</div>
            <div className="hero-stat-label">More deals closed</div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <div className="ds-trusted">
        <p>Trusted by brokers and advisors at</p>
        <div className="trusted-logos">
          <span className="trusted-logo">Frontier Business Advisors</span>
          <span className="trusted-logo">Cascade M&amp;A Group</span>
          <span className="trusted-logo">Meridian Business Brokers</span>
          <span className="trusted-logo">Summit Advisory Partners</span>
          <span className="trusted-logo">Keystone Deal Group</span>
        </div>
      </div>

      {/* AI SOLUTIONS */}
      <section className="ds-section" id="features">
        <div className="ds-section-header">
          <div className="ds-section-label">AI-Powered Capabilities</div>
          <h2 className="ds-section-title">
            Curated AI Solutions for Your M&amp;A Practice
          </h2>
          <p className="ds-section-sub">
            Built specifically for business brokers and M&amp;A advisors — not
            generic software retrofitted for your industry.
          </p>
        </div>
        <div className="solutions-grid">
          {[
            {
              icon: "🎯",
              title: "Automated Prospect Identification",
              desc: "Leverage AI to scan industry databases, news sources, and financial reports for acquisition targets that match your client's criteria — pre-qualified and ready to pitch.",
            },
            {
              icon: "📑",
              title: "Intelligent Due Diligence Analysis",
              desc: "Upload target company documents and let our AI surface key risks, opportunities, and red flags in minutes — not weeks of manual review.",
            },
            {
              icon: "📊",
              title: "AI-Powered Financial Modeling",
              desc: "Generate valuation models, cash flow forecasts, and deal structure scenarios from raw financial data — institutional quality, built in hours.",
            },
            {
              icon: "⚡",
              title: "Smart Deal Term Sheet Generator",
              desc: "Draft initial term sheets and LOIs using AI that understands deal structures, market comps, and your client's mandate — first draft in minutes, not days.",
            },
          ].map((item) => (
            <div className="solution-card" key={item.title}>
              <div className="solution-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <Link href="/features" className="card-link">
                Learn more →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORM CAPABILITIES */}
      <section className="ds-section ds-section-alt" id="capabilities">
        <div className="ds-section-header">
          <div className="ds-section-label">Platform Capabilities</div>
          <h2 className="ds-section-title">Build a Smarter M&amp;A Practice</h2>
          <p className="ds-section-sub">
            Every tool in DealStack is designed around the real workflows of
            successful business brokers.
          </p>
        </div>
        <div className="cap-grid">
          {[
            {
              num: "01",
              title: "Deal Pipeline Management",
              desc: "Track every deal from first contact to closing with a visual pipeline built for M&A. See stage, probability, projected value, and next actions at a glance.",
              tags: ["Kanban view", "Deal scoring", "Alerts"],
            },
            {
              num: "02",
              title: "Buyer & Seller Matching",
              desc: "AI-powered matching engine that surfaces the most relevant buyers for your listings, ranked by acquisition criteria, financial capacity, and deal history.",
              tags: ["AI matching", "Buyer profiles", "Outreach"],
            },
            {
              num: "03",
              title: "Secure Data Room",
              desc: "Share confidential deal documents through a fully encrypted, access-controlled virtual data room with granular permissions and activity tracking.",
              tags: ["256-bit encryption", "NDA gate", "Audit trail"],
            },
            {
              num: "04",
              title: "Document Drafting AI",
              desc: "Generate CIMs, teasers, NDAs, LOIs, and due diligence checklists with AI that knows M&A document conventions and your firm's preferred style.",
              tags: ["CIM generator", "LOI drafting", "NDA builder"],
            },
            {
              num: "05",
              title: "Valuation Engine",
              desc: "Run enterprise-quality valuations using EBITDA multiples, DCF analysis, and comparable transactions — calibrated to lower middle-market deal sizes.",
              tags: ["EBITDA comps", "DCF model", "SBA financing"],
            },
            {
              num: "06",
              title: "Client Reporting Dashboard",
              desc: "Deliver beautiful, branded progress reports to clients automatically — showing deal activity, buyer interest, market feedback, and timeline projections.",
              tags: ["Auto-reports", "Branded PDFs", "Real-time data"],
            },
          ].map((item) => (
            <div className="cap-card" key={item.num}>
              <div className="cap-num">{item.num}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <div className="cap-tags">
                {item.tags.map((tag) => (
                  <span className="cap-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT PREVIEW */}
      <section className="ds-section ds-screenshots" id="demo">
        <div className="ds-section-header">
          <div className="ds-section-label">Product Preview</div>
          <h2 className="ds-section-title">See DealStack in Action</h2>
          <p className="ds-section-sub">
            A glimpse of what your M&amp;A practice looks like running on
            DealStack.
          </p>
        </div>
        <div className="screenshots-scroll">
          {/* Deal Pipeline Card */}
          <div className="screenshot-card">
            <div className="screenshot-img deal-pipeline">
              <div className="fake-ui">
                <div className="fake-header" />
                <div className="fake-stat-row" style={{ marginTop: 4 }}>
                  <div className="fake-stat" />
                  <div
                    className="fake-stat"
                    style={{ background: "rgba(124,58,237,0.07)" }}
                  />
                  <div
                    className="fake-stat"
                    style={{ background: "rgba(5,150,105,0.07)" }}
                  />
                </div>
                <div className="fake-table" style={{ marginTop: 5 }}>
                  {[
                    { dot: "", w1: "45%", w2: "18%" },
                    { dot: "green", w1: "58%", w2: "14%" },
                    { dot: "gold", w1: "37%", w2: "20%" },
                    { dot: "purple", w1: "50%", w2: "16%" },
                  ].map((r, i) => (
                    <div className="fake-table-row" key={i}>
                      <div className={`fake-dot${r.dot ? " " + r.dot : ""}`} />
                      <div
                        className="fake-line"
                        style={{ width: r.w1 }}
                      />
                      <div
                        className="fake-line"
                        style={{ width: r.w2, marginLeft: "auto" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="screenshot-info">
              <h4>Deal Pipeline</h4>
              <p>Track every deal stage from prospecting to close</p>
            </div>
          </div>

          {/* Due Diligence Card */}
          <div className="screenshot-card">
            <div className="screenshot-img due-diligence">
              <div className="fake-ui">
                <div className="fake-header" style={{ width: "65%" }} />
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginTop: 5,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: "36%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {[
                      "rgba(37,99,235,0.1)",
                      "rgba(0,0,0,0.04)",
                      "rgba(0,0,0,0.04)",
                    ].map((bg, i) => (
                      <div
                        key={i}
                        style={{
                          background: bg,
                          border: `1px solid ${i === 0 ? "rgba(37,99,235,0.18)" : "rgba(0,0,0,0.06)"}`,
                          borderRadius: 4,
                          height: 20,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 5,
                    }}
                  >
                    <div className="fake-line" style={{ width: "88%" }} />
                    <div className="fake-line" style={{ width: "72%" }} />
                    <div
                      style={{
                        background: "rgba(217,119,6,0.1)",
                        border: "1px solid rgba(217,119,6,0.18)",
                        borderRadius: 4,
                        height: 18,
                        marginTop: 2,
                      }}
                    />
                    <div className="fake-line" style={{ width: "80%" }} />
                    <div
                      style={{
                        background: "rgba(5,150,105,0.1)",
                        border: "1px solid rgba(5,150,105,0.18)",
                        borderRadius: 4,
                        height: 18,
                        marginTop: 2,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="screenshot-info">
              <h4>Due Diligence AI</h4>
              <p>Analyze hundreds of documents in minutes</p>
            </div>
          </div>

          {/* Financial Modeling Card */}
          <div className="screenshot-card">
            <div className="screenshot-img financial-model">
              <div className="fake-ui">
                <div className="fake-header" style={{ width: "55%" }} />
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 4,
                    marginTop: 6,
                    height: 52,
                  }}
                >
                  {[34, 46, 36, 52, 40, 48].map((h, i) => (
                    <div
                      key={i}
                      className={i < 4 ? "fake-bar green" : i === 4 ? "fake-bar" : "fake-bar alt"}
                      style={{
                        height: h,
                        width: "16%",
                        borderRadius: "3px 3px 0 0",
                        opacity: i >= 4 ? 0.45 : 1,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    height: 1,
                    background: "rgba(0,0,0,0.08)",
                    margin: "6px 0",
                  }}
                />
                <div className="fake-stat-row">
                  <div
                    className="fake-stat"
                    style={{ background: "rgba(5,150,105,0.07)" }}
                  />
                  <div className="fake-stat" />
                  <div
                    className="fake-stat"
                    style={{ background: "rgba(124,58,237,0.07)" }}
                  />
                </div>
              </div>
            </div>
            <div className="screenshot-info">
              <h4>Financial Modeling</h4>
              <p>Institutional-quality valuations in hours</p>
            </div>
          </div>

          {/* Document Drafting Card */}
          <div className="screenshot-card">
            <div className="screenshot-img document-ai">
              <div className="fake-ui">
                <div className="fake-header" style={{ width: "48%" }} />
                <div className="fake-table" style={{ marginTop: 6 }}>
                  <div
                    className="fake-table-row"
                    style={{ height: 22, padding: "0 8px" }}
                  >
                    <div className="fake-line" style={{ width: "65%" }} />
                  </div>
                  <div
                    className="fake-table-row"
                    style={{
                      height: 22,
                      padding: "0 8px",
                      background: "rgba(37,99,235,0.07)",
                      border: "1px solid rgba(37,99,235,0.12)",
                      borderRadius: 4,
                    }}
                  >
                    <div
                      className="fake-line"
                      style={{
                        width: "50%",
                        background: "rgba(37,99,235,0.22)",
                      }}
                    />
                  </div>
                  <div
                    className="fake-table-row"
                    style={{ height: 22, padding: "0 8px" }}
                  >
                    <div className="fake-line" style={{ width: "58%" }} />
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 6,
                    background: "rgba(37,99,235,0.06)",
                    border: "1px solid rgba(37,99,235,0.14)",
                    borderRadius: 5,
                    padding: 7,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div className="fake-line" style={{ width: "78%" }} />
                  <div className="fake-line" style={{ width: "62%" }} />
                </div>
              </div>
            </div>
            <div className="screenshot-info">
              <h4>Document Drafting</h4>
              <p>CIMs, teasers &amp; LOIs generated in minutes</p>
            </div>
          </div>

          {/* Buyer Matching Card */}
          <div className="screenshot-card">
            <div className="screenshot-img buyer-search">
              <div className="fake-ui">
                <div
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.07)",
                    borderRadius: 5,
                    height: 22,
                    marginBottom: 7,
                  }}
                />
                <div className="fake-table">
                  {[
                    { dot: "", bg: "rgba(37,99,235,0.07)", border: "rgba(37,99,235,0.13)", line: "48%", tag: "rgba(5,150,105,0.25)" },
                    { dot: "purple", bg: "transparent", border: "transparent", line: "40%", tag: "rgba(37,99,235,0.15)" },
                    { dot: "gold", bg: "transparent", border: "transparent", line: "52%", tag: "rgba(217,119,6,0.2)" },
                  ].map((r, i) => (
                    <div
                      className="fake-table-row"
                      key={i}
                      style={{
                        height: 28,
                        padding: "0 8px",
                        background: r.bg,
                        border: r.border !== "transparent" ? `1px solid ${r.border}` : undefined,
                        borderRadius: r.bg !== "transparent" ? 4 : undefined,
                      }}
                    >
                      <div className={`fake-dot${r.dot ? " " + r.dot : ""}`} />
                      <div className="fake-line" style={{ width: r.line }} />
                      <div
                        style={{
                          marginLeft: "auto",
                          width: 32,
                          height: 13,
                          background: r.tag,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="screenshot-info">
              <h4>Buyer Matching</h4>
              <p>AI surfaces the best-fit buyers for every deal</p>
            </div>
          </div>

          {/* Valuation Card */}
          <div className="screenshot-card">
            <div className="screenshot-img valuation">
              <div className="fake-ui">
                <div className="fake-header" style={{ width: "52%" }} />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 5,
                    marginTop: 6,
                  }}
                >
                  {[
                    { bg: "rgba(37,99,235,0.07)", border: "rgba(37,99,235,0.13)", bar: "fake-bar", bw: "60%" },
                    { bg: "rgba(124,58,237,0.07)", border: "rgba(124,58,237,0.13)", bar: "fake-bar alt", bw: "52%" },
                    { bg: "rgba(5,150,105,0.07)", border: "rgba(5,150,105,0.13)", bar: "fake-bar green", bw: "65%" },
                    { bg: "rgba(217,119,6,0.07)", border: "rgba(217,119,6,0.13)", bar: "fake-bar gold", bw: "58%" },
                  ].map((c, i) => (
                    <div
                      key={i}
                      style={{
                        background: c.bg,
                        border: `1px solid ${c.border}`,
                        borderRadius: 5,
                        height: 38,
                        padding: "5px 7px",
                      }}
                    >
                      <div
                        className="fake-line"
                        style={{ width: "48%", marginBottom: 4 }}
                      />
                      <div
                        className={c.bar}
                        style={{ width: c.bw, height: 5 }}
                      />
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    background: "rgba(0,0,0,0.04)",
                    borderRadius: 4,
                    height: 20,
                  }}
                />
              </div>
            </div>
            <div className="screenshot-info">
              <h4>Valuation Engine</h4>
              <p>Enterprise-grade valuations for lower middle-market</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="ds-section" id="how-it-works">
        <div className="ds-section-header">
          <div className="ds-section-label">How It Works</div>
          <h2 className="ds-section-title">
            Up and running in days, not months
          </h2>
          <p className="ds-section-sub">
            No lengthy implementation. DealStack is designed to fit into your
            existing workflow immediately.
          </p>
        </div>
        <div className="steps-grid">
          {[
            {
              num: "1",
              title: "Connect Your Data",
              desc: "Import existing deals, contacts, and documents in minutes. DealStack connects with your email, CRM, and cloud storage automatically.",
            },
            {
              num: "2",
              title: "Set Your Criteria",
              desc: "Tell DealStack what kinds of deals you focus on — industry, deal size, geography — and the AI configures itself to your practice.",
            },
            {
              num: "3",
              title: "Work Your Pipeline",
              desc: "Use the AI-powered pipeline to manage active deals, generate documents, analyze targets, and communicate with clients and buyers.",
            },
            {
              num: "4",
              title: "Close More Deals",
              desc: "With AI handling the manual work, you spend more time building relationships and closing. Our users average 40% more deals in year one.",
            },
          ].map((step) => (
            <div className="step-card" key={step.num}>
              <div className="step-num-big">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="ds-section ds-section-alt" id="testimonials">
        <div className="ds-section-header">
          <div className="ds-section-label">Testimonials</div>
          <h2 className="ds-section-title">Advisors love DealStack</h2>
          <p className="ds-section-sub">
            Hear from business brokers and M&amp;A advisors already on the
            waitlist.
          </p>
        </div>
        <div className="testi-grid">
          {[
            {
              initials: "MR",
              quote:
                '"The due diligence AI alone is worth it. What used to take my team a week to review, DealStack surfaces in under an hour. It\'s changed how we evaluate targets."',
              name: "Michael R.",
              role: "Managing Partner, Frontier Business Advisors",
            },
            {
              initials: "SC",
              quote:
                '"I\'m a one-person shop competing against big advisory firms. DealStack levels the playing field — I can produce institutional-quality CIMs that used to require a whole team."',
              name: "Sarah C.",
              role: "Principal Broker, Cascade M&A Group",
            },
            {
              initials: "JL",
              quote:
                '"The buyer matching feature is remarkable. It found three strategic acquirers we never would have considered — one ended up being our buyer at a premium valuation."',
              name: "James L.",
              role: "Senior Advisor, Meridian Business Brokers",
            },
          ].map((t) => (
            <div className="testi-card" key={t.initials}>
              <div className="testi-stars">★★★★★</div>
              <p className="testi-quote">{t.quote}</p>
              <div className="testi-author">
                <div className="testi-avatar">{t.initials}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS BAND */}
      <div className="ds-stats-band">
        <div className="stats-grid">
          {[
            { num: "500+", label: "Advisors on the waitlist" },
            { num: "$2B+", label: "Deal value tracked in beta" },
            { num: "3×", label: "Faster due diligence" },
            { num: "95%", label: "Satisfaction in beta" },
          ].map((s) => (
            <div className="stat-item" key={s.num}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="ds-cta-band">
        <div className="cta-band-inner">
          <h2>Ready to transform your M&amp;A practice?</h2>
          <p>
            Join hundreds of business brokers and advisors already on the
            DealStack waitlist. Early access is limited.
          </p>
          <Link href="/contact" className="ds-btn-primary ds-btn-lg">
            Get Early Access →
          </Link>
        </div>
      </section>
    </>
  );
}
