import type { Metadata } from "next";
import { Topbar } from "@/components/Topbar";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard — DealStack",
  description: "AI-assisted deal execution workspace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
