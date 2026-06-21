import { decryptSecret } from "@/lib/crypto";
import { generate, verifyKey } from "@/lib/ai/client";
import { mockContent } from "@/lib/ai/mock";
import { buildPrompt } from "@/lib/engine/prompt";
import { validateContent } from "@/lib/engine/validate";
import type { AssembledContext } from "@/lib/engine/context";
import type { Firm } from "@/lib/data/model";

export interface GenResult {
  content: unknown;
  model: string;
}

/**
 * Generate a skill output. Uses the firm's encrypted Anthropic key when present
 * (and not forced to mock); otherwise a deterministic, schema-valid mock so the
 * app works offline and E2E is hermetic. PRD AI-01/02/08.
 */
export async function generateForSkill(
  ctx: AssembledContext,
  firm: Firm,
  styleExample?: string,
): Promise<GenResult> {
  const forceMock = process.env.DCC_AI_MODE === "mock";
  if (!forceMock && firm.apiKeyEncrypted) {
    const apiKey = decryptSecret(firm.apiKeyEncrypted);
    const prompt = buildPrompt(ctx, styleExample);
    return generate({ skill: ctx.skill, prompt, apiKey, sourceDocs: ctx.sourceDocs });
  }
  const content = mockContent(ctx);
  // Mock must satisfy the same contract the model is held to.
  const { ok, errors } = validateContent(ctx.skill.outputSchema, content);
  if (!ok) throw new Error(`Mock content invalid: ${errors.join("; ")}`);
  return { content, model: "mock" };
}

/** Verify the firm's stored key (PRD AI-09). Mock mode always passes. */
export async function verifyFirmKey(firm: Firm): Promise<boolean> {
  if (process.env.DCC_AI_MODE === "mock") return true;
  if (!firm.apiKeyEncrypted) return false;
  return verifyKey(decryptSecret(firm.apiKeyEncrypted));
}
