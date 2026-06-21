"use client";
import { useRouter, useSearchParams } from "next/navigation";

const STATUS = ["all", "active", "prospect", "onhold", "closed"];
const TYPES = ["all", "sell", "buy"];
const LABEL: Record<string, string> = {
  all: "All",
  active: "Active",
  prospect: "Prospect",
  onhold: "On hold",
  closed: "Closed",
  sell: "Sell-side",
  buy: "Buy-side",
};

export function FilterBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const status = sp.get("status") ?? "all";
  const type = sp.get("type") ?? "all";
  const sort = sp.get("sort") ?? "updated";

  function set(k: string, v: string) {
    const p = new URLSearchParams(sp.toString());
    if (v === "all" || v === "") p.delete(k);
    else p.set(k, v);
    router.push(`/projects?${p.toString()}`);
  }

  return (
    <div className="toolbar">
      {STATUS.map((s) => (
        <button key={s} className={`filter-pill${status === s ? " active" : ""}`} onClick={() => set("status", s)}>
          {s === "all" ? "All" : LABEL[s]}
        </button>
      ))}
      <span className="toolbar-sep" />
      {TYPES.map((t) => (
        <button key={t} className={`filter-pill${type === t ? " active" : ""}`} onClick={() => set("type", t)}>
          {t === "all" ? "All types" : LABEL[t]}
        </button>
      ))}
      <div className="toolbar-spacer" />
      <select className="sort-select" value={sort} onChange={(e) => set("sort", e.target.value)}>
        <option value="updated">Last updated</option>
        <option value="az">Company A–Z</option>
        <option value="created">Date created</option>
      </select>
    </div>
  );
}
