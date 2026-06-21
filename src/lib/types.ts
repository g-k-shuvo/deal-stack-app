// Shared domain types (PRD §11, §15).

export type Track = "sell" | "buy";
export type SkillFormat = "docx" | "xlsx" | "pptx";
export type Archetype = "narrative" | "model" | "data";

export interface FirmContext {
  name: string;
  description?: string;
  advisorBio?: string;
  aiInstructions?: string;
  defaults?: Record<string, string>;
}

export interface ProjectContext {
  companyName: string;
  website?: string;
  industry?: string;
  location?: string;
  type: Track;
  estValue?: string;
  ebitda?: string;
  multiple?: string;
  structure?: string;
  contactName?: string;
  contactTitle?: string;
  contactPhone?: string;
}

/** A prior skill output available for chaining. */
export interface PriorOutput {
  skillKey: string;
  skillName: string;
  preview: string;
}

/** An uploaded client document used as generation context. */
export interface SourceDoc {
  filename: string;
  format: string;
  text?: string;
  base64?: string;
}
