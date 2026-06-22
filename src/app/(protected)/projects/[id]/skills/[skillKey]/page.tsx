import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepo } from "@/lib/data";
import { getSkill, skillsByTrack } from "@/lib/skills/registry";
import { ExecPanel } from "@/components/ExecPanel";
import type { Firm, Project } from "@/lib/data/model";

function resolveAuto(path: string, project: Project, firm: Firm): string | undefined {
  const map: Record<string, string | undefined> = {
    "project.companyName": project.companyName,
    "project.website": project.website,
    "project.industry": project.industry,
    "project.location": project.location,
    "project.estValue": project.estValue,
    "firm.defaults.success_fee": firm.defaults.success_fee,
    "firm.defaults.retainer": firm.defaults.retainer,
    "firm.defaults.exclusivity": firm.defaults.exclusivity,
  };
  return map[path];
}

export default async function ExecPage({ params }: { params: Promise<{ id: string; skillKey: string }> }) {
  const { id, skillKey } = await params;
  const repo = getRepo();
  const project = await repo.getProject(id);
  if (!project) notFound();
  const skill = getSkill(skillKey);
  if (!skill) notFound();
  const firm = await repo.getFirm();
  const trackSkills = skillsByTrack(project.type);

  const initialInputs: Record<string, string> = {};
  for (const f of skill.inputs) {
    initialInputs[f.name] = (f.autoFrom ? resolveAuto(f.autoFrom, project, firm) : undefined) ?? f.defaultValue ?? "";
  }

  const steps = await repo.listSteps(id);
  const completed = new Set(steps.filter((s) => s.status === "completed").map((s) => s.skillKey));
  const priorNames: string[] = [];
  const missing: string[] = [];
  for (const key of skill.chainsFrom) {
    const has = completed.has(key) || (await repo.runsFor(id, key)).length > 0;
    (has ? priorNames : missing).push(getSkill(key)?.name ?? key);
  }
  const autoContext = [
    { label: "Company", value: project.companyName },
    { label: "Industry", value: project.industry ?? "—" },
    { label: "Deal size", value: project.estValue ?? "—" },
    { label: "Prior docs", value: priorNames.length ? priorNames.join(", ") : "None" },
  ];

  const run = (await repo.runsFor(id, skillKey))[0];
  const latest = run?.versions.at(-1);
  const initial =
    run && latest
      ? { runId: run.id, versionNo: latest.versionNo, previewMd: latest.previewMd, versions: run.versions.map((v) => v.versionNo) }
      : null;

  const idx = trackSkills.findIndex((s) => s.key === skillKey);
  const next = trackSkills[idx + 1];

  return (
    <>
      <div className="back-link">
        <Link href={`/projects/${id}`}>← Back to project</Link>
      </div>
      <div className="breadcrumb">
        <Link href="/projects">Project directory</Link> ›{" "}
        <Link href={`/projects/${id}`}>{project.companyName}</Link> ›{" "}
        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
          {skill.name} — Step {skill.step}
        </span>
      </div>
      <ExecPanel
        projectId={id}
        skillKey={skillKey}
        skillName={skill.name}
        format={skill.format}
        step={skill.step}
        total={trackSkills.length}
        inputs={skill.inputs}
        initialInputs={initialInputs}
        autoContext={autoContext}
        missing={missing}
        initial={initial}
        nextHref={next ? `/projects/${id}/skills/${next.key}` : null}
        nextName={next ? next.name : null}
      />
    </>
  );
}
