import Link from "next/link";
import { getRepo } from "@/lib/data";
import { progressOf, nextStepLabel, relativeTime } from "@/lib/data/derive";
import { FilterBar } from "@/components/FilterBar";
import type { ProjectStatus } from "@/lib/data/model";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "Active",
  prospect: "Prospect",
  onhold: "On hold",
  closed: "Closed",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const status = pick("status") || "all";
  const type = pick("type") || "all";
  const sort = pick("sort") || "updated";
  const q = pick("q").toLowerCase();

  const repo = getRepo();
  const stepMap = await repo.stepsByProject();
  const all = await repo.listProjects();
  let list = all;
  if (status !== "all") list = list.filter((p) => p.status === status);
  if (type !== "all") list = list.filter((p) => p.type === type);
  if (q) {
    list = list.filter(
      (p) =>
        p.companyName.toLowerCase().includes(q) || (p.contactName ?? "").toLowerCase().includes(q),
    );
  }
  list = [...list].sort((a, b) => {
    if (sort === "az") return a.companyName.localeCompare(b.companyName);
    if (sort === "created") return b.createdAt.localeCompare(a.createdAt);
    return b.updatedAt.localeCompare(a.updatedAt);
  });

  const activeCount = all.filter((p) => p.status === "active").length;
  const shown = list.slice(0, 100);
  const now = new Date();

  return (
    <>
      <div className="page-header">
        <div className="page-title">Project directory</div>
        <div className="page-sub">
          {all.length} projects · {activeCount} active
        </div>
      </div>
      <FilterBar />
      {list.length === 0 ? (
        <div className="empty-state">No projects match these filters.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Type</th>
              <th>Status</th>
              <th>Industry</th>
              <th>Progress</th>
              <th>Next step</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => {
              const steps = stepMap.get(p.id) ?? [];
              const prog = progressOf(p, steps);
              return (
                <tr key={p.id}>
                  <td>
                    <Link href={`/projects/${p.id}`} style={{ fontWeight: 600 }}>
                      {p.companyName}
                    </Link>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      {p.contactName}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${p.type}`}>
                      {p.type === "sell" ? "Sell-side" : "Buy-side"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${p.status}`}>{STATUS_LABEL[p.status]}</span>
                  </td>
                  <td>{p.industry ?? "—"}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${prog.pct}%` }} />
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {prog.completed} of {prog.total}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    {nextStepLabel(steps)}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    {relativeTime(p.updatedAt, now)}
                  </td>
                  <td>
                    <Link href={`/projects/${p.id}`} className="btn-navy">
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {list.length > 100 && (
        <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 10 }}>
          Showing 100 of {list.length} — refine filters to narrow.
        </div>
      )}
    </>
  );
}
