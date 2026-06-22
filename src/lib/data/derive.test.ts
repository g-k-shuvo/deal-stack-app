import { describe, it, expect } from "vitest";
import { progressOf, nextStepLabel, dashboardKpis, relativeTime } from "@/lib/data/derive";
import { buildSeed } from "@/lib/data/seed";
import type { ProjectStep } from "@/lib/data/model";

const seed = buildSeed(Date.parse("2026-06-21T00:00:00Z"));
const midwest = seed.projects.find((p) => p.id === "p-midwest")!;
const midwestSteps = seed.steps.filter((s) => s.projectId === "p-midwest");

function stepMap(steps: ProjectStep[]): Map<string, ProjectStep[]> {
  const m = new Map<string, ProjectStep[]>();
  for (const s of steps) {
    const arr = m.get(s.projectId) ?? [];
    arr.push(s);
    m.set(s.projectId, arr);
  }
  return m;
}

describe("derive", () => {
  it("computes progress from steps", () => {
    const prog = progressOf(midwest, midwestSteps);
    expect(prog).toEqual({ completed: 5, total: 9, pct: 56 });
  });

  it("finds the next non-completed step", () => {
    expect(nextStepLabel(midwestSteps)).toBe("CIM generator");
  });

  it("returns Complete when all steps done", () => {
    const done = midwestSteps.map((s) => ({ ...s, status: "completed" as const }));
    expect(nextStepLabel(done)).toBe("Complete");
  });

  it("computes dashboard KPIs", () => {
    const kpis = dashboardKpis(seed.projects, stepMap(seed.steps), seed.documents);
    expect(kpis.sellCount).toBe(5);
    expect(kpis.buyCount).toBe(2);
    expect(kpis.activeProjects).toBe(4);
    expect(kpis.totalOutputs).toBe(5); // 5 AI deliverables in seed
    expect(kpis.stepsPending).toBeGreaterThanOrEqual(1); // active projects with an in-progress step
  });

  it("formats relative time", () => {
    const now = new Date("2026-06-21T12:00:00Z");
    expect(relativeTime(new Date(now.getTime() - 30 * 60_000).toISOString(), now)).toBe("30m ago");
    expect(relativeTime(new Date(now.getTime() - 3 * 3_600_000).toISOString(), now)).toBe("3h ago");
    expect(relativeTime(new Date(now.getTime() - 86_400_000).toISOString(), now)).toBe("yesterday");
    expect(relativeTime(new Date(now.getTime() - 3 * 86_400_000).toISOString(), now)).toBe(
      "3 days ago",
    );
    expect(relativeTime(new Date(now.getTime() - 14 * 86_400_000).toISOString(), now)).toBe(
      "2 wks ago",
    );
  });
});
