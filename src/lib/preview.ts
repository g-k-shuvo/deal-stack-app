import type { NarrativeContent, DataContent, ValuationContent } from "@/lib/skills/schemas";

// Markdown preview of validated content (S4 middle pane + run_version.preview_md).

function narrative(c: NarrativeContent): string {
  let md = `# ${c.title}\n`;
  if (c.subtitle) md += `**${c.subtitle}**\n`;
  const meta = [c.preparedBy, c.date].filter(Boolean).join(" · ");
  if (meta) md += `_${meta}_\n`;
  for (const s of c.sections) {
    md += `\n## ${s.heading}\n`;
    for (const p of s.paragraphs ?? []) md += `${p}\n`;
    for (const b of s.bullets ?? []) md += `- ${b}\n`;
  }
  return md;
}

function data(c: DataContent): string {
  let md = `# ${c.title}\n\n| ${c.columns.join(" | ")} |\n| ${c.columns.map(() => "---").join(" | ")} |\n`;
  for (const r of c.rows) md += `| ${r.join(" | ")} |\n`;
  return md;
}

function valuation(c: ValuationContent): string {
  let md = `# ${c.title}\n`;
  if (c.narrative) md += `\n${c.narrative}\n`;
  md += `\n## Assumptions\n`;
  for (const a of c.assumptions) md += `- **${a.label}:** ${a.value}\n`;
  md += `\n## Inputs\n`;
  for (const [k, v] of Object.entries(c.inputs)) md += `- ${k}: ${v}\n`;
  return md;
}

export function toPreviewMarkdown(content: unknown): string {
  if (!content || typeof content !== "object") return String(content);
  const o = content as Record<string, unknown>;
  if (typeof o.title === "string" && Array.isArray(o.sections)) {
    return narrative(content as NarrativeContent);
  }
  if (Array.isArray(o.columns) && Array.isArray(o.rows)) {
    return data(content as DataContent);
  }
  if (o.inputs && Array.isArray(o.assumptions)) {
    return valuation(content as ValuationContent);
  }
  return "```json\n" + JSON.stringify(content, null, 2) + "\n```";
}
