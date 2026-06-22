"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

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
          <Link href="/login">Contact</Link>
        </li>
      </ul>
      {session ? (
        <Link href="/dashboard" className="nav-cta-btn">
          Go to Dashboard
        </Link>
      ) : (
        <Link href="/login" className="nav-cta-btn">
          Get Early Access
        </Link>
      )}
    </nav>
  );
}
