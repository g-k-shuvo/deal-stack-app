import type { FirmContext, ProjectContext, PriorOutput, SourceDoc } from "@/lib/types";
import type { Skill } from "@/lib/skills/types";

// Deterministic context assembly + chaining (PRD §11.2 step 1, §11.3 ENG-01/02/04).

export interface AssembleArgs {
  skill: Skill;
  firm: FirmContext;
  project: ProjectContext;
  priorOutputs?: PriorOutput[];
  inputs?: Record<string, string>;
  sourceDocs?: SourceDoc[];
}

export interface AutoContextItem {
  label: string;
  value: string;
}

export interface AssembledContext {
  skill: Skill;
  firm: FirmContext;
  project: ProjectContext;
  /** Prior outputs this skill chains from AND that exist. */
  chainedOutputs: PriorOutput[];
  /** chainsFrom entries with no available prior output (ENG-02). */
  missingPrereqs: string[];
  inputs: Record<string, string>;
  sourceDocs: SourceDoc[];
  /** Drives the S4 auto-context strip (ENG-04). */
  autoContext: AutoContextItem[];
}

export function assembleContext(args: AssembleArgs): AssembledContext {
  const { skill, firm, project } = args;
  const priorOutputs = args.priorOutputs ?? [];
  const inputs = args.inputs ?? {};
  const sourceDocs = args.sourceDocs ?? [];

  const available = new Map(priorOutputs.map((p) => [p.skillKey, p]));
  const chainedOutputs: PriorOutput[] = [];
  const missingPrereqs: string[] = [];
  for (const key of skill.chainsFrom) {
    const found = available.get(key);
    if (found) chainedOutputs.push(found);
    else missingPrereqs.push(key);
  }

  const priorDocsLabel =
    chainedOutputs.length > 0 ? chainedOutputs.map((c) => c.skillName).join(", ") : "None";

  const autoContext: AutoContextItem[] = [
    { label: "Company", value: project.companyName },
    { label: "Industry", value: project.industry ?? "—" },
    { label: "Deal size", value: project.estValue ?? "—" },
    { label: "Prior docs", value: priorDocsLabel },
  ];

  return {
    skill,
    firm,
    project,
    chainedOutputs,
    missingPrereqs,
    inputs,
    sourceDocs,
    autoContext,
  };
}
