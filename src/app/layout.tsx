import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DealStack — AI-Powered Deal Tools for Business Brokers & M&A Advisors",
  description:
    "AI-powered deal management software for business brokers and M&A advisors. Streamline your pipeline, automate due diligence, and close more deals.",
};

// Internal, DB-backed app: every screen renders per-request from the live Repo
// (Supabase or in-memory). Force dynamic so the build never statically prerenders
// pages — which would execute Supabase calls at build time and require the live DB.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
