import Ajv from "ajv";
import addFormats from "ajv-formats";
import type { JsonSchema } from "@/lib/skills/schemas";

// JSON Schema validation of model output (PRD AI-02, §11.2 step 4).

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateContent(schema: JsonSchema, data: unknown): ValidationResult {
  const validate = ajv.compile(schema);
  const ok = validate(data) as boolean;
  if (ok) return { ok: true, errors: [] };
  const errors = (validate.errors ?? []).map((e) =>
    `${e.instancePath || "(root)"} ${e.message ?? "is invalid"}`.trim(),
  );
  return { ok: false, errors };
}
