import { getRepo } from "@/lib/data";
import { requireSkill } from "@/lib/skills/registry";
import { rendererFor } from "@/lib/render";

// Download a saved deliverable by its run-version id (library + step links).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = getRepo();
  const found = await repo.findVersion(id);
  if (!found) return new Response("Not found", { status: 404 });
  const { run, version } = found;
  const skill = requireSkill(run.skillKey);
  const project = await repo.getProject(run.projectId);
  try {
    const out = await rendererFor(skill).render({
      content: version.contentJson,
      skill,
      company: project?.companyName ?? "Document",
      version: version.versionNo,
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
