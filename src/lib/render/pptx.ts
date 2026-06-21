import PptxGenJS from "pptxgenjs";
import type { NarrativeContent } from "@/lib/skills/schemas";
import type { Renderer, RenderInput, RenderResult } from "@/lib/render/types";
import { MIME } from "@/lib/render/types";
import { buildFilename } from "@/lib/util/filename";

// PPTX renderer (PRD §13 REN-03) — narrative content → one slide per section.

function isNarrative(c: unknown): c is NarrativeContent {
  if (!c || typeof c !== "object") return false;
  const o = c as Record<string, unknown>;
  return typeof o.title === "string" && Array.isArray(o.sections);
}

export const pptxRenderer: Renderer = {
  async render(input: RenderInput): Promise<RenderResult> {
    const { content, skill, company, version } = input;
    if (!isNarrative(content)) {
      throw new Error("pptx renderer requires narrative content (title + sections)");
    }

    const deck = new PptxGenJS();
    const title = deck.addSlide();
    title.addText(content.title, { x: 0.5, y: 1.0, w: 9, fontSize: 28, bold: true, color: "0D2340" });
    if (content.subtitle) {
      title.addText(content.subtitle, { x: 0.5, y: 2.0, w: 9, fontSize: 18, color: "6B6B67" });
    }

    for (const section of content.sections) {
      const slide = deck.addSlide();
      slide.addText(section.heading, { x: 0.5, y: 0.4, w: 9, fontSize: 22, bold: true, color: "0D2340" });
      const body = [...(section.paragraphs ?? []), ...(section.bullets ?? []).map((b) => `• ${b}`)].join("\n");
      if (body) slide.addText(body, { x: 0.5, y: 1.2, w: 9, fontSize: 14, color: "1A1A18" });
    }

    const out = await deck.write({ outputType: "nodebuffer" });
    return {
      buffer: Buffer.from(out as unknown as Uint8Array),
      filename: buildFilename(skill.name, version, company, "pptx"),
      mime: MIME.pptx,
    };
  },
};
