"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      className="topbar-search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }}
    >
      <input
        aria-label="Search projects and documents"
        placeholder="Search projects, documents..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </form>
  );
}
