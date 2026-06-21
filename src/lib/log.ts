// Structured server logging (PRD NFR-11). Never log secrets or document bodies.

type Json = Record<string, unknown>;

export function logEvent(event: string, data: Json = {}): void {
  try {
    console.info(JSON.stringify({ ts: new Date().toISOString(), event, ...data }));
  } catch {
    /* logging must never throw */
  }
}
