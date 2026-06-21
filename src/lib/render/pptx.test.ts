import { describe, it, expect } from "vitest";
import { pptxRenderer } from "@/lib/render/pptx";
import { MIME } from "@/lib/render/types";
import { requireSkill } from "@/lib/skills/registry";
import type { NarrativeContent } from "@/lib/skills/schemas";

const skill = requireSkill("sell.market_assessment");

const full: NarrativeContent = {
  title: "Market Assessment",
  subtitle: "Midwest HVAC Services",
  sections: [
    { heading: "Market Overview", paragraphs: ["The HVAC market is growing."], bullets: ["Tailwind 1", "Tailwind 2"] },
    { heading: "Valuation Range" },
  ],
};

describe("pptxRenderer", () => {
  it("renders a valid .pptx deck", async () => {
    const res = await pptxRenderer.render({ content: full, skill, company: "Midwest HVAC", version: 1 });
    expect(res.buffer[0]).toBe(0x50); // PK
    expect(res.buffer.length).toBeGreaterThan(1000);
    expect(res.filename).toBe("Market_assessment_v1_Midwest_HVAC.pptx");
    expect(res.mime).toBe(MIME.pptx);
  });

  it("renders minimal narrative (no subtitle, empty section body)", async () => {
    const res = await pptxRenderer.render({
      content: { title: "Deck", sections: [{ heading: "Only heading" }] },
      skill,
      company: "X",
      version: 1,
    });
    expect(res.buffer[0]).toBe(0x50);
  });

  it("throws on non-narrative content", async () => {
    await expect(pptxRenderer.render({ content: null, skill, company: "X", version: 1 })).rejects.toThrow(
      "narrative content",
    );
  });
});
