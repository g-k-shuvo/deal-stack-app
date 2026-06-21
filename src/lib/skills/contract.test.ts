import { describe, it, expect } from "vitest";
import { listSkills, requireSkill } from "@/lib/skills/registry";
import { validateContent } from "@/lib/engine/validate";
import { assembleContext } from "@/lib/engine/context";
import { buildPrompt } from "@/lib/engine/prompt";
import { generate } from "@/lib/ai/client";
import type { AnthropicLike } from "@/lib/ai/client";
import { rendererFor } from "@/lib/render";
import Ajv from "ajv";
import type { FirmContext, ProjectContext } from "@/lib/types";

const ajv = new Ajv({ allErrors: true, strict: false });

describe("skill contracts", () => {
  it("every skill's outputSchema is a compilable JSON Schema", () => {
    for (const s of listSkills()) {
      expect(() => ajv.compile(s.outputSchema)).not.toThrow();
    }
  });
});

// Golden vertical for the CIM walking skeleton (PRD §19.2 scenario 3, AI mocked).
describe("CIM vertical (mocked Claude)", () => {
  const firm: FirmContext = { name: "Jackim Woods & Co.", aiInstructions: "Concise." };
  const project: ProjectContext = {
    companyName: "Midwest HVAC Services",
    industry: "HVAC",
    estValue: "$4.2M",
    type: "sell",
  };
  const cimContent = {
    title: "CONFIDENTIAL INFORMATION MEMORANDUM",
    subtitle: "Midwest HVAC Services, LLC",
    preparedBy: "Jackim Woods & Co.",
    date: "June 2026",
    sections: [
      { heading: "Executive Summary", paragraphs: ["A leading HVAC provider in Dayton, OH."] },
      { heading: "Investment Highlights", bullets: ["$5.6M TTM revenue", "65% recurring revenue"] },
    ],
  };

  it("assembles → prompts → generates (validated) → renders a DOCX", async () => {
    const skill = requireSkill("sell.cim");
    const ctx = assembleContext({
      skill,
      firm,
      project,
      priorOutputs: [{ skillKey: "sell.valuation", skillName: "Business valuation", preview: "Range $4M" }],
      inputs: { yearFounded: "1998" },
    });
    const prompt = buildPrompt(ctx);

    const client: AnthropicLike = {
      messages: { create: async () => ({ content: [{ type: "tool_use", input: cimContent }] }) },
    };
    const { content } = await generate({ skill, prompt, apiKey: "k", client });
    expect(validateContent(skill.outputSchema, content).ok).toBe(true);

    const out = await rendererFor(skill).render({ content, skill, company: project.companyName, version: 2 });
    expect(out.filename).toBe("CIM_generator_v2_Midwest_HVAC_Services.docx");
    expect(out.buffer[0]).toBe(0x50); // PK zip magic
  });
});
