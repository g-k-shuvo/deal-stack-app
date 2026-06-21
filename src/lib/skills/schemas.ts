// Output content shapes + JSON Schemas. The model returns JSON matching these
// (PRD §5.2 structured generation); renderers turn the JSON into Office files.

export type JsonSchema = Record<string, unknown>;

// ---- narrative (DOCX / PPTX) — covers most skills ----
export interface NarrativeSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}
export interface NarrativeContent {
  title: string;
  subtitle?: string;
  preparedBy?: string;
  date?: string;
  sections: NarrativeSection[];
}

export const narrativeSchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "sections"],
  properties: {
    title: { type: "string", minLength: 1 },
    subtitle: { type: "string" },
    preparedBy: { type: "string" },
    date: { type: "string" },
    sections: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading"],
        properties: {
          heading: { type: "string", minLength: 1 },
          paragraphs: { type: "array", items: { type: "string" } },
          bullets: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

// ---- tabular data (XLSX data skills) ----
export interface DataContent {
  title: string;
  columns: string[];
  rows: string[][];
}
export const dataSchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "columns", "rows"],
  properties: {
    title: { type: "string", minLength: 1 },
    columns: { type: "array", minItems: 1, items: { type: "string" } },
    rows: { type: "array", items: { type: "array", items: { type: "string" } } },
  },
};

// ---- valuation model (XLSX) — AI supplies inputs/assumptions only (PRD §5.4) ----
export interface ValuationContent {
  title: string;
  inputs: {
    revenueTtm?: number;
    ebitda?: number;
    ownerAddbacks?: number;
    multipleLow?: number;
    multipleHigh?: number;
  };
  assumptions: { label: string; value: string }[];
  narrative?: string;
}
export const valuationSchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "inputs", "assumptions"],
  properties: {
    title: { type: "string", minLength: 1 },
    inputs: {
      type: "object",
      additionalProperties: false,
      properties: {
        revenueTtm: { type: "number" },
        ebitda: { type: "number" },
        ownerAddbacks: { type: "number" },
        multipleLow: { type: "number" },
        multipleHigh: { type: "number" },
      },
    },
    assumptions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "value"],
        properties: { label: { type: "string" }, value: { type: "string" } },
      },
    },
    narrative: { type: "string" },
  },
};
