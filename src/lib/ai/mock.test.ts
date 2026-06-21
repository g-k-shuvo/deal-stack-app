import { describe, it, expect } from "vitest";
import { mockContent } from "@/lib/ai/mock";
import { assembleContext } from "@/lib/engine/context";
import { validateContent } from "@/lib/engine/validate";
import { listSkills, requireSkill } from "@/lib/skills/registry";
import type { FirmContext, ProjectContext } from "@/lib/types";

const firm: FirmContext = { name: "Jackim Woods & Co." };
const project: ProjectContext = {
  companyName: "Midwest HVAC Services",
  industry: "HVAC",
  location: "Dayton, OH",
  estValue: "$4.2M",
  ebitda: "$840K",
  type: "sell",
};

describe("mockContent", () => {
  it("produces schema-valid output for every skill", () => {
    for (const skill of listSkills()) {
      const ctx = assembleContext({ skill, firm, project, inputs: { ebitda: "840000" } });
      const content = mockContent(ctx);
      const res = validateContent(skill.outputSchema, content);
      expect(res.ok, `${skill.key}: ${res.errors.join("; ")}`).toBe(true);
    }
  });

  it("titles a CIM correctly and grounds it in the deal", () => {
    const ctx = assembleContext({ skill: requireSkill("sell.cim"), firm, project });
    const content = mockContent(ctx) as { title: string; subtitle?: string };
    expect(content.title).toBe("CONFIDENTIAL INFORMATION MEMORANDUM");
    expect(content.subtitle).toBe("Midwest HVAC Services");
  });
});
