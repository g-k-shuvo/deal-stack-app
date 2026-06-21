import { describe, it, expect } from "vitest";
import ExcelJS from "exceljs";
import { xlsxRenderer } from "@/lib/render/xlsx";
import { MIME } from "@/lib/render/types";
import { requireSkill } from "@/lib/skills/registry";
import type { ValuationContent, DataContent } from "@/lib/skills/schemas";

const valSkill = requireSkill("sell.valuation");
const dataSkill = requireSkill("sell.data_room_checklist");

const valuation: ValuationContent = {
  title: "Valuation — Midwest HVAC",
  inputs: { revenueTtm: 5_600_000, ebitda: 840_000, ownerAddbacks: 120_000, multipleLow: 4, multipleHigh: 6 },
  assumptions: [{ label: "Method", value: "EBITDA multiple" }],
  narrative: "Indicative range.",
};

const data: DataContent = {
  title: "Data room checklist",
  columns: ["Category", "Document", "Notes"],
  rows: [["Financials", "3-yr P&L", "required"]],
};

describe("xlsxRenderer", () => {
  it("renders a valuation model (valid xlsx with formulas) and loads back", async () => {
    const res = await xlsxRenderer.render({ content: valuation, skill: valSkill, company: "Midwest HVAC", version: 1 });
    expect(res.buffer[0]).toBe(0x50); // PK
    expect(res.filename).toBe("Business_valuation_v1_Midwest_HVAC.xlsx");
    expect(res.mime).toBe(MIME.xlsx);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(res.buffer as unknown as Parameters<typeof wb.xlsx.load>[0]);
    expect(wb.getWorksheet("Valuation")).toBeDefined();
  });

  it("renders a valuation with missing inputs (fallbacks)", async () => {
    const res = await xlsxRenderer.render({
      content: { title: "V", inputs: {}, assumptions: [] },
      skill: valSkill,
      company: "X",
      version: 1,
    });
    expect(res.buffer[0]).toBe(0x50);
  });

  it("renders tabular data", async () => {
    const res = await xlsxRenderer.render({ content: data, skill: dataSkill, company: "Acme", version: 2 });
    expect(res.buffer[0]).toBe(0x50);
    expect(res.filename).toContain("_v2_Acme.xlsx");
  });

  it("throws on unsupported content", async () => {
    await expect(
      xlsxRenderer.render({ content: { foo: 1 }, skill: dataSkill, company: "X", version: 1 }),
    ).rejects.toThrow("data or valuation");
  });
});
