"use client";
import { useRouter, useSearchParams } from "next/navigation";

const SIDES = [
  ["all", "All skills"],
  ["sell", "Sell-side"],
  ["buy", "Buy-side"],
];
const FORMATS = [
  ["all", "All formats"],
  ["docx", "DOCX"],
  ["xlsx", "XLSX"],
  ["pptx", "PPTX"],
];

export function SkillFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const side = sp.get("side") ?? "all";
  const format = sp.get("format") ?? "all";

  function set(k: string, v: string) {
    const p = new URLSearchParams(sp.toString());
    if (v === "all") p.delete(k);
    else p.set(k, v);
    router.push(`/skills?${p.toString()}`);
  }

  return (
    <div className="toolbar">
      {SIDES.map(([v, label]) => (
        <button key={v} className={`filter-pill${side === v ? " active" : ""}`} onClick={() => set("side", v!)}>
          {label}
        </button>
      ))}
      <span className="toolbar-sep" />
      {FORMATS.map(([v, label]) => (
        <button key={v} className={`filter-pill${format === v ? " active" : ""}`} onClick={() => set("format", v!)}>
          {label}
        </button>
      ))}
    </div>
  );
}
