import { describe, it, expect } from "vitest";
import { docxNarrativeRenderer } from "@/lib/render/docx";
import { MIME } from "@/lib/render/types";
import { requireSkill } from "@/lib/skills/registry";
import type { NarrativeContent } from "@/lib/skills/schemas";

const skill = requireSkill("sell.cim");

const full: NarrativeContent = {
  title: "CONFIDENTIAL INFORMATION MEMORANDUM",
  subtitle: "Midwest HVAC Services, LLC",
  preparedBy: "Jackim Woods & Co.",
  date: "June 2026",
  sections: [
    { heading: "Executive Summary", paragraphs: ["A leading provider."] },
    { heading: "Investment Highlights", bullets: ["$5.6M TTM revenue", "65% recurring"] },
  ],
};

const minimal: NarrativeContent = {
  title: "Brief",
  sections: [{ heading: "Overview" }],
};

describe("docxNarrativeRenderer", () => {
  it("produces a valid .docx (zip) with the right filename + mime", async () => {
    const res = await docxNarrativeRenderer.render({
      content: full,
      skill,
      company: "Midwest HVAC",
      version: 2,
    });
    // .docx is a ZIP — magic bytes PK\x03\x04
    expect(res.buffer[0]).toBe(0x50);
    expect(res.buffer[1]).toBe(0x4b);
    expect(res.buffer.length).toBeGreaterThan(500);
    expect(res.filename).toBe("CIM_generator_v2_Midwest_HVAC.docx");
    expect(res.mime).toBe(MIME.docx);
  });

  it("renders minimal content (no subtitle/meta/paragraphs/bullets)", async () => {
    const res = await docxNarrativeRenderer.render({
      content: minimal,
      skill,
      company: "X",
      version: 1,
    });
    expect(res.buffer[0]).toBe(0x50);
    expect(res.filename).toBe("CIM_generator_v1_X.docx");
  });

  it("throws on non-narrative content", async () => {
    await expect(
      docxNarrativeRenderer.render({ content: { foo: 1 }, skill, company: "X", version: 1 }),
    ).rejects.toThrow("narrative content");
    await expect(
      docxNarrativeRenderer.render({ content: null, skill, company: "X", version: 1 }),
    ).rejects.toThrow();
  });
});
