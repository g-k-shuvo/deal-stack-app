import Link from "next/link";

export default function Footer() {
  return (
    <footer className="public-footer">
      <div className="public-footer-grid">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            <span className="footer-logo-icon">D</span>
            DealStack
          </Link>
          <p>
            AI-powered deal tools built exclusively for business brokers and
            M&amp;A advisors. Close more deals, faster.
          </p>
          <div className="footer-newsletter">
            <label>Stay in the loop</label>
            <div className="footer-newsletter-form">
              <input type="email" placeholder="your@email.com" />
              <button type="button">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            <li>
              <Link href="/features">Features</Link>
            </li>
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
            <li>
              <Link href="/#how-it-works">How It Works</Link>
            </li>
            <li>
              <Link href="/contact">Get Early Access</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Solutions</h4>
          <ul>
            <li>
              <Link href="/features#pipeline">Deal Pipeline</Link>
            </li>
            <li>
              <Link href="/features#due-diligence">Due Diligence AI</Link>
            </li>
            <li>
              <Link href="/features#valuation">Valuation Engine</Link>
            </li>
            <li>
              <Link href="/features#documents">Document Drafting</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li>
              <Link href="#">About Us</Link>
            </li>
            <li>
              <Link href="#">Blog</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="#">Privacy Policy</Link>
            </li>
            <li>
              <Link href="#">Terms of Service</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 DealStack. All rights reserved.</p>
        <div className="footer-social">
          <Link href="#">in</Link>
          <Link href="#">𝕏</Link>
          <Link href="#">f</Link>
        </div>
      </div>
    </footer>
  );
}
