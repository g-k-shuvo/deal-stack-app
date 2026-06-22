import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepo } from "@/lib/data";
import { getSkill } from "@/lib/skills/registry";
import { progressOf } from "@/lib/data/derive";

// Project-selection step for "Run skill" (PRD M1 / SKL-05/06), rendered as a page.
export default async function RunPickerPage({ params }: { params: Promise<{ skillKey: string }> }) {
  const { skillKey } = await params;
  const skill = getSkill(skillKey);
  if (!skill) notFound();
  const repo = getRepo();
  const stepMap = await repo.stepsByProject();
  const eligible = (await repo.listProjects()).filter((p) => p.type === skill.track);
  const sideLabel = skill.track === "sell" ? "sell-side" : "buy-side";

  return (
    <>
      <div className="back-link">
        <Link href="/skills">← Skill library</Link>
      </div>
      <div className="page-header">
        <div className="page-title">Run: {skill.name}</div>
        <div className="page-sub">Choose which {sideLabel} project to run this skill in.</div>
      </div>
      <div style={{ maxWidth: 560 }}>
        {eligible.map((p) => {
          const prog = progressOf(p, stepMap.get(p.id) ?? []);
          return (
            <Link key={p.id} href={`/projects/${p.id}/skills/${skillKey}`} className="proj-card">
              <div className="proj-card-top">
                <div>
                  <div className="proj-name">{p.companyName}</div>
                  <div className="proj-contact">
                    {p.contactName} · {p.status} · {prog.completed}/{prog.total} steps
                  </div>
                </div>
                <span className={`badge badge-${p.type}`}>
                  {p.type === "sell" ? "Sell-side" : "Buy-side"}
                </span>
              </div>
            </Link>
          );
        })}
        <Link
          href="/projects/new"
          className="proj-card"
          style={{ textAlign: "center", color: "#185fa5" }}
        >
          + Create a new {sideLabel} project
        </Link>
      </div>
    </>
  );
}
