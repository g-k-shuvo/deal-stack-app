"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const GROUPS: { label: string; items: { href: string; label: string; match: (p: string) => boolean }[] }[] = [
  {
    label: "Work",
    items: [
      { href: "/dashboard", label: "Dashboard", match: (p) => p === "/" },
      { href: "/projects", label: "Project directory", match: (p) => p.startsWith("/projects") },
      { href: "/library", label: "Document library", match: (p) => p.startsWith("/library") },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/skills", label: "Skill library", match: (p) => p.startsWith("/skills") },
      { href: "/how-to", label: "How-to videos", match: (p) => p.startsWith("/how-to") },
    ],
  },
  { label: "Account", items: [{ href: "/settings", label: "Settings", match: (p) => p.startsWith("/settings") }] },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <nav className="sidebar" aria-label="Primary">
      {GROUPS.map((g, i) => (
        <div key={g.label}>
          {i > 0 && <div className="nav-divider" />}
          <div className="nav-label">{g.label}</div>
          {g.items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`nav-item${it.match(path) ? " active" : ""}`}
              aria-current={it.match(path) ? "page" : undefined}
            >
              {it.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
