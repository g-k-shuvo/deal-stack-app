"use client";

import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { authClient } from "@/lib/auth-client";

export function Topbar() {
  const { data: session } = authClient.useSession();

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      const first = parts[0];
      const second = parts[1];
      if (first && second && first[0] && second[0]) {
        return (first[0] + second[0]).toUpperCase();
      }
      if (first && first[0]) {
        return first.substring(0, 2).toUpperCase();
      }
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const displayName = session?.user?.name || session?.user?.email || "Rich Jackim";
  const initials = session?.user ? getInitials(session.user.name, session.user.email) : "RJ";

  return (
    <header className="topbar">
      <Link href="/dashboard" className="topbar-logo">
        Deal <span>Command</span> Center
      </Link>
      <SearchBox />
      <div className="topbar-spacer" />
      <Link href="/projects/new" className="btn-new">
        + New project
      </Link>
      <Link href="/settings" className="avatar" title={`${displayName} — Settings`}>
        {initials}
      </Link>
    </header>
  );
}
