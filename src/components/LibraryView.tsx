"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSkill } from "@/lib/skills/registry";
import { renameDocAction, deleteDocAction, uploadDocAction } from "@/app/actions";
import type { DocRecord } from "@/lib/data/model";

const ICON: Record<string, { bg: string; color: string }> = {
  docx: { bg: "#e6f1fb", color: "#0c447c" },
  xlsx: { bg: "#eaf3de", color: "#27500a" },
  pptx: { bg: "#faeeda", color: "#633806" },
  pdf: { bg: "#f1efe8", color: "#5f5e5a" },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function LibraryView({
  docs,
  projects,
}: {
  docs: DocRecord[];
  projects: Record<string, string>;
}) {
  const router = useRouter();
  const [projectFilter, setProjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [busy, setBusy] = useState(false);

  const projectIds = Array.from(
    new Set(docs.map((d) => d.projectId).filter((x): x is string => !!x)),
  );

  const filtered = docs.filter(
    (d) =>
      (projectFilter === "all" || d.projectId === projectFilter) &&
      (typeFilter === "all" || d.format === typeFilter),
  );
  const ai = filtered.filter((d) => d.source === "ai");
  const uploaded = filtered.filter((d) => d.source === "uploaded");

  async function rename(d: DocRecord) {
    const name = window.prompt("Rename document", d.filename);
    if (!name || name === d.filename) return;
    setBusy(true);
    await renameDocAction(d.id, name);
    setBusy(false);
    router.refresh();
  }
  async function remove(d: DocRecord) {
    if (!window.confirm(`Delete ${d.filename}? This cannot be undone.`)) return;
    setBusy(true);
    await deleteDocAction(d.id);
    setBusy(false);
    router.refresh();
  }

  function Rows({ items }: { items: DocRecord[] }) {
    return (
      <>
        {items.map((d) => {
          const ic = ICON[d.format] ?? ICON.pdf!;
          const skillName = d.skillKey ? getSkill(d.skillKey)?.name : undefined;
          return (
            <div className="doc-row" key={d.id}>
              <div className="doc-icon" style={{ background: ic.bg, color: ic.color }}>
                {d.format.toUpperCase().slice(0, 3)}
              </div>
              <div className="doc-info">
                <div className="doc-name">{d.filename}</div>
                <div className="doc-meta">
                  {(d.projectId && projects[d.projectId]) || "—"} · {skillName ?? "Uploaded"} ·{" "}
                  {fmtDate(d.createdAt)}
                </div>
              </div>
              <div className="doc-actions">
                {(d.runVersionId || d.source === "uploaded") && (
                  <a
                    className="icon-btn"
                    title="Download"
                    href={
                      d.source === "uploaded"
                        ? `/api/download/upload/${d.id}`
                        : `/api/download/version/${d.runVersionId}`
                    }
                  >
                    ↓
                  </a>
                )}
                <button
                  className="icon-btn"
                  title="Rename"
                  disabled={busy}
                  onClick={() => rename(d)}
                >
                  ✎
                </button>
                <button
                  className="icon-btn"
                  title="Delete"
                  disabled={busy}
                  onClick={() => remove(d)}
                >
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Document library</div>
        <div className="page-sub">
          {docs.length} files across {projectIds.length} projects
        </div>
      </div>
      <form
        action={uploadDocAction}
        className="card"
        style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}
      >
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Upload client document:
        </span>
        <select name="projectId" className="sort-select" required defaultValue="">
          <option value="" disabled>
            Select project…
          </option>
          {Object.entries(projects).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <input type="file" name="file" required style={{ fontSize: 12 }} />
        <button className="btn-navy" type="submit">
          Upload
        </button>
      </form>
      <div className="toolbar">
        <button
          className={`filter-pill${projectFilter === "all" ? " active" : ""}`}
          onClick={() => setProjectFilter("all")}
        >
          All projects
        </button>
        {projectIds.map((id) => (
          <button
            key={id}
            className={`filter-pill${projectFilter === id ? " active" : ""}`}
            onClick={() => setProjectFilter(id)}
          >
            {projects[id]}
          </button>
        ))}
        <span className="toolbar-sep" />
        {["all", "docx", "xlsx", "pptx", "pdf"].map((t) => (
          <button
            key={t}
            className={`filter-pill${typeFilter === t ? " active" : ""}`}
            onClick={() => setTypeFilter(t)}
          >
            {t === "all" ? "All types" : t.toUpperCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No documents match these filters.</div>
      ) : (
        <div className="card">
          {ai.length > 0 && <div className="doc-section-title">AI deliverables</div>}
          <Rows items={ai} />
          {uploaded.length > 0 && (
            <div className="doc-section-title">Client-provided documents</div>
          )}
          <Rows items={uploaded} />
        </div>
      )}
    </>
  );
}
