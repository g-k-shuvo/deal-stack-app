import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";

export function Topbar() {
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
      <Link href="/settings" className="avatar" title="Rich Jackim — Settings">
        RJ
      </Link>
    </header>
  );
}
