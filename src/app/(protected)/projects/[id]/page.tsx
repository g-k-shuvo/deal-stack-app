import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepo } from "@/lib/data";
import { getSkill } from "@/lib/skills/registry";
import { progressOf } from "@/lib/data/derive";
import type { StepStatus } from "@/lib/data/model";

const STEP_LABEL: Record<StepStatus, string> = {
  completed: "Completed",
  inprogress: "In progress",
  notstarted: "Not started",
};

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="ctx-row">
      <span className="ctx-key">{k}</span>
      <span className="ctx-val">{v}</span>
    </div>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = getRepo();
  const project = await repo.getProject(id);
  if (!project) notFound();
  const steps = await repo.listSteps(id);
  const prog = progressOf(project, steps);

  return (
    <>
      <div className="back-link">
        <Link href="/projects">← Project directory</Link>
      </div>
      <div className="proj-header-card">
        <div className="proj-header-top">
          <h2>{project.companyName}</h2>
          <span className={`badge badge-${project.type}`}>
            {project.type === "sell" ? "Sell-side" : "Buy-side"}
          </span>
          <span className={`badge badge-${project.status}`}>{project.status}</span>
          <Link
            href={`/projects/${id}/edit`}
            className="link"
            style={{ marginLeft: "auto", fontSize: 12 }}
          >
            Edit project
          </Link>
        </div>
        <div className="proj-header-meta">
          <span>{project.industry ?? "—"}</span>
          {project.location && <span>{project.location}</span>}
          {project.estValue && <span>{project.estValue}</span>}
          {project.engagementStart && <span>Started {project.engagementStart}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="progress-bar" style={{ flex: 1, height: 6 }}>
            <div className="progress-fill" style={{ width: `${prog.pct}%` }} />
          </div>
          <span style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
            {prog.completed} of {prog.total} steps completed
          </span>
        </div>
      </div>

      <div className="dash-two-col">
        <div>
          <div className="col-header">
            Workflow — {project.type === "sell" ? "sell-side" : "buy-side"} track
          </div>
          {steps.map((st) => {
            const skill = getSkill(st.skillKey);
            if (!skill) return null;
            const cls =
              st.status === "completed"
                ? "completed"
                : st.status === "inprogress"
                  ? "inprogress"
                  : "";
            const numCls =
              st.status === "completed" ? "done" : st.status === "inprogress" ? "current" : "";
            return (
              <div key={st.skillKey} className={`step-card ${cls}`}>
                <div className="step-header">
                  <div className={`step-num ${numCls}`}>
                    {st.status === "completed" ? "✓" : st.ordinal}
                  </div>
                  <div className="step-name">
                    Step {st.ordinal} — {skill.name}
                  </div>
                  <span className={`badge badge-${st.status}`} style={{ marginLeft: "auto" }}>
                    {STEP_LABEL[st.status]}
                  </span>
                </div>
                <div className="step-desc">
                  {skill.description} · {skill.format.toUpperCase()}
                </div>
                <div className="step-actions">
                  <Link href={`/projects/${id}/skills/${st.skillKey}`} className="btn-navy">
                    {st.status === "notstarted" ? "Run skill" : "Open"}
                  </Link>
                  {st.linkedDocumentId && (
                    <Link href="/library" className="btn-outline">
                      View output
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <div className="col-header">Project context</div>
          <div className="ctx-panel">
            <div className="ctx-group">
              <div className="ctx-label">Company</div>
              <Row k="Name" v={project.companyName} />
              {project.website && <Row k="Website" v={project.website} />}
              <Row k="Industry" v={project.industry ?? "—"} />
              {project.location && <Row k="Location" v={project.location} />}
            </div>
            <div className="ctx-group">
              <div className="ctx-label">Deal</div>
              <Row k="Est. value" v={project.estValue ?? "—"} />
              <Row k="EBITDA" v={project.ebitda ?? "—"} />
              <Row k="Multiple" v={project.multiple ?? "—"} />
              <Row k="Structure" v={project.structure ?? "—"} />
            </div>
            {project.contactName && (
              <div className="ctx-group">
                <div className="ctx-label">Contact</div>
                <Row k="Name" v={project.contactName} />
                {project.contactTitle && <Row k="Title" v={project.contactTitle} />}
                {project.contactPhone && <Row k="Phone" v={project.contactPhone} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
