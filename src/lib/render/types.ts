import type { Skill } from "@/lib/skills/types";

export interface RenderInput {
  /** Validated content JSON (shape depends on the skill's archetype). */
  content: unknown;
  skill: Skill;
  company: string;
  version: number;
}

export interface RenderResult {
  buffer: Buffer;
  filename: string;
  mime: string;
}

export interface Renderer {
  render(input: RenderInput): Promise<RenderResult>;
}

export const MIME = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
} as const;
