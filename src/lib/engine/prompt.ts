import type { AssembledContext } from "@/lib/engine/context";

// Prompt construction (PRD §11.2 step 2, AI-05/06). Pure + deterministic.

export interface BuiltPrompt {
  system: string;
  user: string;
}

const JUNIOR_ASSOCIATE_STANDARD =
  "Produce work to the standard of a capable junior associate at the firm: complete, well-structured, and ready for a senior advisor to review and refine. This is a draft, not a final deliverable.";

export function buildPrompt(ctx: AssembledContext, styleExample?: string): BuiltPrompt {
  const { firm, project, skill } = ctx;

  const systemParts: string[] = [
    `You are an M&A analyst working for ${firm.name}.`,
    JUNIOR_ASSOCIATE_STANDARD,
  ];
  if (firm.description) systemParts.push(`Firm: ${firm.description}`);
  if (firm.advisorBio) systemParts.push(`Lead advisor: ${firm.advisorBio}`);
  if (firm.aiInstructions) systemParts.push(`Firm output instructions: ${firm.aiInstructions}`);
  systemParts.push(
    "Return the document by calling the provided tool with JSON that conforms to its schema. Do not invent financial figures that are not supported by the supplied context.",
  );

  const userParts: string[] = [];
  userParts.push(`## Task\n${skill.name}: ${skill.instruction}`);

  const deal: string[] = [
    `Company: ${project.companyName}`,
    project.industry ? `Industry: ${project.industry}` : "",
    project.location ? `Location: ${project.location}` : "",
    project.estValue ? `Estimated value: ${project.estValue}` : "",
    project.ebitda ? `EBITDA: ${project.ebitda}` : "",
    project.multiple ? `Multiple: ${project.multiple}` : "",
    project.structure ? `Structure: ${project.structure}` : "",
    project.contactName
      ? `Primary contact: ${project.contactName}${project.contactTitle ? `, ${project.contactTitle}` : ""}`
      : "",
  ].filter(Boolean);
  userParts.push(`## Deal context\n${deal.join("\n")}`);

  const inputEntries = Object.entries(ctx.inputs).filter(([, v]) => v !== undefined && v !== "");
  if (inputEntries.length > 0) {
    userParts.push(
      `## Inputs\n${inputEntries.map(([k, v]) => `${k}: ${v}`).join("\n")}`,
    );
  }

  if (ctx.chainedOutputs.length > 0) {
    const prior = ctx.chainedOutputs
      .map((c) => `### ${c.skillName}\n${c.preview}`)
      .join("\n\n");
    userParts.push(`## Prior deliverables (use as authoritative context)\n${prior}`);
  }

  if (ctx.missingPrereqs.length > 0) {
    userParts.push(
      `## Note\nThese expected prior deliverables are not yet available: ${ctx.missingPrereqs.join(", ")}. Proceed using available context and avoid fabricating their contents.`,
    );
  }

  if (ctx.sourceDocs.length > 0) {
    const names = ctx.sourceDocs.map((d) => d.filename).join(", ");
    userParts.push(`## Source documents attached\n${names}`);
  }

  if (styleExample) {
    userParts.push(
      `## Style example (match its structure, section order, and tone)\n${styleExample}`,
    );
  }

  return { system: systemParts.join("\n\n"), user: userParts.join("\n\n") };
}
