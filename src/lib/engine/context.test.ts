import { describe, it, expect } from "vitest";
import { assembleContext } from "@/lib/engine/context";
import { requireSkill } from "@/lib/skills/registry";
import type { FirmContext, ProjectContext, PriorOutput } from "@/lib/types";

const firm: FirmContext = { name: "Jackim Woods & Co." };
const project: ProjectContext = {
  companyName: "Midwest HVAC Services",
  industry: "Manufacturing / HVAC",
  estValue: "$4.2M",
  type: "sell",
};

const valuationOutput: PriorOutput = {
  skillKey: "sell.valuation",
  skillName: "Business valuation",
  preview: "Valuation range $3.8M–$4.6M",
};

describe("assembleContext", () => {
  it("chains only available prior outputs and reports missing prereqs", () => {
    const skill = requireSkill("sell.cim"); // chainsFrom: valuation, client_profile
    const ctx = assembleContext({ skill, firm, project, priorOutputs: [valuationOutput] });
    expect(ctx.chainedOutputs.map((c) => c.skillKey)).toEqual(["sell.valuation"]);
    expect(ctx.missingPrereqs).toEqual(["sell.client_profile"]);
  });

  it("builds the auto-context strip", () => {
    const skill = requireSkill("sell.cim");
    const ctx = assembleContext({ skill, firm, project, priorOutputs: [valuationOutput] });
    const map = Object.fromEntries(ctx.autoContext.map((a) => [a.label, a.value]));
    expect(map["Company"]).toBe("Midwest HVAC Services");
    expect(map["Industry"]).toBe("Manufacturing / HVAC");
    expect(map["Deal size"]).toBe("$4.2M");
    expect(map["Prior docs"]).toBe("Business valuation");
  });

  it("defaults Prior docs to None and fills inputs/sourceDocs defaults", () => {
    const skill = requireSkill("sell.client_profile"); // chainsFrom: []
    const ctx = assembleContext({ skill, firm, project: { companyName: "X", type: "sell" } });
    const map = Object.fromEntries(ctx.autoContext.map((a) => [a.label, a.value]));
    expect(map["Prior docs"]).toBe("None");
    expect(map["Industry"]).toBe("—");
    expect(ctx.inputs).toEqual({});
    expect(ctx.sourceDocs).toEqual([]);
    expect(ctx.missingPrereqs).toEqual([]);
  });
});
