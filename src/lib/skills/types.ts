import type { Track, SkillFormat, Archetype } from "@/lib/types";
import type { JsonSchema } from "@/lib/skills/schemas";

export type InputType = "text" | "textarea" | "number" | "select" | "toggle";

export interface InputField {
  name: string;
  label: string;
  type: InputType;
  /** Dotted context path that pre-fills this field (e.g. "project.companyName"). */
  autoFrom?: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

export interface Skill {
  key: string;
  track: Track;
  step: number;
  name: string;
  description: string;
  phase: string;
  estMinutes: number;
  format: SkillFormat;
  archetype: Archetype;
  badges?: Array<"new" | "updated">;
  /** Skill keys whose outputs feed this one (PRD §11.3). */
  chainsFrom: string[];
  inputs: InputField[];
  /** Skill-specific task instruction appended to the prompt. */
  instruction: string;
  /** JSON Schema the model output must satisfy (tool-use, PRD AI-02). */
  outputSchema: JsonSchema;
  templateId?: string;
  /** Per-skill model override (PRD AI-07). */
  model?: string;
}
