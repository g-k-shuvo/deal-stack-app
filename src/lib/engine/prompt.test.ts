import { describe, it, expect } from "vitest";
import { assembleContext } from "@/lib/engine/context";
import { buildPrompt } from "@/lib/engine/prompt";
import { requireSkill } from "@/lib/skills/registry";
import type { FirmContext, ProjectContext, PriorOutput, SourceDoc } from "@/lib/types";

const firm: FirmContext = {
  name: "Jackim Woods & Co.",
  description: "Lower middle-market M&A advisory.",
  advisorBio: "Rich Jackim, 30+ years.",
  aiInstructions: "Keep executive summaries to one page.",
};

const fullProject: ProjectContext = {
  companyName: "Midwest HVAC Services",
  industry: "HVAC",
  location: "Dayton, OH",
  estValue: "$4.2M",
  ebitda: "$840K",
  multiple: "5.0x",
  structure: "Asset sale",
  contactName: "Tom Kowalski",
  contactTitle: "Owner",
  type: "sell",
};

const prior: PriorOutput = {
  skillKey: "sell.valuation",
  skillName: "Business valuation",
  preview: "Range $3.8M–$4.6M",
};
const sourceDocs: SourceDoc[] = [{ filename: "HVAC_Financials.pdf", format: "pdf", base64: "AAA" }];

describe("buildPrompt", () => {
  it("encodes firm voice + instructions in the system prompt", () => {
    const skill = requireSkill("sell.cim");
    const ctx = assembleContext({ skill, firm, project: fullProject, priorOutputs: [prior] });
    const { system } = buildPrompt(ctx);
    expect(system).toContain("Jackim Woods & Co.");
    expect(system).toContain("Keep executive summaries to one page.");
    expect(system).toContain("junior associate");
  });

  it("includes full deal context, inputs, chained outputs, missing note, source docs, style example", () => {
    const skill = requireSkill("sell.cim");
    const ctx = assembleContext({
      skill,
      firm,
      project: fullProject,
      priorOutputs: [prior],
      inputs: { yearFounded: "1998", reasonForSale: "" }, // empty value filtered out
      sourceDocs,
    });
    const { user } = buildPrompt(ctx, "EXAMPLE-CIM-STRUCTURE");
    expect(user).toContain("Midwest HVAC Services");
    expect(user).toContain("EBITDA: $840K");
    expect(user).toContain("Structure: Asset sale");
    expect(user).toContain("Primary contact: Tom Kowalski, Owner");
    expect(user).toContain("yearFounded: 1998");
    expect(user).not.toContain("reasonForSale");
    expect(user).toContain("Business valuation");
    expect(user).toContain("Range $3.8M–$4.6M");
    expect(user).toContain("sell.client_profile"); // missing prereq note
    expect(user).toContain("HVAC_Financials.pdf");
    expect(user).toContain("EXAMPLE-CIM-STRUCTURE");
    expect(user).toContain(skill.instruction);
  });

  it("omits optional blocks when context is minimal (no chain, inputs, docs, style)", () => {
    const skill = requireSkill("sell.client_profile"); // chainsFrom: []
    const minimal: ProjectContext = { companyName: "Acme Co", type: "sell" };
    const ctx = assembleContext({ skill, firm: { name: "Firm" }, project: minimal });
    const { system, user } = buildPrompt(ctx);
    expect(user).toContain("Acme Co");
    expect(user).not.toContain("Prior deliverables");
    expect(user).not.toContain("## Inputs");
    expect(user).not.toContain("Source documents");
    expect(user).not.toContain("Style example");
    expect(user).not.toContain("not yet available"); // no missing-prereq note
    // firm with no description/bio/instructions still produces a valid system prompt
    expect(system).toContain("Firm");
  });
});
