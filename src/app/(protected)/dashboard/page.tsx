import Link from "next/link";
import { getRepo } from "@/lib/data";
import { dashboardKpis, progressOf, nextStepLabel, relativeTime } from "@/lib/data/derive";

function dotClass(type: string): string {
  if (type === "upload" || type === "save") return "dot-green";
  if (type === "status" || type === "nda") return "dot-amber";
  return "dot-blue";
}

export default async function DashboardPage() {
  const repo = getRepo();
  const [projects, stepMap, documents, user, activities, skillsRun] = await Promise.all([
    repo.listProjects(),
    repo.stepsByProject(),
    repo.listDocuments(),
    repo.getUser(),
    repo.listActivities(7),
    repo.runVersionCount(),
  ]);
  const kpis = dashboardKpis(projects, stepMap, documents);
  const now = new Date();
  const active = projects
    .filter((p) => p.status === "active")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  return (
    <>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">
          Welcome back, {user.firstName}. You have {kpis.stepsPending} step
          {kpis.stepsPending === 1 ? "" : "s"} pending across active projects.
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-tile">
          <div className="kpi-label">Active projects</div>
          <div className="kpi-value">{kpis.activeProjects}</div>
          <div className="kpi-sub">
            {kpis.sellCount} sell-side · {kpis.buyCount} buy-side
          </div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-label">Skills run</div>
          <div className="kpi-value gold">{skillsRun}</div>
          <div className="kpi-sub">generated outputs</div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-label">Total deliverables</div>
          <div className="kpi-value">{kpis.totalOutputs}</div>
          <div className="kpi-sub">across all projects</div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-label">Steps pending</div>
          <div className="kpi-value warn">{kpis.stepsPending}</div>
          <div className="kpi-sub">across active projects</div>
        </div>
      </div>

      <div className="two-col">
        <div>
          <div className="col-header">Active projects</div>
          {active.map((p) => {
            const steps = stepMap.get(p.id) ?? [];
            const prog = progressOf(p, steps);
            return (
              <Link key={p.id} href={`/projects/${p.id}`} className="proj-card">
                <div className="proj-card-top">
                  <div>
                    <div className="proj-name">{p.companyName}</div>
                    <div className="proj-contact">
                      {p.contactName}
                      {p.contactTitle ? ` · ${p.contactTitle}` : ""}
                    </div>
                  </div>
                  <span className={`badge badge-${p.type}`}>
                    {p.type === "sell" ? "Sell-side" : "Buy-side"}
                  </span>
                </div>
                <div className="proj-meta">
                  <span className={`badge badge-${p.status}`}>Active</span>
                  <span>{p.industry ?? "—"}</span>
                  <span>{p.estValue ?? "—"}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${prog.pct}%` }} />
                </div>
                <div className="proj-bottom">
                  <span>Next: {nextStepLabel(steps)}</span>
                  <span>Updated {relativeTime(p.updatedAt, now)}</span>
                </div>
              </Link>
            );
          })}
          <Link className="link" href="/projects" style={{ fontSize: 13 }}>
            View all {projects.length} projects →
          </Link>
        </div>
        <div>
          <div className="col-header">Recent activity</div>
          <div className="card">
            {activities.map((a) => (
              <div className="activity-item" key={a.id}>
                <div className={`activity-dot ${dotClass(a.type)}`} />
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{relativeTime(a.createdAt, now)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
