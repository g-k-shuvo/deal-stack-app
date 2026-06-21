import { describe, it, expect, vi, beforeEach } from "vitest";
import { generate, verifyKey, SchemaValidationError, DEFAULT_MODEL } from "@/lib/ai/client";
import type { AnthropicLike } from "@/lib/ai/client";
import { requireSkill } from "@/lib/skills/registry";
import type { BuiltPrompt } from "@/lib/engine/prompt";

const skill = requireSkill("sell.cim");
const prompt: BuiltPrompt = { system: "sys", user: "do the thing" };
const valid = { title: "CIM", sections: [{ heading: "Executive Summary" }] };
const invalid = { title: "CIM" }; // missing sections

function toolUse(input: unknown) {
  return { content: [{ type: "tool_use", input }] };
}

function mockClient(create: ReturnType<typeof vi.fn>): AnthropicLike {
  return { messages: { create } };
}

beforeEach(() => {
  delete process.env.DEFAULT_CLAUDE_MODEL;
});

describe("generate", () => {
  it("returns validated content on a good first response", async () => {
    const create = vi.fn().mockResolvedValue(toolUse(valid));
    const res = await generate({ skill, prompt, apiKey: "k", client: mockClient(create) });
    expect(res.content).toEqual(valid);
    expect(res.model).toBe(DEFAULT_MODEL);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("honors an explicit model override", async () => {
    const create = vi.fn().mockResolvedValue(toolUse(valid));
    const res = await generate({ skill, prompt, apiKey: "k", model: "claude-sonnet-4-6", client: mockClient(create) });
    expect(res.model).toBe("claude-sonnet-4-6");
  });

  it("auto-retries once on schema failure, then succeeds", async () => {
    const create = vi.fn().mockResolvedValueOnce(toolUse(invalid)).mockResolvedValueOnce(toolUse(valid));
    const res = await generate({ skill, prompt, apiKey: "k", client: mockClient(create) });
    expect(res.content).toEqual(valid);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("throws SchemaValidationError when both attempts fail", async () => {
    const create = vi.fn().mockResolvedValue(toolUse(invalid));
    await expect(generate({ skill, prompt, apiKey: "k", client: mockClient(create) })).rejects.toBeInstanceOf(
      SchemaValidationError,
    );
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("throws when no tool_use block is returned", async () => {
    const create = vi.fn().mockResolvedValue({ content: [{ type: "text" }] });
    await expect(generate({ skill, prompt, apiKey: "k", client: mockClient(create) })).rejects.toThrow("tool_use");
  });

  it("attaches PDF source docs and text docs as content blocks", async () => {
    const create = vi.fn().mockResolvedValue(toolUse(valid));
    await generate({
      skill,
      prompt,
      apiKey: "k",
      client: mockClient(create),
      sourceDocs: [
        { filename: "fin.pdf", format: "pdf", base64: "QkFTRTY0" },
        { filename: "notes.txt", format: "txt", text: "hello" },
      ],
    });
    const params = create.mock.calls[0]?.[0] as { messages: Array<{ content: Array<Record<string, unknown>> }> };
    const blocks = params.messages[0]?.content ?? [];
    expect(blocks.some((b) => b.type === "document")).toBe(true);
    expect(blocks.some((b) => b.type === "text" && String(b.text).includes("hello"))).toBe(true);
    // tool_choice forces the structured tool
    const full = create.mock.calls[0]?.[0] as { tool_choice: { type: string; name: string } };
    expect(full.tool_choice).toEqual({ type: "tool", name: "emit_document" });
  });
});

describe("verifyKey", () => {
  it("returns true when the call succeeds", async () => {
    const create = vi.fn().mockResolvedValue({ content: [] });
    expect(await verifyKey("k", mockClient(create))).toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
  });
  it("returns false when the call throws", async () => {
    const create = vi.fn().mockRejectedValue(new Error("401"));
    expect(await verifyKey("k", mockClient(create))).toBe(false);
  });
});
