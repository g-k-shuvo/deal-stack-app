import Link from "next/link";
import { getRepo } from "@/lib/data";

// Global search across projects + documents (PRD GLB-02).
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = typeof sp.q === "string" ? sp.q : "";
  const q = raw.toLowerCase().trim();
  const repo = getRepo();
  const allProjects = await repo.listProjects();
  const projects = q
    ? allProjects.filter(
        (p) =>
          p.companyName.toLowerCase().includes(q) ||
          (p.contactName ?? "").toLowerCase().includes(q) ||
          (p.industry ?? "").toLowerCase().includes(q),
      )
    : [];
  const docs = q
    ? (await repo.listDocuments()).filter((d) => d.filename.toLowerCase().includes(q))
    : [];
  const names: Record<string, string> = Object.fromEntries(
    allProjects.map((p) => [p.id, p.companyName]),
  );

  return (
    <>
      <div className="page-header">
        <div className="page-title">Search</div>
        <div className="page-sub">
          {q ? `Results for “${raw}”` : "Type a query in the top bar."}
        </div>
      </div>
      {q && (
        <>
          <div className="col-header">Projects ({projects.length})</div>
          {projects.length === 0 ? (
            <div className="empty-state">No matching projects.</div>
          ) : (
            projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="proj-card">
                <div className="proj-name">{p.companyName}</div>
                <div className="proj-contact">
                  {p.contactName} · {p.industry ?? "—"}
                </div>
              </Link>
            ))
          )}
          <div className="col-header" style={{ marginTop: 22 }}>
            Documents ({docs.length})
          </div>
          {docs.length === 0 ? (
            <div className="empty-state">No matching documents.</div>
          ) : (
            <div className="card">
              {docs.map((d) => (
                <div className="doc-row" key={d.id}>
                  <div className="doc-info">
                    <div className="doc-name">{d.filename}</div>
                    <div className="doc-meta">{(d.projectId && names[d.projectId]) || "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
