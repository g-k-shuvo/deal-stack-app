import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { subscription } from "@/db/schema/auth-schema";
import { Topbar } from "@/components/Topbar";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard — DealStack",
  description: "AI-assisted deal execution workspace.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Check subscription status in the database
  const activeSub = await db
    .select()
    .from(subscription)
    .where(eq(subscription.referenceId, session.user.id))
    .execute();

  const hasValidSub = activeSub.some(
    (sub: any) => sub.status === "active" || sub.status === "trialing"
  );

  // If in development and Stripe keys are not set up, bypass redirection to avoid blocking local devs
  const isDevWithoutStripe =
    process.env.NODE_ENV === "development" && !process.env.STRIPE_SECRET_KEY;

  if (!hasValidSub && !isDevWithoutStripe) {
    redirect("/pricing");
  }

  return (
    <div className="app-shell">
      <Topbar />
      <div className="body">
        <Sidebar />
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
