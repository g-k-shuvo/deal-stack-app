import { describe, it, expect } from "vitest";
import { validateContent } from "@/lib/engine/validate";
import { narrativeSchema, dataSchema } from "@/lib/skills/schemas";

describe("validateContent", () => {
  it("passes valid narrative content", () => {
    const res = validateContent(narrativeSchema, {
      title: "CIM",
      sections: [{ heading: "Executive Summary", paragraphs: ["..."] }],
    });
    expect(res.ok).toBe(true);
    expect(res.errors).toEqual([]);
  });

  it("fails and reports errors for invalid content (root path)", () => {
    const res = validateContent(narrativeSchema, { title: "CIM" }); // missing sections
    expect(res.ok).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.errors.some((e) => e.startsWith("(root)"))).toBe(true);
  });

  it("reports a nested instance path for deep errors", () => {
    const res = validateContent(narrativeSchema, { title: "CIM", sections: [{}] }); // section missing heading
    expect(res.ok).toBe(false);
    expect(res.errors.some((e) => e.includes("/sections/0"))).toBe(true);
  });

  it("validates tabular data content", () => {
    expect(validateContent(dataSchema, { title: "T", columns: ["A"], rows: [["1"]] }).ok).toBe(true);
    expect(validateContent(dataSchema, { title: "T", columns: [] }).ok).toBe(false);
  });
});
