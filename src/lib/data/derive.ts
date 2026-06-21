import type { Project, ProjectStep, DocRecord } from "@/lib/data/model";
import { getSkill, trackLength } from "@/lib/skills/registry";

// Derived values are computed, never stored (PRD DASH-07, DIR-10, PRJ-02).

export interface Progress {
  completed: number;
  total: number;
  pct: number;
}

export function progressOf(project: Project, steps: ProjectStep[]): Progress {
  const total = steps.length || trackLength(project.type);
  const completed = steps.filter((s) => s.status === "completed").length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, pct };
}

/** Name of the first non-completed step (the "next step" label). */
export function nextStepLabel(steps: ProjectStep[]): string {
  const ordered = [...steps].sort((a, b) => a.ordinal - b.ordinal);
  const next = ordered.find((s) => s.status !== "completed");
  if (!next) return "Complete";
  return getSkill(next.skillKey)?.name ?? next.skillKey;
}

export interface DashboardKpis {
  activeProjects: number;
  sellCount: number;
  buyCount: number;
  totalOutputs: number;
  stepsPending: number;
}

export function dashboardKpis(
  projects: Project[],
  stepsByProject: Map<string, ProjectStep[]>,
  documents: DocRecord[],
): DashboardKpis {
  const active = projects.filter((p) => p.status === "active");
  let stepsPending = 0;
  for (const p of active) {
    const steps = stepsByProject.get(p.id) ?? [];
    stepsPending += steps.filter((s) => s.status === "inprogress").length;
  }
  return {
    activeProjects: active.length,
    sellCount: projects.filter((p) => p.type === "sell").length,
    buyCount: projects.filter((p) => p.type === "buy").length,
    totalOutputs: documents.filter((d) => d.source === "ai").length,
    stepsPending,
  };
}

const MS = { m: 60_000, h: 3_600_000, d: 86_400_000 };

export function relativeTime(iso: string, now: Date): string {
  const then = new Date(iso).getTime();
  const diff = now.getTime() - then;
  if (diff < MS.h) {
    const m = Math.max(1, Math.floor(diff / MS.m));
    return `${m}m ago`;
  }
  if (diff < MS.d) return `${Math.floor(diff / MS.h)}h ago`;
  const days = Math.floor(diff / MS.d);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 wk ago" : `${weeks} wks ago`;
}
