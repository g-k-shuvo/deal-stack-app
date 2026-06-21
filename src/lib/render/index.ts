import type { Skill } from "@/lib/skills/types";
import type { Renderer } from "@/lib/render/types";
import { docxNarrativeRenderer } from "@/lib/render/docx";
import { xlsxRenderer } from "@/lib/render/xlsx";
import { pptxRenderer } from "@/lib/render/pptx";

export { MIME } from "@/lib/render/types";
export type { Renderer, RenderInput, RenderResult } from "@/lib/render/types";

/** Select the renderer for a skill's output format. */
export function rendererFor(skill: Skill): Renderer {
  switch (skill.format) {
    case "docx":
      return docxNarrativeRenderer;
    case "xlsx":
      return xlsxRenderer;
    case "pptx":
      return pptxRenderer;
    default:
      throw new Error(`Unknown format: ${skill.format as string}`);
  }
}
