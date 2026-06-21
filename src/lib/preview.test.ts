import { describe, it, expect } from "vitest";
import { toPreviewMarkdown } from "@/lib/preview";

describe("toPreviewMarkdown", () => {
  it("renders narrative content", () => {
    const md = toPreviewMarkdown({
      title: "CIM",
      subtitle: "Acme",
      preparedBy: "Firm",
      date: "2026",
      sections: [{ heading: "Summary", paragraphs: ["p"], bullets: ["b"] }],
    });
    expect(md).toContain("# CIM");
    expect(md).toContain("**Acme**");
    expect(md).toContain("## Summary");
    expect(md).toContain("- b");
  });

  it("renders minimal narrative (no optional fields)", () => {
    const md = toPreviewMarkdown({ title: "T", sections: [{ heading: "H" }] });
    expect(md).toContain("# T");
    expect(md).toContain("## H");
  });

  it("renders tabular data as a markdown table", () => {
    const md = toPreviewMarkdown({ title: "Buyers", columns: ["Buyer", "Type"], rows: [["A", "Strategic"]] });
    expect(md).toContain("| Buyer | Type |");
    expect(md).toContain("| A | Strategic |");
  });

  it("renders valuation with and without narrative", () => {
    const withN = toPreviewMarkdown({
      title: "Valuation",
      narrative: "Range $4M",
      assumptions: [{ label: "Multiple", value: "5.0x" }],
      inputs: { ebitda: 840000 },
    });
    expect(withN).toContain("Range $4M");
    expect(withN).toContain("**Multiple:** 5.0x");
    expect(withN).toContain("ebitda: 840000");

    const noN = toPreviewMarkdown({ title: "V", assumptions: [], inputs: {} });
    expect(noN).toContain("# V");
  });

  it("falls back to JSON for unknown shapes and stringifies primitives", () => {
    expect(toPreviewMarkdown({ random: true })).toContain("```json");
    expect(toPreviewMarkdown(42)).toBe("42");
  });
});
