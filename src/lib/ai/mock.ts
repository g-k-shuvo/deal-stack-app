import type { AssembledContext } from "@/lib/engine/context";
import type { NarrativeContent, DataContent, ValuationContent } from "@/lib/skills/schemas";

// Deterministic, schema-valid mock generation. Used when no Anthropic key is
// configured (dev/E2E) so the full flow works offline. Grounded in the assembled
// context so output reflects the deal. No Date.now()/random (kept deterministic).

function num(v: string | undefined, fallback: number): number {
  const n = Number((v ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function mockContent(ctx: AssembledContext): NarrativeContent | DataContent | ValuationContent {
  const { skill, project, firm, inputs, chainedOutputs } = ctx;
  const company = project.companyName;
  const priorNote =
    chainedOutputs.length > 0 ? ` Informed by prior ${chainedOutputs.map((c) => c.skillName).join(", ")}.` : "";

  if (skill.archetype === "data") {
    return {
      title: `${skill.name} — ${company}`,
      columns: ["Category", "Item", "Notes"],
      rows: [
        ["Overview", company, `${project.industry ?? "—"} · ${project.estValue ?? "—"}`],
        ["Generated", skill.name, `Mock output${priorNote}`],
        ["Input", Object.keys(inputs)[0] ?? "n/a", Object.values(inputs)[0] ?? "—"],
      ],
    };
  }

  if (skill.archetype === "model") {
    const ebitda = num(inputs.ebitda, 840_000);
    return {
      title: `${skill.name} — ${company}`,
      inputs: {
        revenueTtm: num(inputs.revenueTtm, 5_600_000),
        ebitda,
        ownerAddbacks: num(inputs.ownerAddbacks, 120_000),
        multipleLow: 4.0,
        multipleHigh: 6.0,
      },
      assumptions: [
        { label: "Method", value: "EBITDA multiple + DCF" },
        { label: "EBITDA basis", value: "Adjusted TTM" },
        { label: "SBA financeable", value: "Yes (preliminary)" },
      ],
      narrative: `Indicative valuation range for ${company} based on adjusted EBITDA.${priorNote}`,
    };
  }

  // narrative
  const isCim = skill.key === "sell.cim";
  return {
    title: isCim ? "CONFIDENTIAL INFORMATION MEMORANDUM" : `${skill.name} — ${company}`,
    subtitle: company,
    preparedBy: firm.name,
    date: "June 2026",
    sections: [
      {
        heading: "Executive Summary",
        paragraphs: [
          `${company} is a ${project.industry ?? "lower middle-market"} business${project.location ? ` headquartered in ${project.location}` : ""}.${priorNote}`,
          `This document was prepared by ${firm.name} as a draft for senior advisor review.`,
        ],
      },
      {
        heading: "Investment Highlights",
        bullets: [
          project.estValue ? `Estimated value ${project.estValue}` : "Attractive valuation profile",
          project.ebitda ? `EBITDA ${project.ebitda}` : "Healthy margins",
          "Recurring revenue base",
          "Experienced management team",
        ],
      },
      {
        heading: "Business Overview",
        paragraphs: [
          `${company} operates in the ${project.industry ?? "target"} sector. ${inputs.valueDrivers ?? inputs.researchFocus ?? "Key value drivers include recurring contracts and a strong customer base."}`,
        ],
      },
    ],
  };
}
