import ExcelJS from "exceljs";
import type { DataContent, ValuationContent } from "@/lib/skills/schemas";
import type { Renderer, RenderInput, RenderResult } from "@/lib/render/types";
import { MIME } from "@/lib/render/types";
import { buildFilename } from "@/lib/util/filename";

// XLSX renderer (PRD §13 REN-02). Valuation = formulas live in the sheet; the AI
// supplies inputs only (PRD §5.4 defensible numbers). Data skills = tabular dump.

function isData(c: unknown): c is DataContent {
  if (!c || typeof c !== "object") return false;
  const o = c as Record<string, unknown>;
  return Array.isArray(o.columns) && Array.isArray(o.rows);
}
function isValuation(c: unknown): c is ValuationContent {
  if (!c || typeof c !== "object") return false;
  const o = c as Record<string, unknown>;
  return !!o.inputs && Array.isArray(o.assumptions);
}

export const xlsxRenderer: Renderer = {
  async render(input: RenderInput): Promise<RenderResult> {
    const { content, skill, company, version } = input;
    const wb = new ExcelJS.Workbook();

    if (isValuation(content)) {
      const ws = wb.addWorksheet("Valuation");
      ws.addRow([content.title]);
      ws.addRow([]);
      ws.addRow(["Revenue (TTM)", content.inputs.revenueTtm ?? 0]);
      const eb = ws.addRow(["EBITDA", content.inputs.ebitda ?? 0]);
      const add = ws.addRow(["Owner add-backs", content.inputs.ownerAddbacks ?? 0]);
      const adj = ws.addRow(["Adjusted EBITDA", { formula: `B${eb.number}+B${add.number}` }]);
      const lo = ws.addRow(["Multiple (low)", content.inputs.multipleLow ?? 0]);
      const hi = ws.addRow(["Multiple (high)", content.inputs.multipleHigh ?? 0]);
      ws.addRow(["Valuation (low)", { formula: `B${adj.number}*B${lo.number}` }]);
      ws.addRow(["Valuation (high)", { formula: `B${adj.number}*B${hi.number}` }]);
      ws.addRow([]);
      ws.addRow(["Assumptions"]);
      for (const a of content.assumptions) ws.addRow([a.label, a.value]);
    } else if (isData(content)) {
      const ws = wb.addWorksheet("Data");
      ws.addRow([content.title]);
      ws.addRow([]);
      ws.addRow(content.columns);
      for (const r of content.rows) ws.addRow(r);
    } else {
      throw new Error("xlsx renderer requires data or valuation content");
    }

    const buf = await wb.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(buf as ArrayBuffer),
      filename: buildFilename(skill.name, version, company, "xlsx"),
      mime: MIME.xlsx,
    };
  },
};
