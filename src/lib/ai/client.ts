import Anthropic from "@anthropic-ai/sdk";
import type { Skill } from "@/lib/skills/types";
import type { BuiltPrompt } from "@/lib/engine/prompt";
import type { SourceDoc } from "@/lib/types";
import { validateContent } from "@/lib/engine/validate";

// Anthropic integration (PRD §14). Structured output via tool-use + one auto-retry
// on schema failure (AI-02, AI-08). `client` is injectable so tests never hit the network.

export interface AnthropicLike {
  messages: {
    create(params: Record<string, unknown>): Promise<{
      content: Array<{ type: string; input?: unknown }>;
    }>;
  };
}

export class SchemaValidationError extends Error {
  constructor(public errors: string[]) {
    super(`Output failed schema validation: ${errors.join("; ")}`);
    this.name = "SchemaValidationError";
  }
}

export interface GenerateArgs {
  skill: Skill;
  prompt: BuiltPrompt;
  apiKey: string;
  model?: string;
  client?: AnthropicLike;
  sourceDocs?: SourceDoc[];
  maxTokens?: number;
}

export interface GenerateResult {
  content: unknown;
  model: string;
}

export const DEFAULT_MODEL = "claude-opus-4-8";
const TOOL_NAME = "emit_document";

function buildUserContent(
  prompt: BuiltPrompt,
  sourceDocs: SourceDoc[],
): Array<Record<string, unknown>> {
  const blocks: Array<Record<string, unknown>> = [];
  for (const doc of sourceDocs) {
    if (doc.base64 && doc.format === "pdf") {
      blocks.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: doc.base64 },
      });
    } else if (doc.text) {
      blocks.push({ type: "text", text: `Document ${doc.filename}:\n${doc.text}` });
    }
  }
  blocks.push({ type: "text", text: prompt.user });
  return blocks;
}

export async function generate(args: GenerateArgs): Promise<GenerateResult> {
  const model =
    args.model ?? args.skill.model ?? process.env.DEFAULT_CLAUDE_MODEL ?? DEFAULT_MODEL;
  const client: AnthropicLike =
    args.client ?? (new Anthropic({ apiKey: args.apiKey }) as unknown as AnthropicLike);
  const sourceDocs = args.sourceDocs ?? [];
  const maxTokens = args.maxTokens ?? 8000;
  const baseContent = buildUserContent(args.prompt, sourceDocs);

  let lastErrors: string[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    const messages: Array<Record<string, unknown>> = [{ role: "user", content: baseContent }];
    if (attempt === 1) {
      messages.push({
        role: "user",
        content: `The previous output failed validation: ${lastErrors.join("; ")}. Return corrected JSON via the ${TOOL_NAME} tool.`,
      });
    }
    const res = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: args.prompt.system,
      tools: [
        {
          name: TOOL_NAME,
          description: "Return the structured document content.",
          input_schema: args.skill.outputSchema,
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
      messages,
    });
    const block = res.content.find((b) => b.type === "tool_use");
    if (!block || block.input === undefined) {
      throw new Error("Model did not return a tool_use block");
    }
    const { ok, errors } = validateContent(args.skill.outputSchema, block.input);
    if (ok) return { content: block.input, model };
    lastErrors = errors;
  }
  throw new SchemaValidationError(lastErrors);
}

/** Minimal live call to confirm a key authenticates (PRD AI-09). */
export async function verifyKey(apiKey: string, client?: AnthropicLike, model?: string): Promise<boolean> {
  const c: AnthropicLike = client ?? (new Anthropic({ apiKey }) as unknown as AnthropicLike);
  const m = model ?? process.env.DEFAULT_CLAUDE_MODEL ?? DEFAULT_MODEL;
  try {
    await c.messages.create({ model: m, max_tokens: 8, messages: [{ role: "user", content: "ping" }] });
    return true;
  } catch {
    return false;
  }
}
