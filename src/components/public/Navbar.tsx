"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="public-nav">
      <Link href="/" className="nav-logo">
        <span className="nav-logo-icon">D</span>
        DealStack
      </Link>
      <ul className="public-nav-links">
        <li>
          <Link href="/features" className={pathname === "/features" ? "active" : ""}>
            Features
          </Link>
        </li>
        <li>
          <Link href="/pricing" className={pathname === "/pricing" ? "active" : ""}>
            Pricing
          </Link>
        </li>
        <li>
          <Link href="/#how-it-works">How It Works</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
      <Link href="/contact" className="nav-cta-btn">
        Get Early Access
      </Link>
    </nav>
  );
}
