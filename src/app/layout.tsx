import type { Metadata } from "next";
import "./globals.css";
import { Topbar } from "@/components/Topbar";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Deal Command Center",
  description: "AI-assisted deal execution workspace for Jackim Woods & Co.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Topbar />
          <div className="body">
            <Sidebar />
            <main className="main">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
