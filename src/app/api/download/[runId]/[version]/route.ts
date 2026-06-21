import { getRepo } from "@/lib/data";
import { requireSkill } from "@/lib/skills/registry";
import { rendererFor } from "@/lib/render";

// Renders the Office file on demand from the stored run-version content (EXEC-11, REN).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ runId: string; version: string }> },
) {
  const { runId, version } = await params;
  const repo = getRepo();
  const run = await repo.getRun(runId);
  if (!run) return new Response("Run not found", { status: 404 });
  const v = run.versions.find((x) => x.versionNo === Number(version));
  if (!v) return new Response("Version not found", { status: 404 });

  const skill = requireSkill(run.skillKey);
  const project = await repo.getProject(run.projectId);
  try {
    const out = await rendererFor(skill).render({
      content: v.contentJson,
      skill,
      company: project?.companyName ?? "Document",
      version: v.versionNo,
    });
    return new Response(new Uint8Array(out.buffer), {
      headers: {
        "Content-Type": out.mime,
        "Content-Disposition": `attachment; filename="${out.filename}"`,
      },
    });
  } catch {
    return new Response(`Renderer for ${skill.format} not available yet`, { status: 501 });
  }
}
