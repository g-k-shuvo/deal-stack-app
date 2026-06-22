import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import type { NarrativeContent } from "@/lib/skills/schemas";
import type { Renderer, RenderInput, RenderResult } from "@/lib/render/types";
import { MIME } from "@/lib/render/types";
import { buildFilename } from "@/lib/util/filename";

// Narrative DOCX renderer (PRD §13). Serves all DOCX narrative skills.
// NOTE: builds the document programmatically via `docx`. When the firm supplies
// branded .docx templates, swap to docxtemplater behind this same Renderer interface.

function isNarrative(c: unknown): c is NarrativeContent {
  if (!c || typeof c !== "object") return false;
  const o = c as Record<string, unknown>;
  return typeof o.title === "string" && Array.isArray(o.sections);
}

export const docxNarrativeRenderer: Renderer = {
  async render(input: RenderInput): Promise<RenderResult> {
    const { content, skill, company, version } = input;
    if (!isNarrative(content)) {
      throw new Error("docx renderer requires narrative content (title + sections)");
    }

    const children: Paragraph[] = [
      new Paragraph({ text: content.title, heading: HeadingLevel.TITLE }),
    ];
    if (content.subtitle) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: content.subtitle, bold: true, size: 28 })],
        }),
      );
    }
    const meta = [content.preparedBy, content.date].filter(Boolean).join(" · ");
    if (meta) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: meta, italics: true, color: "666666" })] }),
      );
    }

    for (const section of content.sections) {
      children.push(new Paragraph({ text: section.heading, heading: HeadingLevel.HEADING_1 }));
      for (const p of section.paragraphs ?? []) {
        children.push(new Paragraph({ text: p }));
      }
      for (const b of section.bullets ?? []) {
        children.push(new Paragraph({ text: b, bullet: { level: 0 } }));
      }
    }

    const doc = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(doc);
    return {
      buffer,
      filename: buildFilename(skill.name, version, company, "docx"),
      mime: MIME.docx,
    };
  },
};
