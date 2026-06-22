import Link from "next/link";
import { skillsByTrack } from "@/lib/skills/registry";
import { SkillFilters } from "@/components/SkillFilters";
import type { Skill } from "@/lib/skills/types";

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="skill-card">
      <div className="skill-top">
        <div>
          <div className="skill-step">Step {skill.step}</div>
          <div className="skill-name">
            {skill.name}
            {skill.badges?.map((b) => (
              <span key={b} className={`badge badge-${b}`} style={{ fontSize: 11 }}>
                {b === "new" ? "New" : "Updated"}
              </span>
            ))}
          </div>
          <div className="skill-desc">{skill.description}</div>
        </div>
        <span className={`badge badge-${skill.format}`}>{skill.format.toUpperCase()}</span>
      </div>
      <div className="skill-meta">
        <span className="pill">{skill.phase}</span>
        <span className="pill">~{skill.estMinutes} min</span>
        <Link href={`/skills/${skill.key}/run`} className="btn-navy" style={{ marginLeft: "auto" }}>
          Run skill
        </Link>
      </div>
    </div>
  );
}

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const side = typeof sp.side === "string" ? sp.side : "all";
  const format = typeof sp.format === "string" ? sp.format : "all";
  const fmt = (s: Skill) => format === "all" || s.format === format;

  const sell = skillsByTrack("sell").filter(fmt);
  const buy = skillsByTrack("buy").filter(fmt);

  return (
    <>
      <div className="page-header">
        <div className="page-title">Skill library</div>
        <div className="page-sub">15 skills · 9 sell-side · 6 buy-side</div>
      </div>
      <SkillFilters />
      {side !== "buy" && (
        <>
          <div className="track-label">Track A — Sell-side ({sell.length})</div>
          {sell.map((s) => (
            <SkillCard key={s.key} skill={s} />
          ))}
        </>
      )}
      {side !== "sell" && (
        <>
          <div className="track-label">Track B — Buy-side ({buy.length})</div>
          {buy.map((s) => (
            <SkillCard key={s.key} skill={s} />
          ))}
        </>
      )}
    </>
  );
}
